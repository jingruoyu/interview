# 初探nginx

特点：高性能，高并发，多进程，异步非阻塞

* 进程：系统进行资源分配和调度的一个独立单位，**各进程互相独立**
* 线程：进程下一个能够独立运行的独立单位，同一进程下的所有线程共享进程拥有的全部资源，**线程可以创建和撤销另一个线程**

## nginx进程模型

nginx中的进程：

* master进程：用于管理worker进程，通过master进程操作nginx
* 多个worker进程：用于处理网络事件，各worker进程对等，同等竞争，互相独立

一个请求只可能完全在一个worker中处理，一个worker不可能处理其他进程的请求

**worker的个数一般设置与CPU核数对应**

使用命令行操作nginx流程：

* 启动新的nginx进程
* 解析命令行命令
* 向master进程发送信号
* master操作worker进程

worker进程会抢accept_mutex，抢到互斥锁的那个进程注册listenfd读事件，在读事件里调用accept接受该连接，进而进行处理

worker进程请求处理的accept_mutex惊群问题（nginx默认关闭accept_mutex会导致惊群）：

当一个新连接到达时

* 如果激活了accept_mutex，那么多个Worker将以串行方式来处理，其中有一个Worker会被唤醒，其他的Worker继续保持休眠状态
* 如果没有激活accept_mutex，那么所有的Worker都会被唤醒，不过只有一个Worker能获取新连接，其它的Worker会重新进入休眠状态

## nginx事件处理

同步与异步，阻塞与非阻塞

apcache采用每个请求独占一个线程，处理过程中不同线程间切换

缺点：线程间上下文切换CPU开销较大，影响性能

**nginx采用异步非阻塞的方式处理事件**，不需要为每个事件创建专属线程，故不存在上下文切换

**nginx中worker个数设置为CPU核数**

* 避免太多worker竞争CPU资源，带来不必要的上下文切换
* CPU亲缘性选项，将某个进程与CPU某个内核绑定，不会因为进程的切换导致cache的失效

web服务器的事件类型：

* 网络事件，处理办法如上述
* 信号，会中断程序当前执行，在改变状态后，继续执行
* 定时器，事件循环每执行一遍就检查一次定时器红黑树，找出其中所有超时的定时事件，一一执行

# 基本概念

## connection

connection是对tcp连接的封装，其中包括连接的socket、写事件和读事

connection作用：

* 处理http请求
* 作为邮件服务器
* 作为客户端请求其他sever数据
* 与任何后端服务打交道

nginx进程最大连接数

* nofile，一个进程能够打开的listenfd最大数，每个socket连接会占用一个fd，fd用完后再创建socket会失败
* worker_connections，每个进程支持的最大连接数

实际的最大连接数取nofile和worker_connections中的较小值

**连接池**

nginx通过连接池管理连接，其中保存的是一个worker_connections大小的一个ngx_connection_t结构的数组

nginx的free_connections中保存所有空闲的ngx_connection_t，每获取一个连接，就从空闲连接链表中获取一个，用完后，再放入空闲连接链表中

**nginx最大连接数**

* 普通情况下nginx最大连接数为worker_connections ` worker_processes `
* 反向代理情况下最大连接数为worker_connections ` worker_processes/2 `

	因为每个并发会占用两个连接，分别问与客户端的连接和与后端的连接

**accept_mutex锁（惊群问题）**

worker纯粹采用竞争机制获取请求，会导致部分worker负担过重

nginx通过accept_mutex选项控制进程根据自身连接数目情况判断是否添加accept事件，与其他进程竞争获取accept_mutex锁，实现多进程之间连接的平衡

## request

HTTP请求结构：请求行 + 请求头 + body

nginx中ngx_http_request_t数据结构是对一个http请求的封装，其中保存解析请求与输出响应相关的数据

nginx处理请求流程：

* 由`ngx_http_init_request`函数开始，设置请求读事件为`ngx_http_process_request_line`，请求行的处理使用该函数进行
* 请求行处理，通过`ngx_http_read_request_header`读取请求数据，调用`ngx_http_parse_request_line`解析请求行，整个请求行解析到的参数存储到ngx_http_request_t结构中
* 请求头处理，nginx会设置在`ngx_http_process_request_headers`中进行读取与解析，调用`ngx_http_process_request_headers`读取请求头，使用`ngx_http_parse_header_line`进行解析

	解析到的所有请求头保存在`ngx_http_request_t`的链表结构headers_in中

	请求头与body之间使用空行分隔，遇到两个回车换行符请求头解析结束

* 请求body处理，使用`ngx_http_process_request`处理请求

	* 将读写事件处理函数设置为`ngx_http_request_handler`，在该函数内部再进行读写事件的区分
	* 使用`ngx_http_handler`进行真正请求的处理，**执行`ngx_http_core_run_phases`函数处理请求，产生数据生成响应**

	生成的所有响应头存放在`ngx_http_request_t`的链表结构headers_out中

**note**

* nginx会将整个请求头放在一个buffer中，如果这个buffer装不下，则会重新分配一个更大的buffer，两个buffer的大小通过`client_header_buffer_size`与`large_client_header_buffers`进行配置
* 为了保证请求头或请求行的完整性，一个完整的请求头或者请求行会被放置在一个连续的内存中，即一个buffer里面
* 如果请求行大于一个buffer大小，返回414错误
* 如果请求头大于一个buffer大小，返回400错误

[!nginx请求处理流程](http://tengine.taobao.org/book/_images/chapter-2-2.PNG)

## keepalive

HTTP长连接和短连接本质上是TCP协议的长连接和短连接

长连接：需要提前确定每个请求体与响应体的长度，以便在一个连接上面执行多个请求，长连接可以减少socket的time-wait数量

* 请求body的长度通过请求头的content-legnth确定
* 响应body的长度确定与协议有关

	* HTTP1.0中，使用content-legnth指定body长度，如果没有content-length，客户端会一直接收数据，直到服务端主动断开连接
	* HTTP1.1中，有两种模式

		* chunked模式：如果响应头中的transfer-enconding为chunked传输，代表body为流式传输，每个传输块中均会标记当前块长度，不在需要指定body长度
		* 非chunked模式：需要在header中指定content-length
		* 如果非chunked同时没有content-legnth，客户端会一直接收数据，直到服务端主动断开连接

客户端请求头中connection为close表示客户端关闭长连接，为keep-alive表示打开长连接

如果请求头中没有connection字段，不同协议下默认值不同

* HTTP1.0默认为close
* HTTP1.1默认为keep-alive

如果服务端决定打开keepalive，响应头中connection字段为keep-alive，否则为close

## pipe

pipe：基于长连接的流处理

普通keepalive必须等待第一个请求的响应接收完全后才能发起第二个请求，pipeline机制不必等待降低两个响应间隔时间

nginx支持pipeline，但对多个请求依然采用串行处理的办法，利用pipeline减少等待第二个请求的请求头数据时间

处理办法为当处理前一个请求时，会将后续到达的请求也放在buffer中，之前的请求处理完后，会直接从buffer中读取数据，开始处理下一个请求

## lingering_close

lingering_close延迟关闭机制，nginx关闭连接是先关闭tcp连接的写，等待一段时间后再关闭连接的读

close系统调用时如果`tcp write buffer`中有内容则会向客户端发送RST报文丢弃`write buffer`中数据

延迟关闭防止在write()系统调用之后到close()系统调用执行之前`tcp write buffer`中的数据没有发送完毕，导致客户端接收不到相应数据