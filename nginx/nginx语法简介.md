# [nginx的简单使用](https://moonbingbing.gitbooks.io/openresty-best-practices/content/ngx/nginx_brief.html)

## nginx下载安装

[nginx下载](http://nginx.org/en/download.html)

安装过程中注意各项依赖的安装，gcc、pcre、openssl、cmake、zlib，安装完成后默认通过80端口可以访问

nginx.conf为主配置文件，位于`/usr/local/nginx/conf`中

```
worker_process      # 表示工作进程的数量，一般设置为cpu的核数

worker_connections  # 表示每个工作进程的最大连接数

server{}            # 块定义了虚拟主机

    listen          # 监听端口

    server_name     # 监听域名

    location {}     # 是用来为匹配的 URI 进行配置，URI 即语法中的“/uri/”

    location /{}    # 匹配任何查询，因为所有请求都以 / 开头

        root        # 指定对应uri的资源查找路径，这里html为相对路径，完整路径为
                    # /opt/nginx-1.7.7/html/

        index       # 指定首页index文件的名称，可以配置多个，以空格分开。如有多
                    # 个，按配置顺序查找。

```

## location匹配规则

模式 | 含义
--- | ---
location = /uri | = 表示精确匹配，只有完全匹配上才能生效
location ^~ /uri | ^~ 开头对URL路径进行前缀匹配，并且在正则之前，前缀匹配不对url进行编码。
location ~ pattern | 开头表示区分大小写的正则匹配
location ~* pattern | 开头表示不区分大小写的正则匹配
location /uri | 不带任何修饰符，也表示前缀匹配，但是在正则匹配之后
location / | 通用匹配，任何未匹配到其它location的请求都会匹配到，相当于switch中的default

多个location匹配顺序：

* 精确匹配
* 前缀匹配，前缀匹配时进行贪婪匹配，按照最大匹配原则进行
* 按规则书写顺序正则匹配
* 匹配不带任何修饰符的前缀匹配
* 通用匹配

当匹配成功后，停止匹配，按照当前规则进行处理

**必选规则**：

* 根路径匹配规则，通过域名访问网站首页比较频繁，直接匹配网站根加快首页匹配速度，

        location = / {
            proxy_pass http://tomcat:8080/index
        }

* 静态文件匹配规则，nginx强项

    * 按目录匹配

            location ^~ /static/ {
                root /webroot/static/;
            }

    * 按文件匹配

            location ~* \.(gif|jpg|jpeg|png|css|js|ico)$ {
                root /webroot/res/;
            }

    * 通用规则

            location / {
                proxy_pass http://tomcat:8080/
            }

### rewrite 语法

用于判断的表达式

* -f 和 !-f 用来判断是否存在文件
* -d 和 !-d 用来判断是否存在目录
* -e 和 !-e 用来判断是否存在文件或目录
* -x 和 !-x 用来判断文件是否可执行

nginx中部分全局变量

```
例：http://localhost:88/test1/test2/test.php?k=v
$host：localhost
$server_port：88
$request_uri：/test1/test2/test.php?k=v
$document_uri：/test1/test2/test.php
$document_root：D:\nginx/html
$request_filename：D:\nginx/html/test1/test2/test.php
```

## 避免使用if

某些情况下使用if指令会出现错误，发生不可预期的行为。但是相同条件下if的处理是一致的

location区块中if指令下100%安全的指令有：`return`,`rewrite`,`last`

错误原因：

> if 指令是 rewrite 模块中的一部分, 是实时生效的指令。另一方面来说, Nginx 配置大体上是陈述式的。在某些时候用户出于特殊是需求的尝试, 会在 if 里写入一些非 rewrite 指令, 这直接导致了我们现处的情况。

### if的替换

使用 try_files 如果他适合你的需求。在其他的情况下使用 return … 或者 rewrite … last。还有一些情况可能要把 if 移动到 server 区块下(只有当其他的 rewrite 模块指令也允许放在的地方才是安全的)。

    location / {
        error_page 418 = @other;
        recursive_error_pages on;

        if ($something) {
            return 418;
        }

        # some configuration
        # ...
    }

## 静态文件服务

配置cache、gzip等

### 文件缓存

在浏览器和应用服务器之间，存在多种潜在缓存，如：客户端浏览器缓存、中间缓存、内容分发网络（CDN）和服务器上的负载平衡和反向代理，可以提高响应性能，并更有效率的使用应用服务器

### 配置基础缓存

* proxy_cache_path：设置缓存路径和配置，levels、keys_zone、max_size、inactive、use_temp_path等
* proxy_cache：启用缓存，可以在location中针对具体路径进行缓存，也可以在server中针对所有未指定自身缓存的服务进行缓存

### nginx使用缓存处理服务器错误

当原始服务器宕机或繁忙时，nginx可以将内存中的陈旧内容，提供容错能力，保证在服务器故障或流量峰值的情况下的正常运行

具体配置：

    location / {
        ...
        proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
    }

上面的例子中，当服务器返回error、timeout以及其他5xx错误，就会将缓存中请求文件的旧版本发送给客户端

### 缓存的其他配置项

* proxy_cache_revalidate 指示 Nginx 在刷新来自服务器的内容时使用 GET 请求
* proxy_cache_min_uses 该指令设置同一链接请求达到几次即被缓存，默认值为 1
* proxy_cache_lock 指示当多个客户端请求一个缓存中不存在的文件（或称之为一个 MISS），只有这些请求中的第一个被允许发送至服务器

## 日志

* access_log：定义访问日志文件的存放路径（包含日志文件名）、格式、缓存大小

        access_log path [format_name [buffer=size | off]];

    logformat示例：

        log_format myformat '$remote_addr  $status  $time_local';
        access_log logs/access.log  myformat;

    logformat字段配置：

    字段  | 作用
    ---- | ----
    $remote_addr与$http_x_forwarded_for | 记录客户端IP地址，默认
    $remote_user | 记录客户端用户名称，默认
    $request | 记录请求的URI和HTTP协议，默认
    $status | 记录请求状态，默认
    $body_bytes_sent | 发送给客户端的字节数，不包括响应头的大小，默认
    $bytes_sent | 发送给客户端的总字节数
    $connection | 连接的序列号
    $connection_requests | 当前通过一个连接获得的请求数量
    $msec | 日志写入时间。单位为秒，精度是毫秒
    $pipe | 如果请求是通过HTTP流水线(pipelined)发送，pipe值为“p”，否则为“.”
    $http_referer | 记录从哪个页面链接访问过来的，默认
    $http_user_agent | 记录客户端浏览器相关信息，默认
    $request_length | 请求的长度（包括请求行，请求头和请求正文）
    $request_time | 请求处理时间，单位为秒，精度毫秒
    $time_iso8601 | ISO8601标准格式下的本地时间
    $time_local | 记录访问时间与时区，默认

    * log_format 配置必须放在 http 内，否则会出现警告

    * Nginx 进程设置的用户和组必须对日志路径有创建文件的权限，否则，会报错

* error_log：指定错误日志与错误日志等级

        error_log path [level];

    level：错误日志等级，`debug、info、notice、warn、error、crit、alert、emerg`,从左到右日志详细程度递减，默认level为error

    关闭错误日志：

    * linux下将存储位置设为空设备，`error_log /dev/null;`
    * windows下将存储位置设为空设备，`error_log nul;`

**查看正在改变的文件**

linux下使用`tail -f filename`命令查看正在改变的文件，将文件最尾部的内容显示在屏幕上并不断刷新，看到最新的文件内容

## 反向代理

反向代理指用代理服务器来接受 internet 上的连接请求，然后将请求转发给内部网络上的服务器，并将从服务器上得到的结果返回给 internet 上请求连接的客户端，此时代理服务器对外就表现为一个反向代理服务器。

[!反向代理](https://moonbingbing.gitbooks.io/openresty-best-practices/content/images/proxy.png)

### 反向代理应用场景

* 负载均衡
* 为防火墙之后的服务器增加安全保障
* 将不同web服务器系统的资源存在于同一个域名下

## 负载均衡

### upstream负载均衡

upstream 是 Nginx 的 HTTP Upstream 模块，使用upstream指令指定一个负载均衡器名称及其内部相关服务器，在需要使用的地方直接调用

    upstream test.net{
        ip_hash;
        server 192.168.10.13:80;
        server 192.168.10.14:80  down;
        server 192.168.10.15:8009  max_fails=3  fail_timeout=20s;
        server 192.168.10.16:8080;
    }
    server {
        location / {
            proxy_pass  http://test.net;
        }
    }

### upstream负载均衡算法

在upstream中配置

* 轮训：每个请求按时间顺序逐一分配到不同的后端服务器，如果后端某台服务器宕机，故障系统被自动剔除，使用户访问不受影响
* ip_hash：每个请求按照来访IP的hash结果分配，同一个IP固定访问一个后端服务器，可以解决动态页面session共享问题
* fair：依据页面大小和加载时间长短智能地进行负载均衡，也就是根据后端服务器的响应时间来分配请求，响应时间短的优先分配
* url_hash：按访问 url 的 hash 结果来分配请求，使每个 url 定向到同一个后端服务器，可以进一步提高后端缓存服务器的效率
* least_conn：最少连接负载均衡算法，单来说就是每次选择的后端都是当前最少连接的一个 server(这个最少连接不是共享的，是每个 worker 都有自己的一个数组进行记录后端 server 的连接数)
* hash：这个 hash 模块又支持两种模式 hash, 一种是普通的 hash, 另一种是一致性 hash

### upstream状态参数

* weight：权重，权重越高越容易被分配到
* down：当前server不参与负载均衡
* backup：预留的备份机器。当其他所有的非 backup 机器出现故障或者忙的时候，才会请求 backup 机器，因此这台机器的压力最轻
* max_fails：允许请求失败的次数，默认为 1 。当超过最大次数时，返回 proxy_next_upstream 模块定义的错误
* fail_timeout：在经历了 max_fails 次失败后，暂停服务的时间。max_fails 可以和 fail_timeout 一起使用

### 配置负载均衡

在server的外部定义负载均衡名称，定义好之后，再location中使用proxy_pass引用

### nginx健康状态检查

使用max_fails与fail_timeout可以控制异常情况

### backup配置

backup服务器为预留的备份机，相当于sorry server

## 常见错误与使用陷阱

### root放在location区块内

root指令应该放在server内部，否则每增加一个location就要为其配置相应的root

    server {
        server_name www.example.com;
        root /var/www/Nginx -default/;
        location / {
            # [...]
        }
        location /foo {
            # [...]
        }
        location /bar {
            # [...]
        }
    }

### 重复的index指令

index指令应该放置于http区块中，下面的所有server会继承这个配置

    http {
        index index.php index.htm index.html;
        server {
            server_name www.example.com;
            location / {
                # [...]
            }
        }
        server {
            server_name example.com;
            location / {
                # [...]
            }
            location /foo {
                # [...]
            }
        }
    }

### 避免使用if

以下操作应该避免：

* 使用if检查server name：导致所有的请求进来之后都需要执行if，效率低下

    应该将不同的servername分开编写，使用多个server区块分别处理，避免if的使用

* 使用if检查文件是否存在

    应该使用try_files进行文件检查，可以一次性测试一个序列

### 正确使用rewrite

将rewrite与nginx中的全局参数搭配使用，避免使用复杂的正则表达式进行路径匹配或者参数提取

    rewrite ^/(.*)$ http://example.com/$1 permanent;
    rewrite ^ http://example.com$request_uri? permanent;
    return 301 http://example.com$request_uri;

### 使用绝对路径的rewrite

使用rewrite时，应该加上协议名称，拼接为绝对路径，避免相对路径的使用

### 注意缓存问题

浏览器缓存会导致部分配置不会立刻生效

### root的使用

root不应该指向服务器根目录，否则会导致服务器安全问题，容易受到攻击

### 使用ip地址代替主机名

使用ip地址代替主机名，省略nginx的地址解析过程