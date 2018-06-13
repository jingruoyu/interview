# 基本数据结构

nginx中为了追求高效，实现了很多颇具特色的数据结构。

## ngx_str_t

### 带长度的字符串结构

	typedef struct {
	    size_t      len;
	    u_char     *data;
	} ngx_str_t;

* data为指针，指向字符串第一个字符
* len为长度，表示字符串长度

**nginx中字符串不以`\0`结束**

优点：

* 减少字符串长度的计算
* 减少不必要的内存分配与拷贝

	request_line、uri、args等等，这些字符串的data部分，都是指向在接收数据时创建buffer所指向的内存中，uri，args就没有必要copy一份出来

缺点：

修改字符串时需要确认是否可以修改，修改后对其他引用是否会造成影响

nginx中glic部分函数的字符串参数是以`\0`结尾的，传入str作为参数时需要做特殊处理

nginx字符串操作API：

* ngx_string(str)

		#define ngx_string(str)     { sizeof(str) - 1, (u_char *) str }

	将普通字符串构造为nginx字符串

* ngx_null_string

		#define ngx_null_string     { 0, NULL }

	初始化字符串为空字符串，长度为0，data为NULL

* ngx_str_set(str, text)

		#define ngx_str_set(str, text)                                               
		    (str)->len = sizeof(text) - 1; (str)->data = (u_char *) text

	设置nginx字符串str为text，text为常量字符串

* ngx_str_set(str)

		#define ngx_str_null(str)   (str)->len = 0; (str)->data = NULL

	设置nginx字符串str为空串，长度为0，data为NULL

**note**

* 由于c语言的特性，ngx_string与ngx_null_string只能用于定义时初始化，其他用法参照c语言语法

	ngx_str_t str = ngx_string("hello world");
	ngx_str_t str1 = ngx_null_string;

* ngx_str_set与ngx_str_set实质为两条语句，单独使用时需要用花括号括起来

其他API：

* ngx_strlow(u_char \*dst, u_char \*src, size_t n)

	将src的前n个字符转换为小写存入dst字符串中，src字符串不变动。需要保证dst指向的空间大于n

* ngx_strncmp(s1, s2, n)

	区分大小写的字符串比较，只比较前n个字符

* ngx_strcmp(s1, s2)

	比较两个字符串整体

* ngx_strcasecmp(u_char \*s1, u_char \*s2)

	不区分大小写比较两个字符串

* ngx_strncasecmp(u_char \*s1, u_char \*s2, size_t n)

	不区分大小写比较两个字符串的前n个字符

* 字符串格式化三兄弟

		u_char * ngx_cdecl ngx_sprintf(u_char *buf, const char *fmt, ...);
		u_char * ngx_cdecl ngx_snprintf(u_char *buf, size_t max, const char *fmt, ...);
		u_char * ngx_cdecl ngx_slprintf(u_char *buf, u_char *last, const char *fmt, ...);

	* ngx_snprintf使用max参数指定buffer大小
	* ngx_slprintf使用last参数指定buffer大小

	推荐使用ngx_snprintf和ngx_slprintf，避免缓冲区空间溢出

将`ngx_str_t`格式参数传给函数时，要传递指针类型的参数，使用转义符`%v`，否则会出错

	ngx_str_t str = ngx_string("hello world");
	char buffer[1024];
	ngx_snprintf(buffer, 1024, "%V", &str);    // 注意，str取地址

## `ngx_pool_t`

ngx_pool_t数据结构提供一种资源管理机制，帮助管理一系列的资源，如内存、文件等，使得对这些资源的使用和释放统一进行，避免资源的错误释放

从一个`ngx_pool_t`对象上获取内存，当`ngx_pool_t`对象销毁时，由此分配出来的所有内存均被释放，**资源的使用和释放统一进行**

ngx_pool_t数据结构：

	typedef struct ngx_pool_s        ngx_pool_t;

	struct ngx_pool_s {
	    ngx_pool_data_t       d;
	    size_t                max;
	    ngx_pool_t           *current;
	    ngx_chain_t          *chain;
	    ngx_pool_large_t     *large;
	    ngx_pool_cleanup_t   *cleanup;
	    ngx_log_t            *log;
	};

cleanup管理一个链表，其中每一项均为一个特殊的需要释放的资源

相关操作函数：

* `ngx_pool_t *ngx_create_pool(size_t size, ngx_log_t *log);`

	创建初始化大小为size的pool，log为后续在该pool上进行操作时输出日志的对象

	**size大小设置：** size的大小必须小于等于`NGX_MAX_ALLOC_FROM_POOL`，且必须大于sizeof(ngx_pool_t)

	* 空间大于`NGX_MAX_ALLOC_FROM_POOL`会造成浪费，大于该限制的空间 不会被用到
	* 小于sizeof(ngx_pool_t)的值会造成程序崩溃，因为需要一定空间存放ngx_pool_t信息

* `void *ngx_palloc(ngx_pool_t *pool, size_t size)`

	从这个pool中分配一块为size大小的内存。注意，此函数分配的内存的起始地址按照NGX_ALIGNMENT进行了对齐。对齐操作会提高系统处理的速度，但会造成少量内存的浪费

* `void *ngx_pnalloc(ngx_pool_t *pool, size_t size)`

	从这个pool中分配一块为size大小的内存。但是此函数分配的内存并没有像上面的函数那样进行过对齐。

* `void *ngx_pcalloc(ngx_pool_t *pool, size_t size)`

	该函数也是分配size大小的内存，并且对分配的内存块进行了清零。内部实际上是转调用ngx_palloc实现的

* `void *ngx_pmemalign(ngx_pool_t *pool, size_t size, size_t alignment)`

	按照指定对齐大小alignment来申请一块大小为size的内存。此处获取的内存不管大小都将被置于大内存块链中管理

* `ngx_int_t ngx_pfree(ngx_pool_t *pool, void *p)`

	对于被置于大块内存链，也就是被large字段管理的一列内存中的某块进行释放。此函数操作效率比较低

* `void ngx_destroy_pool(ngx_pool_t *pool)`

	释放pool中持有的所有内存，依次调用cleanup字段所管理的链表中每个元素的handler字段所指向的函数，来释放掉所有该pool管理的资源，并且把pool指向的ngx_pool_t也释放掉了，完全不可用了

* `void ngx_reset_pool(ngx_pool_t *pool)`

	该函数释放pool中所有大块内存链表上的内存，小块内存链上的内存块都修改为可用。但是不会去处理cleanup链表上的项目

## `ngx_array_t`

ngx_array_t为nginx中数组结构，大块连续内存，内部除了存储数据的内存外还包括一些其他相关描述信息

	typedef struct ngx_array_s       ngx_array_t;
	struct ngx_array_s {
	    void        *elts;
	    ngx_uint_t   nelts;
	    size_t       size;
	    ngx_uint_t   nalloc;
	    ngx_pool_t  *pool;
	};

* elts：指向属鸡的数据存储区域
* nelts：数据实际元素个数
* size：数组单个元素大小
* nalloc：数组的容量，不扩容前提下最多存储的元素个数。当nelts增长到nalloc时，数组大小会扩容到原来的2倍

	实质为分配一块新的内存，新内存大小为原来的两倍，将原有数据拷贝到新内存中

* pool：数组用来分配内存的内存池

其他方法：

* `ngx_array_t *ngx_array_create(ngx_pool_t *p, ngx_uint_t n, size_t size)`

	创建一个新的数组对象并返回

	* p：数组分配内存使用的内存池
	* n：数组的初始容量大小，即在不扩容的情况下最多可以容纳的元素个数
	* size：单个元素的大小，单位为字节

* `void ngx_array_destroy(ngx_array_t *a)`

	销毁该数组对象，并释放其分配的内存回内存池

* `void *ngx_array_push(ngx_array_t *a)`

	在数组a上新追加一个元素，并返回指向新元素的指针。需要把返回的指针使用类型转换，转换为具体的类型，然后再给新元素本身或者是各字段（如果数组的元素是复杂类型）赋值

* `void *ngx_array_push_n(ngx_array_t *a, ngx_uint_t n)`

	在数组a上追加n个元素，并返回指向这些追加元素的首个元素的位置的指针

* `static ngx_inline ngx_int_t ngx_array_init(ngx_array_t *array, ngx_pool_t *pool, ngx_uint_t n, size_t size)`

	* 如果一个数组对象是被分配在堆上的，那么当调用ngx_array_destroy销毁以后，如果想再次使用，就可以调用此函数。
	* 如果一个数组对象是被分配在栈上的，那么就需要调用此函数，进行初始化的工作以后，才可以使用

**由于使用ngx_palloc分配内存，数组在扩容时，旧的内存不会被释放，会造成内存的浪费**
