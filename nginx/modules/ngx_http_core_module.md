# http核心模块

## `absolute_redirect on | off`

默认值为on，如果禁用，nginx发出的重定向将是相对路径

## `aio on | off | threads[=pool]`

默认为off，设置FreeBSD和linux下是否可以使用异步文件I/O

当同时在linux上使用AIO和sendfile时，AIO用于文件大小小于或等于directio指令指定的大小的情况，sendfile用于较小的文件或者directio指令被禁用的情况

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

alias在使用正则匹配时，location后uri中捕捉到要匹配的内容后，并在指定的alias规则内容处使用

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

当请求头过大超出缓冲，比如包含大量cookie，

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `

## ` `