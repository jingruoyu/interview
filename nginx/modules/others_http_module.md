## `ngx_http_access_module`访问IP限制

访问IP限制通过`ngx_http_access_module`模块实现，也可以通过密码限制访问，使用satisfy指令进行访问限制条件的控制

* `allow address | CIDR | all`

    允许指定的网络地址访问

* `deny address | CIDR | all`

    拒绝指定的网络地址访问

使用示例：

```
location / {
    deny  192.168.1.1;
    allow 192.168.1.0/24;
    allow 10.1.1.0/16;
    allow 2001:0db8::/32;
    deny  all;
}
```

## ngx_http_addition_module过滤模块

ngx_http_addition_module 是一个过滤模块，它可以在回复正文前后加上内容。例如请求index.html，可以在index.html的内容前插入链接指向的内容

* `add_before_body uri`

    在回复正文前插入一段文字，nginx会发起一个子请求获取链接指向的内容

* `add_after_body uri`

    在回复正文后插入一段文字，请求方式同上

* `addition_types mime-type ...;`

    指定生效的回复MIME类型，默认值为text/html

## ngx_http_proxy_module请求代理模块

### 请求转发

* `proxy_pass URL;`：设置后端服务器的协议和地址，还可以设置可选的URI用于定义本地路径和后端服务器的映射关系

    协议可以使用http或者https，地址可以使用域名、IP地址加端口号或者Unix域套接字路径定义，其中可以使用变量。

    如果一个域名被解析到多个地址，将采用轮换的方式使用，或者可以使用服务器组的形式定义地址（upstream负载均衡）

    地址替换规则：

    * 如果使用URI，将请求路径与配置路径的匹配部分替换为指令中定义的URI

        ```
        location /name/ {
            proxy_pass http://127.0.0.1/remote/;
        }
        ```

    * 如果不使用URI，传送到后端服务器的请求URI一般是客户端发起的原始URI，如果nginx改变了请求URI，则传送的URI是nginx改变以后完整的规范化URI

        ```
        location /some/path/ {
            proxy_pass http://127.0.0.1;
        }
        ```

    一些情况下无法确定URI应该被替换的部分：

    * 使用正则表达式定义路径，proxy_pass路径中不应该使用URI
    * 需要代理的路径中，使用rewrite指令改变了URI并使用break参数，**之后使用proxy_pass将会被忽略**，改变后的URI将被发送给后端服务器

        ```
        location /name/ {
            rewrite    /name/([^/]+) /users?name=$1 break;
            proxy_pass http://127.0.0.1;
        }
        ```

* `proxy_redirect`：设置后端服务器“Location”响应头和“Refresh”响应头的替换文本

    ```
    proxy_redirect default; // 默认
    proxy_redirect off;
    proxy_redirect redirect replacement;
    ```

    * replacement参数

        ```
        proxy_redirect http://localhost:8000/two/ http://frontend/one/;
        proxy_redirect http://localhost:8000/two/ /;
        ```

        * 第一项将响应头中location字段的相应路径替换为replacement
        * 第二项省略服务器名，将使用**代理服务器的主域名和端口号**进行替换，如果端口号是80，可以不加
        * 可以使用正则表达式，在redirect中可以包含命名匹配组和位置匹配组，在replacement中可以进行引用

        ```
        proxy_redirect ~^(http://[^:]+):\d+(/.+)$ $1$2;
        proxy_redirect ~*/user/([^/]+)/(.+)$      http://$1.example.com/$2;
        ```

        **使用proxy_redirect可以为相对地址的重定向添加域名**

        ```
        proxy_redirect / /;
        ```

    * default参数

        default参数指定的默认替换使用了location和proxy_pass指令参数，当proxy_pass使用变量作为参数时，不允许本指令使用default参数

    * off参数

        off参数可以使所有相同配置级别的proxy_redirect指令失效

    可以同时指定多个`proxy__redirect`指令

    ```
    proxy_redirect default;
    proxy_redirect http://localhost:8000/  /;
    proxy_redirect http://www.example.com/ /;
    ```

### 缓存相关

**`ngx_http_proxy_module`模块进行请求代理**

* `proxy_buffer_size size`：设置缓冲区大小为size，默认值为4k或8k

    nginx从被代理的服务器读取响应时（此时是response的返回阶段），使用该缓冲区保存响应的开始部分。这部分通常包含着一个小小的响应头。该缓冲区大小默认等于proxy_buffers指令设置的一块缓冲区的大小，但它也可以被设置得更小

* `proxy_buffering on | off`：代理的时候开启或关闭缓冲后端服务器的响应，默认开启

    * 开启缓冲，nginx尽可能快的从北大里的服务器接收响应，再存入proxy_buffers和proxy_buffer_size指令设置的缓冲区中
    * 关闭缓冲，收到响应后，nginx立刻将其同步传给客户端，不会尝试从被代理的服务器读取整个请求，而是将proxy_buffer_size指令设定的大小作为一次读取的最大长度

    响应头“X-Accel-Buffering”传递“yes”或“no”可以动态地开启或关闭代理的缓冲功能。 这个能力可以通过proxy_ignore_headers指令关闭

* `proxy_buffers number size`：设置每个连接的缓冲区数量为number，默认为8，每块缓冲区大小为size，默认值与平台相关，为一个内存页的大小，4K或者8K
* `proxy_busy_buffers_size size`

    开启缓冲响应功能之后，在没有读取到全部响应的情况下，当缓冲内容大小打到size后，nginx会向客户端发送响应，直到响应小于此值。默认取值是proxy_buffers和proxy_buffer_size单块缓冲区大小的两倍

    同时剩余的缓冲区可以用于接收响应，需要时可以将一部分内容缓冲到临时文件。

* `proxy_cache zone | off`：指定用于页面缓存的共享内存。同一块共享内存可以在多个地方使用，off参数可以屏蔽父级上下文中的参数设置
* `proxy_cache_bypass string ...`：定义nginx不从缓存读取响应的条件

    如果至少一个字符串条件非空而且非“0”，nginx就不会从缓存中去取响应，可以搭配`proxy_no_cache`使用

    ```
    proxy_cache_bypass $cookie_nocache $arg_nocache$arg_comment;
    proxy_cache_bypass $http_pragma    $http_authorization;
    ```
* `proxy_no_cache string ...;`：定义不将响应写入缓存的条件

    如果至少一个字符串条件非空而且非“0”，nginx就不将响应存入缓存

    ```
    proxy_no_cache $cookie_nocache $arg_nocache$arg_comment;
    proxy_no_cache $http_pragma    $http_authorization;
    ```

* `proxy_cache_key string`：定义如何生成缓存的key，默认值`$scheme$proxy_host$request_uri`

* `proxy_cache_lock on | off`：请求锁，默认关闭

    开启后，多个客户端请求一个缓存中不存在的文件时，只有第一个请求会被允许发送至客户端获取文件，并根据proxy_cache_key在缓存中生成新条目。

    其他请求相同条目的请求将会一直等待，直到缓存中出现相对应的内容，或者proxy_cache_lock_timeout指令超时后释放

    指令可以使得在增加新的缓存条目时，访问源服务器的次数最少

* `proxy_cache_lock_timeout`：设置请求锁超时时间，超时后其他请求将会被释放，默认5s
* `proxy_cache_min_uses number`：设置请求被缓存的最小请求次数，默认为1
* `proxy_cache_path path [levels=levels] keys_zone=name:size [inactive=time] [max_size=size] [loader_files=number] [loader_sleep=time] [loader_threshold=time]`

    设置缓存路径和其他参数

* `proxy_cache_use_stale error | timeout | invalid_header | updating | http_500 | http_502 | http_503 | http_504 | http_404 | off`

    定义在何种情况下，如果后端服务器出现状况，nginx可以使用过期缓存。这条指令的参数与proxy_next_upstream指令的参数相同，默认为off

    updating参数允许nginx在正在更新缓存的情况下使用过期的缓存作为响应。这样做可以使更新缓存数据时，访问源服务器的次数最少

* `proxy_cache_valid [code ...] time`：为不同的状态码设置不同的缓存时间

    ```
    proxy_cache_valid 200 302 10m;
    proxy_cache_valid 404      1m;
    proxy_cache_valid 5m;
    proxy_cache_valid any      1m;
    ```

    * 只设置缓存时间时，只有200、300和302的响应会被缓存
    * code设置为any时，可以缓存任何响应

    缓存参数可以直接在响应头中设置，优先级高于本条指令

    * “X-Accel-Expires”响应头可以以秒为单位设置响应的缓存时间，如果值为0，表示禁止缓存响应，如果值以@开始，表示自1970年1月1日以来的秒数，响应一直会被缓存到这个绝对时间点
    * 如果不含“X-Accel-Expires”响应头，缓存参数仍可能被“Expires”或者“Cache-Control”响应头设置
    * 如果响应头含有“Set-Cookie”，响应将不能被缓存

    这些响应头的处理过程可以使用proxy_ignore_headers指令忽略

### 响应头替换

* `proxy_cookie_domain`：设置“Set-Cookie”响应头中的domain属性的替换文本，默认为off

    ```
    proxy_cookie_domain srcdomain replacement;
    ```

    如果后端服务器返回的“Set-Cookie”响应头属性中domain指定为指令中的srcdomain，匹配过程大小写不敏感会将其替换为replacement。

    * 指令中可以使用变量或正则表达式，正则表达式使用`~`开始
    * 可以同时定义多条`proxy_cookie_domain`指令
    * **off参数可以取消当前配置级别的所有`proxy_cookie_domain`指令**

    ```
    proxy_cookie_domain www.$host $host;
    proxy_cookie_domain localhost example.org;
    proxy_cookie_domain ~\.([a-z]+\.[a-z]+)$ $1;
    ```

* `proxy_cookie_path`：设置“Set-Cookie”响应头中的path属性的替换文本，默认为off

    ```
    proxy_cookie_path path replacement
    ```

    替换掉后端服务器返回的“Set-Cookie”响应头path属性中的相应字符串，`proxy_cookie_path /two/ /`将`path=/two/some/uri/`替换为`/some/uri/`

    * path和replacement中可以包含变量和正则表达式，大小写敏感的匹配使用`~`开始，大小写不敏感的匹配使用`~*`开始
    * 可以同时定义多条`proxy_cookie_path`指令
    * **off参数可以取消当前配置级别的所有`proxy_cookie_path`指令**

### http请求处理

* `proxy_set_header field value;`：允许重新定义或者添加发往后端服务器的请求头，如果将某一请求头设置为空字符串，则不会将其传递给后端服务器

    默认值：

    ```
    proxy_set_header Host $proxy_host;
    proxy_set_header Connection close;
    ```

    如果不想改变请求头中host的值，有两种做法

    * 设置为$http_host变量，但是如果客户端请求头中不包含此值，那么传递到后端服务器的请求也不含这个头部
    * 设置为$host变量，如果请求头包含Host则为Host字段的值，如果不包含则为虚拟机的主域名。可以将其与后端服务器的端口一起传送

        ```
        proxy_set_header Host       $host:$proxy_port;
        ```

* `proxy_hide_header field`：设置隐藏的响应头，不发送给客户端

    nginx默认不会将“Date”、“Server”、“X-Pad”，和“X-Accel-...”响应头发送给客户端，`proxy_hide_header`设置额外的响应头，也不会发送给客户端

    **如果希望允许向客户端传递某些响应头，可以使用proxy_pass_header指令**

* `proxy_ignore_headers field ...;`：不处理后端服务器返回的指定响应头

    取值可以为如下响应头

    * “X-Accel-Expires”，“Expires”，“Cache-Control”，和“Set-Cookie” 设置响应缓存的参数；
    * “X-Accel-Redirect”执行到指定URI的内部跳转；
    * “X-Accel-Limit-Rate”设置响应到客户端的传输速率限制；
    * “X-Accel-Buffering”启动或者关闭响应缓冲；
    * “X-Accel-Charset”设置响应所需的字符集

* `proxy_pass_header field;`：允许将被屏蔽的后端服务器响应头到客户端

* `proxy_http_version 1.0 | 1.1`：设置代理使用的HTTP版本，默认1.0
* `proxy_ignore_client_abort on | off;`：设置当客户端在响应传输完成前关闭连接时，nginx是否关闭后端连接，默认off
* `proxy_intercept_errors on | off`：当后端服务器的状态响应码大于400时，是否将响应直接发送给客户端，或者将响应转发给nginx的error_page进行处理

* `proxy_next_upstream error | timeout | invalid_header | http_500 | http_502 | http_503 | http_504 | http_404 | off ...`

    指定在何种情况下一个失败的请求应该被发送到下一台后端服务器，默认值为error和timeout

    **只有在没有向客户端发送任何数据之前，请求转发到下一台服务器才可行**。如果传输响应到客户端是出错或者超市，此类错误不可能恢复

* `proxy_read_timeout`：从后端服务器读取响应的超时，默认60s

    此超时是指相邻两次读操作之间的最长时间间隔，而不是整个响应传输完成的最长时间。如果后端服务器在超时时间段内没有传输任何数据，连接将被关闭。

* `proxy_send_timeout time`：向后端服务器传输请求的超时，默认60s

    超时是指相邻两次写操作之间的最长时间间隔，不是整个请求传输完成的最长时间。如果后端服务器在超时时间内没有接收到任何数据，连接将被关闭

* `proxy_connect_timeout time`：设置与后端服务器建立连接的超时时间，一般不可能大于75秒

* `proxy_ssl_session_reuse on | off;`：决定是否重用与后端服务器的SSL会话。如果日志中出现“SSL3_GET_FINISHED:digest check failed”错误，请尝试关闭会话重用。

* `proxy_store on | off | string;`：设置将文件保存到磁盘功能，默认值为off

    * on，nginx会将文件保存到alias或者root指令设置的路径中
    * off，nginx关闭文件保存功能
    * string，指定保存的路径和文件名，可以包含变量。如`proxy_store /data/www$original_uri;`

    文件保存相关：

    * 保存文件的修改时间根据请求头中的Last-Modified进行设置
    * 响应均为先写入临时文件，如果存储位置和临时文件位于不同文件系统中，需要进行拷贝操作，如果是同一个文件系统，仅需重命名即可。

    故推荐将保存文件的路径与proxy_temp_path设置的临时文件路径位于同一个文件系统中

* `proxy_store_access users:permissions ...;`设置新创建文件的访问权限，默认值`user:rw`

    可以设置user、group和all三种角色的权限，指定了任何group或者all的权限后，可以省略user的访问权限

    ```
    proxy_store_access group:rw all:r;
    ```
* `proxy_temp_path path [level1 [level2 [level3]]];`：定义从后端服务器接收的临时文件的存放路径，默认值为proxy_temp

* `proxy_temp_file_write_size size;`：设置nginx每次写数据到临时文件的size(大小)限制，默认值为8k或者16k

    默认值为`proxy_buffer_size`和`proxy_buffer`指定的每块缓冲区大小的两倍，最大值为`proxy_max_temp_file_size`

* `proxy_max_temp_file_size size`：指定临时文件的最大容量，打开相应缓存后，当缓存区不够时，会将部分响应存储在临时文件中。，默认1024M

    将取值设为0将禁止响应写入缓存文件

### 内部变量

模块的内部变量可以用于`proxy_set_header`中构造请求头

**核心模块的变量可以全局访问**

* `$proxy_host`：后端服务器的主机名和端口
* `$proxy_port`：后端服务器端口
* `$proxy_add_x_forwarded_for`：取值为将$remote_addr变量值添加在客户端“X-Forwarded-For”请求头对应值的后面，并以逗号分隔。

    如果客户端请求未携带“X-Forwarded-For”请求头，$proxy_add_x_forwarded_for变量值将与$remote_addr变量相同

## ngx_http_rewrite_module模块

**注意此处模块的概念为`ngx_http_rewrite_module`和`ngx_http_proxy_module`此类模块**

* `break`：停止处理当前这一轮的ngx_http_rewrite_module模块，跳过在他们之后的所有rewrite模块指令。
* `if (condition) { ... }`：if指令会从上一层配置中继承配置

    条件可以为下列情况：

    * 变量名：如果变量值为空或者是以“0”开始的字符串，则条件为假
    * 使用“=”和“!=”运算符比较变量和字符串
    * 使用“~”（大小写敏感）和“~\*”（大小写不敏感）运算符匹配变量和正则表达式。

        正则表达式可以包含匹配组，匹配结果后续可以使用变量$1..$9引用。如果正则表达式中包含字符“}”或者“;”，整个表达式应该被包含在单引号或双引号的引用中

    * 使用“-f”和“!-f”运算符检查文件是否存在
    * 使用“-d”和“!-d”运算符检查目录是否存在
    * 使用“-e”和“!-e”运算符检查文件、目录或软连接是否存在
    * 使用“-x”和“!-x”运算符检查可执行文件

    使用示例：

    ```
    if ($http_user_agent ~ MSIE) {
        rewrite ^(.*)$ /msie/$1 break;
    }

    if ($http_cookie ~* "id=([^;]+)(?:;|$)") {
        set $id $1;
    }

    if ($request_method = POST) {
        return 405;
    }

    if ($slow) {
        limit_rate 10k;
    }
    ```

* `return`：停止处理并返回指定code给客户端，返回非标准的状态码444可以直接关闭连接而不返回响应头

    指令格式：

    * return code URL，指定重定向的URL，状态码为301、302、303和307
    * return code [text]，指定响应体文本，状态码为其他值
    * return URL，将使用302临时重定向作为状态码，URL参数应该以“http://”或者“https://”开始

    响应体文本或者重定向URL中可以包含变量

    作为一种特殊情况，重定向URL可以简化为当前server的本地URI，那么完整的重定向URL将按照请求协议（$scheme）、server_name_in_redirect指令和port_in_redirect指令的配置进行补全

* `rewrite regex replacement [flag];`：如果指定的正则表达式能匹配URI，此URI将被replacement参数定义的字符串改写

    rewrite指令按照在配置文件中出现的顺序执行，**如果replacement的字符串以“http://”或“https://”开头，nginx将结束执行过程，并返回给客户端一个重定向**

    flag参数设置后续指令的执行情况

    * last：停止执行当前rewrite模块，**然后查找匹配改变后URI的新location**，注意此处直接去匹配改变后的location，如果是在location中使用，会直接跳出当前location
    * break：停止执行当前rewrite模块，但是不影响其他模块的执行，如果是在location中使用，不会直接跳出location
    * redirect：在replacement字符串未以“http://”或“https://”开头时，使用返回状态码为302的临时重定向
    * perament：返回状态码为301的永久重定向

    如果replacement字符串包括新的请求参数，以往的请求参数会添加到新参数后面。如果不希望这样，在replacement字符串末尾加一个问号“？”，就可以避免

* `rewrite_log on | off;`：开启或者关闭将ngx_http_rewrite_module模块指令的处理日志以notice级别记录到错误日志中。
* `set variable value;`：为指定变量variable设置变量值value。value可以包含文本、变量或者它们的组合。
* `uninitialized_variable_warn on | off;`：控制是否记录变量未初始化的警告到日志

