## 将字符串中每个单词反转，保证对应位置的大小写不变

不使用splice，只遍历一次

* 方法一：temp暂存单词
* 方法二：两个指针互换

## bind函数

	Function.prototype.bind = function (context) {
		var args = Array.slice.call(arguments,1);
		var self = this;
		return function(){
			var innerArgs = Array.slice.call(arguments);
			var finalArgs = args.concat(innerArgs);
			self.apply(context,finalArgs);
		}
	}

**call的参数是逐项列出来的，apply的参数是放在一个数组里面的**

## js破解DNS劫持

## 相等操作符的类型转换

[] == false

{} != false