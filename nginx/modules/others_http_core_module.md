## 访问IP限制

访问IP限制通过`ngx_http_access_module`模块实现，也可以通过密码限制访问，使用satisfy指令进行访问限制条件的控制

* `allow address | CIDR | all`

	允许指定的网络地址访问

* `deny address | CIDR | all`

	拒绝指定的网络地址访问

使用示例：

```
location / {
    deny  192.168.1.1;
    allow 192.168.1.0/24;
    allow 10.1.1.0/16;
    allow 2001:0db8::/32;
    deny  all;
}
```

## response body过滤

ngx_http_addition_module 是一个过滤模块，它可以在回复正文前后加上内容。例如请求index.html，可以在index.html的内容前插入链接指向的内容

* `add_before_body uri`

	在回复正文前插入一段文字，nginx会发起一个子请求获取链接指向的内容

* `add_after_body uri`

	在回复正文后插入一段文字，请求方式同上

* `addition_types mime-type ...;`

	指定生效的回复MIME类型，默认值为text/html

## ngx_http_proxy_module 模块

**proxy模块进行请求代理**



## ngx_http_rewrite_module模块