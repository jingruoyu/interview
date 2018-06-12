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

### `ngx_pool_t`