# nginx的简单使用（https://moonbingbing.gitbooks.io/openresty-best-practices/content/ngx/nginx_brief.html）

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



