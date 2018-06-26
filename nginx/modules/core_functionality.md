# 核心模块

## `accept_mutex on | off`

互斥锁，涉及惊群机制，打开后工作进程会轮流接收新的连接，否则每次请求进来后所有的worker都会被唤醒，会造成部分worker负担过重。

默认为off

## `accept_mutex_delay time | 500ms`

指定的互斥等待时间，过了等待时间之后，下一个worker进程便取得mutex锁，处理请求

## `daemon on | off`

守护进程，默认为on

## `debug_connection address | CIDR | unix:;`

针对特定的IP开启debug模式，其他地址的连接仍然使用error_log模式

## `debug_points abort | stop;`

应用于调试，设置断点

## `env variable[=value]`

nginx会移除除TZ之外的所有环境变量，此指令可用于创建新的环境变量

	env MALLOC_OPTIONS;
	env PERL5LIB=/data/site/modules;
	env OPENSSL_ALLOW_PROXY_CERTS=1;

## `error_log file [level]`

指定错误日志文件与错误等级，详见语法简介

## `event {...}`

为影响指定连接处理的准则提供上下文 ？？？？？

## `include file | mask`

包含其他配置文件，减少主配置文件的大小

可以使用全局包含的方法，`include vhosts/*.conf;`

## `load_module file`

用于加载动态模块

## `lock_file file`

为accept_mutex指定锁文件

## `master_process on | off`

默认为on，决定是否开启工作进程，仅在开发阶段使用

## `multi_accept on | off`

默认为off，开启后一个worker同时只能接受一个connection

## `pid file`

默认为`pid logs/nginx.pid`，定义主进程id存储文件

`cat logs/nginx.pid\`命令可以对nginx进行配置文件的重新加载

## `ssl_engine device`

指定openssl所用的引擎

## `thread_pool name threads=number [max_queue=number]`

name用于命名线程池，threads用于定义线程池中的线程数量，max_queue用于限制等待队列中的任务数量，默认为65536

## `timer_resolution interval`

降低worker进程中的时间分辨率，并由此降低`gettimeofday()`方法的调用次数

默认情况下`gettimeofday()`方法在每次内核接收到时间之后都会被调用，使用该指令后，每个interval事件之后调用一次

## `use method;`

取值选项：select、poll、kqueus、epoll、/dev/poll、eventport

设置connection processing的处理方式。一般情况下情况下不需要指定，nginx会自动选择最合适的处理方法

## `user user [group]`

指定nginx的worker进程运行用户，默认为nobody账号

## `worker_aio_requests number`

当使用aio epoll作为连接处理方法，设置单个worker进程的最大异步IO操作数量，默认为32

## `worker_connections number`

设置单个worker进程可以同时建立连接的数量，默认为512

## `worker_cpu_affinity cpumask ...`

将worker进程与CPU进行绑定，与worker_processes搭配使用

	worker_proceses     4;
	worker_cpu_affinity 0001 0010 0100 1000;

## `worker_priority number`

定义工作进程的调度优先级，取值从20到-20，默认为0

## `worker_processes number | auto`

定义worker进程数量，一般应该与CPU核数保持一致

## `worker_rlimit_core size`

用于设置worker进程的最大容量，用于扩容

## `worker_rlimit_nofile number`

改变每个worker进程能够打开的最大文件数量

## `worker_shutdown_timeout time`

改变work进程的关闭延迟，当time到期之后，nginx将会茶室关闭当前所有连接以促进worker进程的关闭

## `working_directory directory`

指定一个worker进程的工作目录，此操作仅针对用于内核