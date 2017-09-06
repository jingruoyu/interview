## cors实现跨域请求

### 简单请求与复杂请求

简单请求条件：

* 请求的方法仅限HEAD、POST、GET
* http头部不超出一下字段
	* Accept：客户端能够接受的内容类型
	* Accept-Language：浏览器可接受的语言
	* Content-Language：响应体的语言
	* Last-Event_ID
	* Content-Type：显示此HTTP请求提交的内容类型。一般只有post提交时才需要设置该属性
	 
		仅限三个值application/x-www-form-urlencoded、multipart/form-data、text/plain

凡不能同时满足以上两个条件的均为复杂请求，复杂请求需要先发一个option请求过去，需要服务端的配合。

服务端会对OPTION请求多返回一下头信息字段：

* Access-Control-Allow-Origin：必传，代表服务端允许的请求域名。可以为*或者请求时的origin
* Access-Control-Allow-Methods：必传，服务器支持的跨域方法
* Access-Control-Allow-Credentials：可选，布尔值，表示服务端是否允许发送cookie
* Access-Control-Max-Age： 可选，指明本次预检请求的有效期，单位是秒
* Access-Control-Allow-Headers：可选，表明服务器所支持的所有头字段。当请求头中包含`Access-Control-Request-Headers`时发送
* Access-Control-Expose-Headers：可选，表明浏览器`getResponseHeader()`能拿到的自定义字段

**当浏览器设置为发送cookie时，Access-Control-Allow-Origin字段必须是明确指定的，与请求网页一直的域名**

通过遇见请求后，以后每次的浏览器的cors请求都会和简单请求一样，请求头中会有origin字段。服务器回应中会有`Access-Control-Allow-Origin`头信息字段