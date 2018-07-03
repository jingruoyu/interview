# http核心模块

## `absolute_redirect on | off`

默认值为on，如果禁用，nginx发出的重定向将是相对路径

## `aio on | off | threads[=pool]`

默认为off，设置FreeBSD和linux下是否可以使用异步文件I/O

当同时在linux上使用AIO和sendfile时，AIO用于文件大小大于或等于directio指令指定的大小的情况，sendfile用于较小的文件或者directio指令被禁用的情况

    location /video/ {
        sendfile       on;
        aio            on;
        directio       8m;
    }

文件也可以采用多线程的方式读取和发送，不必局限在一个worker进程中。文件的读取和发送操作在指定的线程池中进行中转，线程池的名字可以被直接指定或者使用变量名称指定，如果没有指定，将会使用默认名称default

```nginx
    location /video/ {
        sendfile       on;
        aio            threads;
        #aio threads=pool$disk;
    }
```
目前多线程只有epoll、kqueue和eventport方法兼容，多线程发送文件只支持linux

## `aio_write on | off`

默认为off

当aio可用时，指定其是否可用于文件的写操作。目前仅能用于`aio threads`和从代理服务器获取到数据时临时文件的写操作

## `alias path`

在特定的location下面设置目标文件夹路径，path可以为指定值或者变量，**path必须以`\`结束**，alias只能用于location块中

    location /i/ {
        alias /data/w3/images/;
    }

当请求`/i/top.gif`时，会匹配到当前的location中，根据alias配置发送`/data/w3/images/top.gif`文件

alias在使用正则匹配时，location后uri中捕捉到要匹配的内容后，并在指定的alias规则内容处使用，以组成一个完整的文件路径

    location ~ ^/users/(.+\.(?:gif|jpe?g|png))$ {
        alias /data/w3/images/$1;
    }

## `chunked_transfer_encoding on | off`

默认为on

允许在HTTP / 1.1中禁用分块传输编码。 尽管有标准要求，但当前使用软件无法支持分块编码时，它可能会派上用场

## `client_body_buffer_size size`

设置默认的请求body buffer大小，默认值为8k|16k。默认情况下大小为两个memory page。一个memory page大小与操作系统关联，32位为4k，64k为8k

当body大小超出限制时，会将body整体或部分放入一个临时文件中。

## `client_body_in_file_only on | clean | off`

设置请求body是否需要保存到一个文件中，一般用于debug模式，默认为off

* 取值为on时，请求结束后临时文件不删除
* 取值为clean时，请求结束后删除临时文件

## `client_body_in_single_buffer on | off`

默认为off，指定是否将请求body放入一个缓冲区中

## `client_body_temp_path path [level1 [level2 [level3]]]`

默认值为`client_body_temp`，指定存储body的临时文件目录

## `client_body_timeout time`

body读取超时设置，默认值60s。只有请求体需要被1次以上读取时，该超时时间才会被设置。且如果这个时间后用户什么都没发，nginx会返回requests time out 408

## `client_header_buffer_size size`

header缓冲区大小，默认值1k

当请求头过大超出缓冲区，比如包含大量cookie，将会根据`large_client_header_buffers`分配更大的buffer区域

## `client_header_timeout time`

读取请求头延迟，默认60s。如果客户端没有在指定的时间内发送完整的请求头，nginx会返回requests time out 408

## `client_max_body_size size`

设置服务端最大允许请求体，默认为1M，在请求头的content-length字段中会标明当次请求的请求体大小。

如果请求体大小超过最大允许值，将会返回413 (Request Entity Too Large)错误，但是**浏览器不知道如何正确显示413错误**

将size大小设为0后，将禁用请求body大小检查

## `connection_pool_size size`

精准控制每一个connection的内存分配，一般不使用，默认为256或512bytes

## `default_type mime-type`

设置response的默认mime-type，默认值为text-plain

## `directio [size|off]`

指定sendfile指令可以使用的阈值，当文件体积小于directio指定的大小时，可以使用sendfile指令，默认为off

直接I/O是文件系统的一个功能，其从应用程序到磁盘直接读取和写入，从而绕过所有操作系统缓存。 这使得更好地利用CPU周期和提高缓存效率。这样的数据不需要在任何高速缓存中，并且可以在需要时加载。 它可以用于提供大文件

## `directio_alignment size`

用于设置directio的块大小，默认值为512，在XFS文件系统下，应该增加到4K

## `disable_symlinks`

语法：

* `disable_symlinks off;`
* ` disable_symlinks on | if_not_owner [from=part]`

处理文件路径中的符号链接

* off：对文件路径中的符号链接不做处理与检查
* on：如果文件路径中有符号链接，则拒绝访问
* if_not_owner：如果文件路径中任何组成部分中含有符号链接，且符号链接和链接目标的所有者不同，拒绝访问该文件
* from=part：当nginx进行符号链接检查时(参数on和参数if_not_owner)，路径中所有部分默认都会被检查。 而使用from=part参数可以避免对路径开始部分进行符号链接检查，而只检查后面的部分路径。 如果某路径不是以指定值开始，整个路径将被检查，就如同没有指定这个参数一样。 如果某路径与指定值完全匹配，将不做检查。 这个参数的值可以包含变量

命令使用：`disable_symlinks on from=$document_root;`

**符号链接即为软连接**，其包含有一条以绝对路径或者相对路径的形式指向其它文件或者目录的引用，参见[符号链接](https://zh.wikipedia.org/wiki/%E7%AC%A6%E5%8F%B7%E9%93%BE%E6%8E%A5)

## `error_page code ... [=[response]] uri`

指定特定错误情况下显式返回的URI，可以使用response参数改变响应状态码。当前上下文中没有error_page时，从父级继承，URI中可以包含变量

    error_page 404 =200 /empty.gif;
    error_page 500 502 503 504 /50x.html;

当URI被发送到另一个server服务上时，即error_page后面不是一个静态内容，使用单独的等号可以将server返回的状态码返回给用户

    error_page 404 = /404.php;

可以使用error_page进行**重定向**

    error_page 403      http://example.com/forbidden.html;
    error_page 404 =301 http://example.com/notfound.html;

如果是在内部进行跳转无需改变URI，可以将错误处理转到一个命名路径，如下式，转到fallback，在fallback中再进行相应处理。此种情况下，如果处理uri产生了错误，那么nginx将最后一次出错的HTTP响应状态码返回给客户端。

    location / {
        error_page 404 = @fallback;
    }

    location @fallback {
        proxy_pass http://backend;
    }

## `etag on | off`

默认为on，作用为设置是否针对静态资源启用HTTP响应头中的etag

## `http {...}`

为http服务器提供配置上下文

## `if_modified_since off | exact | before`

默认为exact，指定响应的修改时间与请求头中`If-Modified-Since`的比较方法

* off：忽略`if_modified_since`请求头
* exact：精确匹配
* before：响应的修改时间小于等于`if_modified_since`请求头指定的时间

## `ignore_invalid_headers on | off`

控制是否忽略非法的请求头字段名。 合法的名字是由英文字母、数字和连字符组成，当然也可以包含下划线。默认值为on

可以在server配置层定义一次，对监听在相同地址和端口的所有虚拟主机都生效

## `internal`

location中使用，指定一个路径是否只能用于内部访问，外部访问将收到404错误

内部请求包括：

* 由error_page、index、random_index和try_files指令引起的重定向请求
* 由后端服务器返回的`X-Accel-Redirect`响应头引起的重定向请求
* 由`ngx_http_ssi_module`模块 和`ngx_http_addition_module`模块 的`include virtual`指令产生的子请求
* 用`rewrite`指令对请求进行修改

使用示例：

    error_page 404 /404.html;

    location /404.html {
        internal;
    }

**nginx限制每个请求最多只能进行10次内部重定向**，防止配置错误引起请求出现问题。超过10后，nginx将返回500 (Internal Server Error)错误

## `keepalive_disable none | browser ...`

针对行为异常的浏览器关闭长连接功能，browser参数指定哪些浏览器会受到影响

* msie6表示在遇到POST请求时，关闭与老版MSIE浏览器建立长连接
* safari表示在遇到Mac OS X和类Mac OS X操作系统下的Safari浏览器和类Safari浏览器时，不与浏览器建立长连接
* none表示为所有浏览器开启长连接功能

## `keepalive_requests number`

通过一个长连接可以处理的最大请求数，请求数超过此值，长连接将会关闭

## `keepalive_timeout timeout [header_timeout]`

默认值75s，第一份参数设置客户端的长连接在服务端保持的最长时间，第二份参数可选，设置`Keep-Alive: timeout=time`响应头的值，可以给两个参数设置不同的值

`Keep-Alive: timeout=time`响应头可以被火狐和chrome设备与处理，MSIE大约会在60s后关闭长连接

##之后不再详细记录##

* `large_client_header_buffers number size`：设置读取客户端超大请求的缓冲最大数量和每块缓冲的容量。

    * 当请求行的长度超过一块缓冲容量是，nginx返回414错误
    * 当请求头长度超过一块缓冲容量时，nginx按返回400错误

    默认值number为4，size为8k。长连接情况下处理完请求后，也会释放这些缓存

* `limit_except method ... { ... }`：location中使用，限制可以对该路径进行请求的HTTP方法，当指定method为GET时，会自动添加HEAD方法，其他HTTP方法的请求会由`ngx_http_access_module`模块和`ngx_http_auth_basic_module`模块的指令来限制访问

    使用实例：

        limit_except GET {
            allow 192.168.1.0/32;
            deny  all;
        }

* `limit_rate rate`：限制每个连接向客户端传送响应的速率限制，单位为比特每秒，设置为0时取消限速
* `limit_rate_after size`：传输量超过size大小时将，超出部分限速传送
* `lingering_close off | on | always`：控制nginx如何关闭客户端

    * on：nginx在完成关闭连接前等待和 处理客户端发来的额外数据。但只有在预测客户端可能发送更多数据的情况才会做此处理
    * always：nginx无条件等待和处理客户端的额外数据
    * off：nginx立即关闭连接，不等待客户端传送的额外数据。此种处理方式会破坏协议，正常情况不应该使用

* `lingering_time time`：在lingering_close指令生效时，设置nginx处理（**读取但忽略**）客户端额外数据的最长时间，超过这段时间后，nginx将关闭连接
* `lingering_timeout time`：在lingering_close指令生效时，定义nginx等待客户端数据额外数据最长时间

    * 在这段时间内，如果nginx没有接收到数据，将会关闭连接
    * 如果nginx接收到数据，将会忽略它，然后继续等待

    在等待————接收————忽略的循环中重复，但是总时间不会超过`lingering_time`

* `listen`：设置nginx监听地址，用于server上下文中

    ```
        listen address[:port] [default_server] [setfib=number] [backlog=number] [rcvbuf=size] [sndbuf=size] [accept_filter=filter] [deferred] [bind] [ipv6only=on|off] [ssl] [so_keepalive=on|off|[keepidle]:[keepintvl]:[keepcnt]];
        listen port [default_server] [setfib=number] [backlog=number] [rcvbuf=size] [sndbuf=size] [accept_filter=filter] [deferred] [bind] [ipv6only=on|off] [ssl] [so_keepalive=on|off|[keepidle]:[keepintvl]:[keepcnt]];
        listen unix:path [default_server] [backlog=number] [rcvbuf=size] [sndbuf=size] [accept_filter=filter] [deferred] [bind] [ssl] [so_keepalive=on|off|[keepidle]:[keepintvl]:[keepcnt]];
    ```

    * 针对IP协议，监听address和port

        ```
        listen 127.0.0.1:8000;
        listen 127.0.0.1;
        listen 8000;
        listen *:8000;
        listen localhost:8000;
        ```

        IPv6地址使用方括号表示

        ```
        listen [::]:8000;
        listen [fe80::1];
        ```

        只定义address情况下，nginx默认使用80端口

    * 针对Unix域套接字协议，监听path，使用`unix:`前缀

        ```
        listen unix:/var/run/nginx.sock;
        ```

    **default_server**：携带default_server参数的server会被指定address:port的默认虚拟主机，如果任何listen都没有指定，则将第一个监听address:port的server作为该地址的虚拟主机

    其他参数配置详见[listen](https://tengine.taobao.org/nginx_docs/cn/docs/http/ngx_http_core_module.html#listen)

* `location`

    ```
        location [ = | ~ | ~* | ^~ ] uri { ... } //匹配路径，路径可以嵌套
        location @name { ... } // 定义命名路径，不能嵌套
    ```

    路径匹配在URI规范化后进行，nginx会将URI中的编码字符进行解码，解析其中的相对路径，另外可能会对相邻的两个或多个斜线压缩为一个斜线

    location匹配规则

    模式 | 含义
    --- | ---
    `location = /uri` | = 表示精确匹配，只有完全匹配上才能生效
    `location ^~ /uri` | ^~ 开头对URL路径进行前缀匹配，并且在正则之前，前缀匹配不对url进行编码。
    `location ~ pattern` | 开头表示区分大小写的正则匹配
    `location ~* pattern` | 开头表示不区分大小写的正则匹配
    `location /uri` | 不带任何修饰符，也表示前缀匹配，但是在正则匹配之后
    `location /` | 通用匹配，任何未匹配到其它location的请求都会匹配到，相当于switch中的default

    多个location匹配顺序：

    * 精确匹配
    * 前缀匹配，前缀匹配时进行贪婪匹配，按照最大匹配原则进行
    * 按规则书写顺序正则匹配
    * 匹配不带任何修饰符的前缀匹配
    * 通用匹配

    当匹配成功后，停止匹配，按照当前规则进行处理:fu:

* `log_not_found on | off`：开启或者关闭error_log中记录文件不存在的错误，默认为on
* `log_subrequest on | off`：开启或者关闭access_log中记录子请求的访问日志，默认off
* `max_ranges number`：限制HTTP请求头数量，如果数量超过限制，超出部分按照未携带处理，，默认不限制
* `merge_slashes on | off`：开启或者关闭将URI中相邻多个斜线合并成一个的功能，默认开启

    压缩URI对于正确的路径匹配十分重要，处于安全方面以及正确使用的考虑，建议不要关闭压缩

* `msie_padding on | off`：在响应状态码大于等于400时，在响应正文中添加一段注释，使响应正文达到512字节。 本指令可以为MSIE客户端开启或关闭这个功能。
* `msie_refresh on | off`：为MSIE客户端开启或者关闭用页面刷新取代页面重定向的功能。默认关闭
* `open_file_cache`：配置文件缓存功能

    取值：

    * off：关闭缓存
    * max：缓存中元素最大数量，超过限制后使用最近最少使用算法删除元素
    * inactive：设置超时，指定时间内文件未被访问将会从缓存中删除，默认60s

    可以缓存以下数据：

    * 打开文件的描述符、大小和修改时间
    * 目录查找结果
    * 文件查找时的错误结果，需要使用`open_file_cache_errors`指令单独打开

* `open_file_cache_errors on | off`：开启或者关闭缓存文件查找的错误结果，默认off
* `open_file_cache_min_uses number`：配合`open_file_cache`中的inactive参数使用，指定在此段时间内文件应该被访问的最小次数，默认为1次
* `open_file_cache_valid time`：检查`open_file_cache`中缓存文件的间隔，默认为60s
* `port_in_redirect on | off`：nginx发起重定向时是否要指定端口，重定向时主机名使用`server_name_in_redirect`指定
* `postpone_output size`：向客户端发送数据时会延迟发送，当至少有size字节的数据时才会开始发送。设为0将关闭延迟发送功能
* `read_ahead size`：设置内核参数，控制文件预读数量
* `recursive_error_pages on | off`：允许或者禁止error page指令进行多次重定向。如果禁止，则当重定向的错误页面出现问题，nginx将会直接输出默认错误页面
* `request_pool_size size`：细调每个请求的内存分配，一般不用
* `reset_timedout_connection`：开启或关闭重置超时连接功能

    重置连接功能执行流程为，关闭套接字以前，设置SO_LINGER选项的超时值为0， 那么当关闭套接字时，nginx向客户端发送TCP RST，并且释放此套接字占用的所有内存。 这样可以避免某个已关闭的套接字长时间处于FIN_WAIT1状态，并占用内存缓冲区

    **超时的长连接依然是正常关闭的**

* `resolver address ... [valid=time]`：将后端服务器的域名解析成ip地址

    ```
        resolver 127.0.0.1 [::1]:5353 valid=30s;
    ```

    不指定端口号nginx将使用53端口，以轮询的方式发送到多台域名服务器

    nginx会缓存域名解析结果，默认缓存时间是TTL字段值，可以通过valid参数覆盖

* `resolver_timeout time`：设置域名解析超时，默认30s
* `root path`：设置请求根目录

    path路径可以包含除`$document_root`和`$realpath_root`以外的变量

* `satisfy all | any`：访问权限控制，默认为all

    nginx进行访问限制的有ngx_http_access_module模块和 ngx_http_auth_basic_module模块

    * all：其所有限制条件都授权访问时才允许请求访问
    * any：任意条件允许访问即可允许请求访问

## send系列

* `send_lowat size`：

    size取值为0时nginx尝试最小化向客户端发送数据次数，指令在linux、windows、Safari上无效

* ` send_timeout time;`：设置向客户端传输响应超时时间

    超时时间针对两次相邻写操作的时间间隔，如果客户端在这段时间内没有受到数据，将会关闭连接

* `sendfile on | off`：是否开启sendFile()调用
* `sendfile_max_chunk size`：默认为0

    设置为非0值时，可以限制在一次sendfile()调用时传输的数据量。 如果不进行限制，一个快速的连接可能会霸占整个worker进程的所有资源

## server系列

* `server {...}`

    内部包含一个虚拟主机配置，nginx没有明显分隔IP-based和name-baesd两种类型的虚拟主机

    * listen指令描述虚拟主机接受连接的地址和端口
    * server_name指令列出虚拟主机的所有主机名，即监听的主机名

* `server_name name ...`：设置虚拟主机名，默认值为""，第一个name是首要主机名

    name可以使用通配符\*，正则表达式等，使用正则表达式时需要在前面加上`~`，使用正则匹配组时可以在后面其他指令中继续使用匹配组

    nginx允许使用空主机名，使得nginx可以处理没有HOST请求头的请求，而不是使用ip+port的默认虚拟主机进行处理

    server_name匹配优先级：

    * 精确匹配，确切的名字
    * 最长的以`*`起始的通配符名字
    * 最长的以`*`结束的通配符名字
    * 第一个匹配的正则表达式名字（按在配置文件中出现的顺序）

* `server_name_in_redirect on | off`：是否开启将指定的首要主机名用于发起重定向功能，默认关闭

    关闭时，nginx将使用Host请求头中的名字，如果没有请求头，使用虚拟主机所在的IP地址

* `server_names_hash_bucket_size size`：

    为了快速找到相应的server name的能力，Nginx使用散列表来存储server name。这个设置了桶的大小

    参数hash bucket size总是等于hash表的大小，并且是一路处理器缓存大小的倍数

* `server_names_hash_max_size size`：设置主机名哈希表的最大容量，默认值为512
* `server_tokens on | off`：开启或者关闭在错误信息的server响应头中输出nginx版本号


* `tcp_nodelay on | off`：开启或关闭nginx使用TCP_NODELAY选项的功能。 这个选项仅在将连接转变为长连接的时候才被启用
* `tcp_nopush on | off`：开启或者关闭nginx在FreeBSD上使用TCP_NOPUSH套接字选项， 在Linux上使用TCP_CORK套接字选项。 选项仅在使用sendfile的时候才开启
* `try_files`：按照指定顺序检查文件是否存在，并且使用第一个找到的文件处理请求

    指令使用

    ```
        try_files file ... uri;
        try_files file ... =code;
    ```

    文件路径根据root指令和alias指令，结合file参数拼接而成。 可以在名字尾部添加斜线以检查目录是否存在，比如“$uri/”。 如果找不到任何文件，将按最后一个参数指定的uri进行内部跳转

        location / {
            try_files $uri $uri/ @drupal;
        }

    最后一个参数可以使用命名路径，也可以是code

        location / {
            try_files $uri $uri/index.html $uri.html =404;
        }

* `types {...}`：设置文件扩展名和响应的MIME类型映射表，可以将多个扩展名映射到同一种类型


    默认值：

        types {
            application/octet-stream bin exe dll;
            application/octet-stream deb;
            application/octet-stream dmg;
        }

    指定某条路径下所有请求的MIME类型

        location /download/ {
            types        { }
            default_type application/octet-stream;
        }

* `types_hash_bucket_size size`：设置MIME类型哈希桶大小
* `types_hash_max_size size`：设置MIME类型哈希表大小，默认1024
* `underscores_in_headers on | off`：是否禁止客户端请求头中使用下划线，默认禁止

    如果禁止，含有下划线的请求头将被标志为非法请求头并接受ignore_invalid_headers指令的处理。

    可以在默认主机的server配置级别定义此命令。这样，指令设置将覆盖监听同一地址和端口的所有虚拟主机

* `variables_hash_bucket_size size`：默认64，变量哈希桶大小
* ` variables_hash_max_size size`：默认512，变量哈希表最大容量

## nginx内嵌变量

ngx_http_core_module模块支持内嵌变量，变量可以用于表示请求头字段以及其他的一些信息

变量 | 含义
---- | ----
$arg_name | 请求头中的name参数
$args | 请求行中的参数字符串
$binary_remote_addr | 客户端IP地址的二进制形式，值的长度总是4字节
$body_bytes_sent | nginx返回给客户端的字节数，不含响应头
$bytes_sent | nginx返回给客户端的字节数，包含响应头
$connection | 连接的序列号
$content_length | “Content-Length”请求头的值
$content_type | “Content-Type”请求头的值
$cookie_name | **名为name的cookie**
$document_root | 当前请求的root或者alias的配置值
$document_uri | 同$uri
$host | “Host”请求头的值，如果没有该请求头，则为与请求对应的虚拟主机的首要主机名
$hostname | 机器名称
$http_name | **任意请求头的值；变量名的后半部为转化为小写并且用下划线替代横线后的请求头名称**
$https | 如果连接是SSL模块，返回“on”，否则返回空字符串
$is_args | 如果请求行带有参数，返回“?”，否则返回空字符串
$limit_rate | 允许设置此值来限制连接的传输速率
$msec | 当前时间，单位为秒，精度为毫秒
$nginx_version | nginx版本号
$pid | worker进程PID
$query_string | 同$args
$realpath_root | 根据root或者alias指令算出来的当前请求的绝对路径，其中的符号链接都会解析成真实的文件路径