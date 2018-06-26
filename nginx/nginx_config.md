## nginx配置系统

主文件 + 配置文件，主文件在任何情况下均被使用，文件位于nginx安装目录的conf目录下

`#`进行注释

### 指令概述

nginx.conf中包含若干配置项，配置项包括配置指令和配置参数两部分。配置指令中如果包含空格，需要使用引号括起来

### 指令参数

指令参数包含简单字符串与复杂配置块。

复杂配置块由大括号括起来，其中可以包含若干其他的配置指令

* 简单配置项：配置指令参数全部由简单字符串组成

		error_page   500 502 503 504  /50x.html;

* 复杂配置项：指令参数中包含复杂配置块，一般简单字符串写在前面

		location / {
		    root   /home/jizhao/nginx-book/build/html;
		    index  index.html index.htm;
		}

### 指令上下文

指令上下文即作用域，不同作用域包含一个或多个配置项

* main：nginx在运行时与具体业务功能（比如http服务或者email服务代理）无关的一些参数，比如工作进程数，运行的身份等
* http：与提供http服务相关的一些配置参数。例如：是否使用keepalive啊，是否使用gzip进行压缩等
* server：http服务上支持若干虚拟主机。每个虚拟主机一个对应的server配置项，配置项里面包含该虚拟主机相关的配置
* location：http服务中心，某些特定的URL对应的一系列配置项
* mail：实现email相关的SMTP/IMAP/POP3代理时，共享的一些配置项

指令上下文中可能存在包含的情况，也能包含另一种类型的上下文多次。

### 简单的server配置项

	server {
	    listen      192.168.1.1:80;
	    server_name example.org www.example.org;
	    ...
	}

	server {
	    listen      192.168.1.1:80 default_server;
	    server_name example.net www.example.net;
	    ...
	}

	server {
	    listen      192.168.1.2:80 default_server;
	    server_name example.com www.example.com;
	    ...
	}

上例中，匹配顺序如下

* 根据server块中的目标ip地址与端口号进行匹配，选取命中的server块
* 在命中的server块中匹配目标server_name

可以为ip地址下不同的端口号指定其默认的server，当访问特定的ip+端口号时，如果没有匹配到对应的server，将交由指定的`default_server`进行处理

## nginx的模块化体系结构


nginx内部结构：核心功能(nginx core) + 功能模块

nginx core：实现了底层的通讯协议，为其他模块和nginx进程构建了基本的运行时环境，并且构建了其他各模块的协作基础，提供了web服务器的基础功能、web服务反向代理功能、email服务反向代理功能

### 模块概述

nginx将各功能模块组织成一条链，当有请求到达的时候，请求依次经过这条链上的部分或者全部模块，进行处理，每个模块实现特定的功能

**特殊模块：http模块与mail模块。**在nginx core之上实现了另外一层抽象，处理与HTTP协议和email相关协议（SMTP/POP3/IMAP）有关的事件，并且确保这些事件能被以正确的顺序调用其他的一些功能模块

### 模块分类

模块名称 | 功能
------ | ------
event module | 搭建了独立于操作系统的事件处理机制的框架，及提供了各具体事件的处理
phase handler | 此类型的模块也被直接称为handler模块。主要负责处理客户端请求并产生待响应内容
output filter | 响应内容输出，负责对输出的内容进行处理，可以对输出进行修改
upstream | 实现**反向代理**的功能，将真正的请求转发到后端服务器上，并从后端服务器上读取响应，发回客户端
load-balance | 负载均衡模块，实现特定的算法，在众多的后端服务器中，选择一个服务器出来作为某个请求的转发服务器

## nginx请求处理

nginx使用多进程模型对外提供服务，一个master进程和多个woker进程，master进程负责管理nginx本身和woker进程

所有的业务逻辑均在woker进程中处理，woker进程中有个无限循环函数`ngx_worker_process_cycle()`，不断处理接收到的请求并进行处理，直到nginx服务终止

`ngx_worker_process_cycle()`处理流程：

* 操作系统提供的机制（例如epoll, kqueue等）产生相关的事件
* 接收和处理这些事件，如是接受到数据，则产生更高层的request对象
* 处理request的header和body
* 产生响应，并发送回客户端
* 完成request的处理
* 重新初始化定时器及其他事件

### 请求的处理流程

HTTP Request的处理过程：

* 初始化HTTP Request，读取来自客户端的数据，生成Request对象，其中包含请求的所有信息
* 处理请求头
* 处理请求体
* 如果有的话，调用本次请求想关联的handler
* 依次调用各parse handler进行处理

## nginx命令行参数

### nginx自身命令

nginx大部分操作通过配置文件进行，仅保留较少的命令行参数

通过`nginx -s signal`可以控制nginx运行，signal可以为下列选项

* stop：立即停止nginx运行
* quit：等待worker进程处理完当前的request请求之后停止运行
* reload：重新加载配置文件

	master进程收到指令后，会检查新的配置文件语法有效性并且尝试应用配置文件。

	如果新的配置文件可用，master进程会开启新的worker进程并且向旧进程发送shut down信号，否则master进程会回滚配置继续运行旧的进程

	旧的进程接收到shut down信号会，在处理完当前的request请求后停止工作

* reopen：重新开始记录日志文件

### 使用系统命令管理nginx

* 杀死nginx进程

	`kill -s QUIT pid`，nginx的master进程pid通常保存在`/usr/local/nginx/logs`或者`/var/run`中

* 获取所有运行的nginx进程

	`ps -ax | grep nginx`，