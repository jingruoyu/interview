# Symbol

* symbol值通过symbol函数生成，独一无二，数据类型为symbol
* 接收字符串作为参数，进行对symbol实例的描述，在转为字符串时进行区分

		let s1 = Symbol('foo');
		let s2 = Symbol('bar');
		
		s1 // Symbol(foo)
		s2 // Symbol(bar)
		
		s1.toString() // "Symbol(foo)"
		s2.toString() // "Symbol(bar)"

字符串参数的使用：

* 如果参数是一个对象，则调用对象的toString方法转为字符串，然后再生成symbol值
* 字符串参数仅表示对symbol值的描述，相同参数生成的symbol值不同

symbol值的使用：

* **symbol值不能与其他类型的值进行运算***
* symbol值可以显示转化为字符串与布尔值

		let sym = Symbol('My symbol');
	
		String(sym) // 'Symbol(My symbol)'
		sym.toString() // 'Symbol(My symbol)'

		Boolean(sym) // true
		!sym  // false

* **symbol值不能转化为数值**、

## symbol值作为属性名或方法名

symbol值作为属性名可以防止同名属性出现

	let mySymbol = Symbol();
	let s = Symbol();
	
	// 第一种写法
	let a = {};
	a[mySymbol] = 'Hello!';
	
	// 第二种写法
	let a = {
	  [mySymbol]: 'Hello!',
	  [s]: function (arg) { ... }
	  // [s](arg) { ... }
	};
	
	// 第三种写法
	let a = {};
	Object.defineProperty(a, mySymbol, { value: 'Hello!' });
	
	// 以上写法都得到同样结果
	a[mySymbol] // "Hello!"

**显示定义时，symbol值必须放入方括号中，访问时需要使用方括号语法**

**使用symbol定义的属性是非私有的，但是会被常规方法遍历不到**

## 使用symbol消除魔术字符串

魔术字符串：在代码之中多次出现、与代码形成强耦合的某一个具体的字符串或者数值

**魔术字符串应尽量减少使用，将其替换为变量的形式**

对不关心具体值的变量，可以使用symbol类型进行替代，保证唯一性，不产生冲突

## 属性名的遍历

一般遍历会忽略symbol属性名

* **Object.getOwnPropertySymbols()方法会返回一个数组，包含所有的symbol属性名**

	const objectSymbols = Object.getOwnPropertySymbols(obj);
	
	objectSymbols
	// [Symbol(a), Symbol(b)]

* **Reflect.ownKeys返回所有类型键名，包括常规与symbol**


可以利用symbol属性不易被遍历到特性定义非私有、同时只希望用于内部的方法

## Symbol.for()，Symbol.keyFor()

### Symbol.for()

接收一个字符串作为参数，定义可以重复使用的symbol值

	let s1 = Symbol.for('foo');
	let s2 = Symbol.for('foo');
	
	s1 === s2 // true

1. 搜索有没有以该参数作为名称的 Symbol 值
2. 如果有，就返回这个 Symbol 值
3. 否则就新建并返回一个以该字符串为名称的 Symbol 值

		let s1 = Symbol.for('foo');
		let s2 = Symbol.for('foo');
		
		s1 === s2 // true

* symbol.for()会被登记在全局环境中以供搜索
* symbol不会被登记，每次都返回新值

**Symbol.for为 Symbol 值登记的名字，是全局环境的，可以在不同的 iframe 或 service worker 中取到同一个值**

### Symbol.keyFor

返回一个已被登记的 Symbol 类型值的key，搭配symbol.for()使用

	let s1 = Symbol.for("foo");
	Symbol.keyFor(s1) // "foo"
	
	let s2 = Symbol("foo");
	Symbol.keyFor(s2) // undefined