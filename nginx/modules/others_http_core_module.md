## 访问IP限制

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

## response body过滤

ngx_http_addition_module 是一个过滤模块，它可以在回复正文前后加上内容。例如请求index.html，可以在index.html的内容前插入链接指向的内容

* `add_before_body uri`

    在回复正文前插入一段文字，nginx会发起一个子请求获取链接指向的内容

* `add_after_body uri`

    在回复正文后插入一段文字，请求方式同上

* `addition_types mime-type ...;`

    指定生效的回复MIME类型，默认值为text/html

## 请求代理模块

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

* `proxy_connect_timeout time`：设置与后端服务器建立连接的超时时间，一般不可能大于75秒

### cookie相关

* `proxy_cookie_domain off`：设置“Set-Cookie”响应头中的domain属性的替换文本，默认为off

    ```
    proxy_cookie_domain domain replacement;
    ```

    如果后端服务器返回的“Set-Cookie”响应头含有属性中domain指定为指令中的domain，会将其替换为replacement。

    * 指令中可以使用变量或正则表达式
    * 可以同时定义多条`proxy_cookie_domain`指令
    * **off参数可以取消当前配置级别的所有`proxy_cookie_domain`指令**

    ```
    proxy_cookie_domain localhost example.org;
    proxy_cookie_domain ~\.([a-z]+\.[a-z]+)$ $1;
    ```

* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `
* ` `

## ngx_http_rewrite_module模块