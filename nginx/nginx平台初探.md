## 初探nginx

特点：高性能，高并发，多进程，异步非阻塞

* 进程：系统进行资源分配和调度的一个独立单位，**各进程互相独立**
* 线程：进程下一个能够独立运行的独立单位，同一进程下的所有线程共享进程拥有的全部资源，**线程可以创建和撤销另一个线程**

### nginx进程模型

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

### nginx事件处理

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

## 基本概念

### connection

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

### request

nginx中ngx_http_request_t是对一个http请求的封装



