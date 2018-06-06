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
location = /uri	| = 表示精确匹配，只有完全匹配上才能生效
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

* access_log：访问日志