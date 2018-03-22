# ES6学习

## 简介

* ES6是继ES5.1之后，JavaScript语言的下一代标准
* ECMA2015/2016/2017等，是ES6在每年发布的不同版本

即ES6是一个泛指，ES2015、ES2016等是其在每年六月发布的不同版本

## babel转码器

**将ES6代码转为ES5代码，从而在现有环境执行，不用考虑兼容问题**

* `.babelrc`文件，设置转码规则与插件
* `babel-cli`在node下进行安装，进行命令行转码，可以将ES6标准的js文件转码为ES5标准
* `babel-node`可以直接运行ES6代码，无需单独安装，随babel-cli一起安装
* `babel-register`模块改写`require`命令，调用后，每当使用`require`加载`.js`、`.jsx`、`.es`、`.es6`后缀名文件。会先使用babel进行转码

    **使用时必须首先加载`babel-register`**

        require('babel-register');
        require('./index.js');

    **注意**
    * `babel-register`只会对require命令加载的文件进行转码，不会对当前文件进行转码
    * `babel-register`是实时转码，只适合在开发环境使用

* `babel-core`模块：调用babel的API进行转码

        var babel = require('babel-core');
        // 字符串转码
        babel.transform('code();', options);
        // => { code, map, ast }

        // 文件转码（异步）
        babel.transformFile('filename.js', options, function(err, result) {
          result; // => { code, map, ast }
        });

        // 文件转码（同步）
        babel.transformFileSync('filename.js', options);
        // => { code, map, ast }

        // Babel AST转码
        babel.transformFromAst(ast, code, options);
        // => { code, map, ast }

* `babel-polyfill`模块

    * Babel默认只转换新的JavaScript句法（syntax），而不转换新的API。

    * 如果想让这个方法运行，必须使用babel-polyfill，为当前环境提供一个垫片

## `let`和`const`命令

### `let`命令

* 引入块级作用域，`let`声明的变量仅在`let`命令所在代码块内有效

        var a[];
        for(let i=0;i<10;i++){
            a[i] = function(){
                console.log(i);
            };
        }
        a[6](); // 6

    `for`循环中，变量`i`由`let`声明，当前的`i`仅在本轮循环中有效，所以**每一次循环的`i`都是一个新的变量**

    `for`循环中，整个循环是一个父作用域，其中的循环体是一个子作用域

* 变量提升

    `let`命令可以变量提升，但是ES6禁止在变量在声明前使用，变量只能在**声明后使用**，否则抛出错误

* 暂时性死区

    如果区块中存在`let`和`const`命令，这个区块对这些命令声明的变量，**从一开始就形成了封闭作用域。凡是在声明之前就使用这些变量，就会报错**。

        var tmp = 123;
        if(true){
            tmp = 'abc';//报错
            typeof tmp;//报错ReferenceError
            let tmp;
        }
        //块级作用域内，`let`声明变量前，该变量不可用，哪怕外部由同名变量

    变量未声明前使用`typeof`操作符也会报错

        var x = x;//不会报错
        let x = x;//报错

    暂时性死区的本质就是，只要一进入当前作用域，所要使用的变量就已经存在了，但是不可获取，只有等到声明变量的那一行代码出现，才可以获取和使用该变量

* 不允许重复声明

    let不允许在同一个作用域内重复声明同一个变量
    不能再函数内部重新声明参数

### 块级作用域

#### ES5只有全局作用域和函数作用域没有块级作用域

    * 内层变量可能会覆盖外层变量

            var tmp = new Date();
            function f() {
              console.log(tmp);
              if (false) {
                var tmp = 'hello world';
              }
            }
            f();//undefined

        函数内部变量提升，导致tmp声明被提升到函数刚开始的地方，所以返回undefined

    * 用于计数的循环变量泄露为全局变量，导致闭包的出现

            var s = 'hello';
            for (var i = 0; i < s.length; i++) {
              console.log(s[i]);
            }
            console.log(i); // 5

#### ES6块级作用域

    let为JavaScript新增了块级作用域，块级作用域的出现使得立即执行函数不再必要

    * 一个代码块就是一个块级作用域
    * 块级作用域可以任意嵌套
    * 外层作用域无法读取内层作用域的变量
    * 内层作用域可以定义外层作用域的同名变量但不影响外层

#### 块级作用域中的函数声明

ES6规定块级作用域中可以声明函数，此函数在块级作用域外无法访问

**但是**，为了与老版本兼容，实际处理时，会将其转化为var形式的函数表达式处理，进行变量的提升等工作，所以**应该尽量避免在块级作用域中声明函数**

#### do表达式

暂时为提案，不了解


### `const`命令

声明只读常量，一旦声明，常量值不可改变

`const`一旦声明变量，就必须立刻初始化，不能留到以后赋值，否则会报错

`const`声明的变量与`let`相似，同一作用域内不能重复声明，存在暂时性死区，声明后才能使用

> `const`实际上保证的是变量指向的的栈内存地址的值不得改动。

对于简单类型的数据，值就保存在变量指向的栈内存地址中，因此等同于常量。

对于引用类型的数据，变量指向的栈内存地址中存储的仅是堆内存的一个地址引用。`const`只能保证这个指针的值不变，即不能对这个指针重新赋值。但是对原有引用类型数据的更改，不受其影响。

真正冻结对象，应该使用`Object.freeze`方法。

    const foo = Object.freeze({});
    // 常规模式时，下面一行不起作用；
    // 严格模式时，该行会报错
    foo.prop = 123;

### 全局变量与顶层对象

顶层对象，在浏览器环境指的是`window`对象，在`Node`指的是`global`对象

ES5中，全局变量即为顶层对象的属性。但是这样会导致一些问题：
* 没法在编译时就报出变量未声明的错误，只有运行时才能知道（因为全局变量可能是顶层对象的属性创造的，而属性的创造是动态的）
* 程序员很容易不知不觉地就创建了全局变量（比如打字出错）
* 顶层对象的属性是到处可以读写的，这非常不利于模块化编程

ES6中，对全局变量与顶层对象做了新的规定：
* 使用`var`和`function`声明的全局变量依旧是顶层对象的属性
* 使用`let`、`const`、`class`等命令声明的全局变量，不属于顶层对象的属性。

**从ES6开始，全局变量将逐步与顶层对象的属性脱钩**

## 变量的解构赋值

### 数组的解构赋值

ES6 允许按照一定模式，从数组和对象中提取值，对变量进行赋值，这被称为解构

    let [a,b,c] = [1,2,3];

* 这种写法本质属于“**模式匹配**”，只要等号两边的模式相同，左边的变量就会被赋予对应的值

        let [foo, [[bar], baz]] = [1, [[2], 3]];
        foo // 1
        bar // 2
        baz // 3
        let [ , , third] = ["foo", "bar", "baz"];
        third // "baz"
        let [x, , y] = [1, 2, 3];
        x // 1
        y // 3
        let [head, ...tail] = [1, 2, 3, 4];
        head // 1
        tail // [2, 3, 4]
        //...为剩余值的意思

* 如果**解构不成功**，变量的值就等于undefined

        let [foo] = [];
        let [bar, foo] = [1];

* **不完全解构**，等号左边的模式，只匹配一部分等号右边的数组

        let [x, y] = [1, 2, 3];
        x // 1
        y // 2
* 如果等号右边不是可遍历的结构，会报错
* 只要某种数据结构具有`Iterator`接口，都可以采用数组形式的解构赋值
* 若对应位置是个表达式，则该表达式惰性求值，即用到的时候再求值

#### 默认值

如果变量对应位置的数值严格等于undefined，则使用默认值（null不严格等于undefined，故不会生效）

### 对象的解构赋值

与数组解构赋值不同，按照变量与属性的名称取值。若等号右边不能解构，则报错
* **变量必须与属性同名**，才能取到正确的值，否则为`undefined`

    let { bar, foo } = { foo: "aaa", bar: "bbb" };
    foo // "aaa"
    bar // "bbb"

    let { baz } = { foo: "aaa", bar: "bbb" };
    baz // undefined

* 若变量与属性名不一致，则需要写成如下格式

        var { foo: baz } = { foo: 'aaa', bar: 'bbb' };
        baz // "aaa"

* 对象的解构赋值实质为
*
        let {foo：baz} ={foo:"aaa",bar:"bbb"};
        baz // "aaa"
        foo //error notdefined

foo是匹配的模式，baz才是真正的变量，真正被赋值的是baz

    let { bar, foo } = { foo: "aaa", bar: "bbb" };
    let { bar:bar, foo:foo } = { foo: "aaa", bar: "bbb" };

以上两句等价，第一句是第二句的简写

此处变量依然遵循不能重复声明的原则，注意赋值格式

    let foo;
    ({foo} = {foo: 1}); // 成功

    let baz;
    ({bar: baz} = {bar: 1}); // 成功

**此处需要用`()`包裹`{}`,否则解析器会将大括号理解为一个代码块**

嵌套赋值、默认值方面与数组解构赋值相同

如果解构模式是嵌套的对象，而且子对象所在的父属性不存在，那么将会报错。

    // 报错
    let {foo: {bar}} = {baz: 'baz'};

foo属性在等号右侧为undefined，再取子属性，就会报错

解构赋值允许等号左边的模式中，不防止任何变量名，虽无意义，但是合乎语法

    ({} = [true, false]);
    ({} = 'abc');
    ({} = []);

对象的解构赋值，可以很方便地将现有对象的方法，赋值到某个变量。

    let { log, sin, cos } = Math;

将Math对象的三个方法提取出来复制给相应变量，方便使用

数组本身即为特殊的对象，其内部元素和其他属性均可进行解构赋值

    let arr = [1, 2, 3];
    let {0 : first, [arr.length - 1] : last} = arr;
    first // 1
    last // 3

### 字符串的解构赋值

非对象或数组的解构赋值，先将其转换为对象

此时字符串被转换成一个类数组的对象

字符串内部可以通过str[index]访问，可使用数组解构赋值。另外其本身有length属性，可使用对象解构赋值

### 数值和布尔值的解构赋值

数值和布尔值的toString方法，可使用对象的解构赋值

undefined和null无法转换为对象，无法对其进行解构赋值，所以会报错

### 函数参数的解构赋值

函数传参也可理解为解构赋值

    function add([x, y]){
      return x + y;
    }

    add([1, 2]); // 3

带默认值的函数传参

    function move({x = 0, y = 0} = {}) {
      return [x, y];
    }

    move({x: 3, y: 8}); // [3, 8]
    move({x: 3}); // [3, 0]
    move({}); // [0, 0]
    move(); // [0, 0]

此例中为双重默认值。
* 如果函数被调用时有参数，则首先执行`{x = 0, y = 0} = 参数`进行赋值，再执行内部的赋值操作
* 如果函数被调用时没有参数，则首先执行`{x = 0, y = 0} = {}`进行外层默认赋值，然后再执行内层的默认赋值

### 圆括号的使用

* 变量声明语句中，不能带有圆括号
* 函数参数中，模式不能带有圆括号
* 赋值语句中，不能将整个模式，或嵌套模式中的一层，放在圆括号之中
    * 整个模式放入圆括号中

            ({ p: a }) = { p: 42 };
            ([a]) = [5];

    * 嵌套模式的一层，放在圆括号中

            [({ p: a }), { x: c }] = [{}, {}];

**赋值语句的非模式部分，可以使用圆括号**

### 用途

* 交换变量的值

        let x = 1;
        let y = 2;
        [x, y] = [y, x];

* 从函数返回多个值

        return [1,2,3]

* 函数参数的定义

    * 使用对象的解构赋值传参，参数无次序要求
    * 使用数组解构赋值传参，参数有次序要求

* 提取JSON数据

        let { id, status, data: number } = jsonData

* 函数参数的默认值
* 遍历Map结构

    map、set数据结构

* 获取模块的指定方法

        const { SourceMapConsumer, SourceNode } = require("source-map");

## 字符串的扩展

### 字符负的Unicode表示

JavaScript可以采用`\uxxxx`的方式表示字符，但是仅限0000~ffff之间，超出此范围的Unicode码必须用两个 双字节来表示。

ES6中，将字符的Unicode码放入大括号中，如`\u{20BB7}`便可以正确解读字符

### codePointAt()

字符编码大于0xFFFF时，JavaScript会使用双字节进行表示，并认为这是两个字符

    var s = "𠮷";
    s.length // 2
    s.charAt(0) // ''
    s.charAt(1) // ''
    s.charCodeAt(0) // 55362
    s.charCodeAt(1) // 57271

使用codePointAt()函数，可以正确返回字符的编码

    s.codePointAt(0).toString(16) // "20bb7"

### String.fromCodePoint()

此方法参数为Unicode编码，返回对应的字符，可以接受大于\uFFFF的编码值

### 字符串的遍历

字符串可以使用for...of进行循环遍历，并且此遍历方法能够识别Unicode编码大于0xFFFF的字符，传统的for循环不能识别

### 模板字符串

模板字符窜使用反引号(`)标识，作用有
* 定义普通字符串

        `In JavaScript '\n' is a line-feed.`

* 定义多行字符串

        `In JavaScript this is
        not legal.`

使用引号定义的字符串中不能存在换行，但是反引号内可以换行。

多行字符串内所有的空格、缩进、换行都会保存在字符串中

* 字符串中嵌入变量

        var name = "Bob", time = "today";
        `Hello ${name}, how are you ${time}?`

    在模板字符串内可以使用`${}`引用外部变量嵌入。大括号内部可以放入任意的JavaScript表达式，可以进行运算或引用对象属性

    模板字符串内可以调用函数

        `foo ${fn()} bar`

**模板字符串按照默认规则将大括号内的值转为字符串**

模板字符串可以进行嵌套

### 模板编译

### 标签模板

**标签模板**：模板字符串紧跟在一个函数名后，该函数将会被调用来处理这个模板字符串，模板字符串即为函数参数

模板字符串本身即为一种函数调用方式

多参情况：
* 函数的第一个参数是一个数组，成员为模板字符串中没有被变量替换的部分
* 其他参数为模板字符串各变量被替换后的值

例如：

    var a = 5;
    var b = 10;

    tag`Hello ${ a + b } world ${ a * b }`;
    // 等同于
    tag(['Hello ', ' world ', ''], 15, 50);

**“标签模板”的一个重要应用，就是过滤HTML字符串，防止用户输入恶意内容，对用户输入内容中的特殊字符进行转移**

模板处理函数的第一个参数（即模板字符串数组）同时具有raw属性，属性值为一个数组。其中保存着对模板字符串数组每个值转义后的字符串

    tag`First line\nSecond line`

    function tag(strings) {
      console.log(strings.raw[0]);
      // "First line\\nSecond line"
    }

字符串中的`\`被转义

### String.raw()

`String.raw`方法用于充当模板字符串的处理函数，返回一个斜杠都被转义的字符串。

如果原字符串的斜杠已经被转义，则不做任何处理

`String.raw`函数也可Uozu哦为正常函数使用，它的第一个参数，应该是一个具有raw属性的对象，且raw属性的值应该是一个数组

### 模板字符串的限制

模板字符串默认对字符串转义，导致了无法嵌入其他语言

## 正则的扩展

### 正则构造方法

* `new RegExp('xyz', 'i')`，同ES5
* `/xyz/i`，同ES5
* `new RegExp(/abc/ig,'i')`，ES6新增，第二个参数的修饰符会覆盖原有正则对象的修饰符，此表达式结果相当于`/abc/i`

### 字符串的正则

字符串对象共有四种方法可以使用正则：
* match
* replace
* search
* split

ES6中这四种方法全部调用RegExp的实例方法，如`String.prototype.match`调用`RegExp.prototype[Symbol.match]`等

### u修饰符

正则表达式中增加`u`修饰符，表示“Unicode模式”，用于处理大于`\uFFFF`的Unicode字符，以正确处理四个字节的UTF-16编码

`u`修饰符影响原有正则表达式行为

1. 点字符`.`

    点字符代表除了换行符之外的任意单个字符，但是对马甸大于0xFFFF的Unicode字符，点字符不能识别，需要加上u修饰符

        var s = '𠮷';

        /^.$/.test(s) // false
        /^.$/u.test(s) // true

2. Unicode的大括号表示

    当使用大括号表示Unicode字符时，必须使用u修饰符才能识别

3. 大括号内的量词

    * 使用u修饰符时，所有量词都可以正确识别码点大于`0xFFFF`的Unicode字符

			/𠮷{2}/.test('𠮷𠮷') // false
			/𠮷{2}/u.test('𠮷𠮷') // true

    * 使用u修饰符时，Unicode表达式中的大括号才能正确解读，不被解读为量词

    		/^\u{3}$/.test('uuu') // true

    * 在u模式下，使用正则表达式 的match方法可以正确获取字符串的长度
    * u模式下，可以识别非规范的字符

    		 /[a-z]/i.test('\u212A') // false
    		/[a-z]/iu.test('\u212A') // true
    	这两个编码都是大写的K，编码不同，但是字型很相近

4. y修饰符

y修饰符与g修饰符类似，从上一次匹配成功的下一个位置开始

**但是y修饰符要求匹配必须从第一个字符开始，否则匹配失败**

**进一步说，y修饰符隐含了头部匹配的标志`^`,y修饰符使得头部匹配在全局匹配中都有效**

5. 正则对象的sticky属性表示是否设置y修饰符
6. 正则对象的flags属性返回正则表达式的修饰符
7. 字符串的转义

        function escapeRegExp(str) {
          return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        }

    其中`$&`表示整个被匹配到的子串

    次函数可用于对字符串进行转义，转义后可以将字符串用于正则表达式的定义

8. s修饰符

    一般情况下，点（·。·）能够匹配除了换行符之外的任意单个字符

    s修饰符模式下，点（`.`）可以匹配任意单个字符，包括换行符。

    **注意，[^]为反选符，匹配不包含在方括号内的任意字符**

9. 先行断言与后行断言

    先行断言指只有当x在y前面时才匹配x，写法为`/x(?=y)/`

    先行否定断言是指只有当x不在y的前面才匹配x，写法为`/x(?!y)/`

    **ES6增加后行断言与后行否定断言**

    后行断言即为只有当x在y后面时才匹配x，写法为`/(?<=y)x/`

    后行否定断言是指只有当x不在y的后面才匹配x，写法为`/(?<!y)x/`

    **后行断言需要先匹配x，再回到左边匹配y，是从右向左的执行顺序，在贪婪匹配中，是右边尽可能多的匹配字符**

10. Unicode属性类

暂时不用

## 数值的扩展

### 二进制与八进制

* 二进制：`0b`或者`0B`
* 八进制：严格模式下使用`0o`

将`0b`与`0o`前缀字符串转化为十进制需要使用`Number()`方法

### Number.isFinite(),Number.isNaN()

* `Number.isFinite()`检测参数是否为有限的。仅对Number类型的有限值返回true，其余均返回false
* `Number.isNaN()`用于检测参数是否为NaN

传统的`isFinite()`与`isNaN()`方法会先调用`Number()`完成数据类型转换再进行判断，新的方法对非数据类型值，全部返回false

### Number.parseInt()与Number.parseFloat()

在ES6中，全局方法`parseInt()`与`parseFloat()`被移植到Number对象上，行为不变

目的为逐步减少全局性方法，增强模块化

### Number.isInteger()

函数用于判断一个值是否为整数。

注意：
* 此处依然是直接判断，不做类型转换
* JavaScript中，整数与浮点数存储方法相同，故3.0和3被视为同一个值

### Number.EPSILON

`Number.EPSILON`是一个极小的常量，用于在浮点数计算时设置一个误差范围。其实质即为一个可以接受的误差范围

    Number.EPSILON
    // 2.220446049250313e-16
    Number.EPSILON.toFixed(20)
    // '0.00000000000000022204'

如果误差小于`Number.EPSILON`，即可认为得到了正确结果

    5.551115123125783e-17 < Number.EPSILON
    // true

### 安全整数与Number.isSafeInteger()

JavaScript能够准确表示的的整数范围是`-2^53`到`2^53`之间，不包含两个端点。因此设置两个常量，表示范围的上下限

安全整数
* `Number.MAX_SAFE_INTEGER`范围的上限
* `Number.MIN_SAFE_INTEGER`范围的下限

函数`umber.isSafeInteger()`用于判断整数是否在准确表示的范围内。返回true有四项要求
* 类型为数值
* 数值是整数
* 大于范围的下限
* 小于范围的上限

函数的实现：

    Number.isSafeInteger = function (n) {
      return (typeof n === 'number' &&
        Math.round(n) === n &&
        Number.MIN_SAFE_INTEGER <= n &&
        n <= Number.MAX_SAFE_INTEGER);
    }

**当验证运算结果是否安全时，需要对参与运算的数组也进行验证，否则很容易出错**

    Number.isSafeInteger(9007199254740993 - 990)
    // true
    9007199254740993 - 990
    // 返回结果 9007199254740002
    // 正确答案应该是 9007199254740003

实例中第一个数组已经不是安全数字，在计算机内部存储时已经出错，所以运算结果是错误的

### Math对象的扩展

* `Math.trunc()`用于返回一个数字的整数部分，内部会调取Number()方法。对空值和无法截取整数的值，返回NaN
* `Math.sign()`用于判断一个数是正数、负数或者零
    * 参数为正数返回1
    * 参数为负数返回-1
    * 参数为0返回0
    * 参数为-0返回-0
    * 其他值返回NaN
* `Math.cbrt()`计算一个数的立方根，内部会调用`Number`方法
* `Math.clz32()`返回一个数的32位无符号整数形式有多少个前导0，此函数与左移运算符相关
* `Math.signbit()`判断一个数的符号位是否设置了

### 指数运算符

指数运算符`**`

    let a = 2;
    a **= 2;//a=a*a
    a **= 3;//a=a*a*a

对于过大数字的计算，可能会有差异

## 函数的扩展

### 默认参数

函数的参数默认声明，不能再用let或者const重复声明

函数默认值与解构赋值相结合

注意参数取默认值的顺序

    {x=0,y=0} = {}
    {x,y} = {x:0,y:0}

#### 参数默认值的位置

一般的，定义了默认值的参数应该放在函数参数的尾部，简化传参，否则无法省略该参数，因为还要对该参数后面的参数传参

可以使用undefined触发函数的默认值，null不能触发默认值

#### 函数的length属性

**函数的length属性将返回第一个有默认值参数之前的参数个数**

指定默认值后，length属性将会失真、length参数意义在于函数预期传入的参数个数，指定默认值后，预期参数就不包括这个参数

当设置了默认值的参数不是尾参数时，length属性不再计入后面的参数

#### 默认参数的作用域链

设置参数的默认值后，参数会形成一个不同于函数作用域的单独作用域链，在初始化结束后，此作用域就会消失。如果不设置参数默认值，不会出现这种作用域

参数作用域中包含本函数的所有参数，父作用域是函数的外层作用域，与函数本身作用域无关

    function foo (y = x) {
        let x = 2;
    }//报错，父作用域下未定义x
    let x = 2;
    functon f00 (x,y = x) {
    }//在参数作用域中，y的默认值现在本作用域中查找，指向第一个参数x
    functon f00 (y = x) {
    }//在参数作用域中无x，所以y的默认值指向父作用域中的x
    function foo (x = x) {
    }//报错，参数作用域中形成暂时性死区

#### 指定不可省略参数

为不可省略的参数指定默认值为一个错误抛出函数，在定义的时候在函数名后加括号。当函数执行时，如果未对该参数赋值，则执行错误抛出函数抛出错误

另外，可以将参数默认值设置为undefined，表明该参数是可以省略的

###  rest参数

使用rest参数获取函数多余的参数，避免使用arguments对象。

**rest参数形式为`...values`,values为一个数组，该变量将多余的变量放入数组中**

利用rest参数可以向函数传入任意多个参数，函数的length属性不包括rest参数

**rest参数后不能再有其他参数，否则会报错**

### 严格模式

ES5中函数可以设置严格模式，ES6对其做了修改

规定函数参数使用默认值、解构赋值、扩展运算符，函数内部就不能现实的定义为严格模式，否则会报错

### name属性

函数的name属性返回函数的函数名

* 将匿名函数赋值给变量，ES6中name属性返回实际的函数名，ES5中返回空字符串
* 将具名函数赋值给变量，ES5和ES6中都会返回函数原来的名字
* Function构造函数返回的函数实例，name属性的值为anonymous
* bind返回的函数，name属性值会加上bound前缀

### 箭头函数

    var f = v => v;
    //等价于
    var f = function (v) {
        return v;
    }

当函数不需要参数或者需要多个参数时，可以使用圆括号代表参数部分

    var f = () => 5;

当箭头函数的代码块多于一条语句时，使用大括号将其包裹起来

由于大括号被解释为代码块，所以如果箭头函数直接返回一个对象，必须在对象外面加上括号。

    var getTempItem = id => ({ id: id, name: "Temp" });

箭头函数重点
* **箭头函数自身没有this对象**，其内部使用的this，是定义时所在的对象，不是使用时所在的对象
* 箭头函数不可以作为构造函数
* **箭头函数了内部没有arguments对象**，可以使用rest对象代替
* 箭头函数不能用作Generator函数

箭头函数中不存在：this、arguments、super、new.target

箭头函数不能使用call、apply、bind改变this指向

#### 嵌套的箭头函数

箭头函数之间的互相嵌套

### 绑定this

ES7中提出函数绑定运算符，双冒号(::)

双冒号左边是一个对象，右边是一个函数，运算符会将左侧的对象作为上下文环境，绑定到右侧的函数上

    foo::bar;
    // 等同于
    bar.bind(foo);

    foo::bar(...arguments);
    // 等同于
    bar.apply(foo, arguments);

如果双冒号左侧为空右侧为一个对象的方法，则等于将该方法绑定在该对象上面、

    var method = obj::obj.foo;
    // 等同于
    var method = ::obj.foo;

### 尾调用

指一个函数的最后一步是调用另一个函数

	function foo (x){
		return g(x);
	}

**以下情况不属于尾函数调用**

	function foo (x){
		g(x);
	}

上面函数中最后一步还有`return undefined`

### 尾调用优化

函数调用时会在内存中形成调用记录，又称调用帧，用于保存调用位置与内部变量等信息，所有的调用帧形成调用栈。A调用B，则A调用帧的上方就会形成一个B的调用帧，B执行完成后返回结果到A，B的调用帧才会消失。

但是由于尾调用是函数的最后一步操作，不需要保存外层函数的调用帧，当不需要用到外层函数中的内部变量时，直接使用内层函数的调用帧取代外层函数的调用帧即可

**尾函数调用优化即为只保留内层函数的调用帧，函数的每次执行只有一项调用帧，节省内存**

**只有内层函数不需要用到外层函数的变量时才会用到尾函数优化**

#### 严格模式

尾调用优化仅在严格模式下开启

函数中存在的`arguments`和`caller`两个变量可以跟踪函数的调用栈，尾调用优化时，函数调用栈改写，两个变量失真。而严格模式下禁用这两个变量，故尾调用仅在严格模式下使用。

#### 尾递归优化

递归函数尾调用自身即为尾递归

递归调用时生成递归帧较多，容易发生栈溢出。当使用尾调用优化时，确保最后一步只调用自身，只存在一个调用帧，永远不会发生栈溢出。

#### 递归函数改写

**尾递归的实现需要确保函数最后一步调用自身，将所有用到的内部变量改写为函数的参数**

由于函数参数增加后不易读，故需要改写递归函数。递归函数的改写分为两种

* 将尾递归函数包裹在正常形式函数中
* 函数柯里化，使用单参数+默认传参的形式

		function currying(fn, n) {
		  return function (m) {
		    return fn.call(this, m, n);
		  };
		}

		function tailFactorial(n, total) {
		  if (n === 1) return total;
		  return tailFactorial(n - 1, n * total);
		}

		const factorial = currying(tailFactorial, 1);

		factorial(5) // 120

#### 尾递归优化的实现

此处主要指非严格模式下实现尾递归优化，其主要原理为用循环代替递归，将递归调用条件变为循环控制条件

蹦床函数可以将递归执行转化为循环执行

	function trampoline(f) {
	  while (f && f instanceof Function) {
	    f = f();
	  }
	  return f;
	}

真正尾递归优化实现

	function tco(f) {
	  var value;
	  var active = false;
	  var accumulated = [];

	  return function accumulator() {
	    accumulated.push(arguments);
	    if (!active) {
	      active = true;
	      while (accumulated.length) {
	        value = f.apply(this, accumulated.shift());
	      }
	      active = false;
	      return value;
	    }
	  };
	}

	var sum = tco(function(x, y) {
	  if (y > 0) {
	    return sum(x + 1, y - 1)
	  }
	  else {
	    return x
	  }
	});

	sum(1, 100000)
	// 100001

本例中，只有第一次调用sum函数时会进入if判断中，后续的sum函数调用均不会执行if中内容，其作用仅为向accumulated数组添加参数，每次执行返回值均为undefined

### 函数参数后的尾逗号

ES2017允许在函数在定义和调用时参数列表的最后添加一个逗号

	function clownsEverywhere(
	  param1,
	  param2,
	) { /* ... */ }

	clownsEverywhere(
	  'foo',
	  'bar',
	);

其作用为当参数分行写时，避免因为新添加参数导致最后一行在版本管理系统中出现改动


## 数组扩展

### `Array.from()`

此方法用于将类数组对象与可遍历对象转换为数组，即任何具有length属性的对象，都可以被转换为数组

类数组对象：DOM中的NodeList集合，函数的arguments参数对象

可遍历对象：具有iterator接口

在ES5中，此类转化可以使用原型链的方法解决

    let arrayLike = {
        '0': 'a',
        '1': 'b',
        '2': 'c',
        length: 3
    };

    // ES5的写法
    var arr1 = [].slice.call(arrayLike); // ['a', 'b', 'c']

    // ES6的写法
    let arr2 = Array.from(arrayLike); // ['a', 'b', 'c']

*扩展运算符也可以将具备iterator接口的数据结构转换为数组*

    var array = [...arguments];
    var array = [...document.querySelectorAll('div')]

Array.from()可以把任何具有length属性的对象转换为数组，如

    var array = Array.from({length:3});
    //[undefined,undefined,undefined]

Array.from()第二个参数为一个函数，作用类似于数组的map遍历

    Array.from([1,2,3],(x)=>x*x);

    function typesOf () {
        return Array.from(arguments, value => typeof value)
    }
    typesOf(null, [], NaN)
    // ['object', 'object', 'number']

*Array.from()可以将字符串转化为数组然后求长度，避免js将大于`\uffff`的Unicode字符算作两个字符*

### Array.of()

此方法将一组值转换为数组，用于弥补传统数组构造函数Array()因为参数数目不同导致的行为差异.

与数组构造函数相比，Array.of()可以代替Array()或new Array()，不存在由于参数不同导致的重载，行为统一

Array.of()方法可以使用ES5中数组的slice原型方法代替实现

    function ArrayOf () {
        return [].slice.call(arguments)
    }

### copyWithin()方法

在数组内部将指定位置的值复制到其他位置，会覆盖原有成员，然后返回当前数组。（此方法会改变当前数组）

    Array.prototype.copyWithin(target, start = 0, end = this.length)

    * target（必需）：从该位置开始替换数据。被替换的数目与复制的数目相同
    * start（可选）：从该位置开始读取数据，默认为0。如果为负值，表示倒数。
    * end（可选）：到该位置前停止读取数据，默认等于数组长度。如果为负值，表示倒数。

    [1,2,3,4,5].copyWithin(0,3,4) // [4,2,3,4,5]
    [1,2,3,4,5].copyWithin(0,2) // [3,4,5,4,5]

### find()和findIndex()

这两个方法的参数为回调函数，回调函数类似于map方法的回调函数。数组成员依次执行该回调函数直到找到第一个返回true的成员

find()方法可以依据条件查找数组中第一个符合条件的项，返回该项。如果没有查找到返回undefined

findIndex()方法可以依据条件查找数组中第一个符合条件的项，返回该项的位置，如果没有查找到返回-1

这两个方法可以弥补indexOf不能识别某些数组成员的问题

### fill()

使用给定值填充数组

    ['a','a','a'].fill(7) // [7,7,7]
    new Array(3).fill(7)  // [7,7,7]

第二和第三个参数用于指定填充的起始和结束位置，填充不包括结束位置

    ['a','a','a','a','a'].fill(7,1,3) // ['a',7,7,7,'a']

### entries() keys() values()

三种对数组的遍历方法，返回一个遍历器对象

* entries(): 对键值对的遍历
* keys(): 对键名的遍历
* values(): 对键值的遍历

### includes()

返回一个布尔值，表明数组中是否包含给定的值，与字符串includes方法相似。*对NaN也适用*

第二个参数指定搜索开始位置，负值为倒数，大于数组长度值会重置为0

indexOf方法不够直观，对NaN不支持

注意Map与Set中has方法的区别
* Map中has方法用于查找键名
* Set中has方法用于查找键值

### 数组的空位

数组中的空位没有任何值，也不是undefined。

    0 in [undefined, undefined, undefined] // true
    0 in [, , ,] // false

*一个位置的值如果是undefined，也是有值的*分

*ES6中明确将空位转为undefined，数组的新增的各种遍历或替换方法不会忽略空位。但是旧的遍历方法如map会跳过空位*

由于空位处理规则不一致，避免在数组中出现空位

## 对象的扩展

### 属性与方法的简洁表示

直接写入变量和函数，最为对象的属性和方法

	function f(x, y) {
	  return {x, y};
	}

属性名为变量值，属性值为变量值

	const o = {
	  method() {
	    return "Hello!";
	  }
	};

方法定义简写

**属性赋值器与取值器的简写**

	const cart = {
	  _wheels: 4,

	  get wheels () {
	    return this._wheels;
	  },

	  set wheels (value) {
	    if (value < this._wheels) {
	      throw new Error('数值太小了！');
	    }
	    this._wheels = value;
	  }
	}

**简写的属性名为字符串，不会与关键字冲突**

generator函数的定义在函数名前加*即可

	const obj = {
	  * m() {
	    yield 'hello world';
	  }
	};

### 属性名表达式

* 使用标识符作为属性名
* 使用表达式作为属性名

		let lastWord = 'last word';

		const a = {
		  'first word': 'hello',
		  [lastWord]: 'world'
		};

		a['first word'] // "hello"
		a[lastWord] // "world"
		a['last word'] // "world"

方法名也可以使用表达式定义

**属性名表达式与简洁表示法不能同时使用**

note：属性名表达式如果是一个对象，则会自动将对象转化为[object Object]

### 方法的name名

方法的name属性返回函数名

**如果对象的方法使用了`getter`和`setter`，则name属性位于该方法的属性描述对象的get与set上面，返回值为方法名前加get与set**

	const obj = {
	  get foo() {},
	  set foo(x) {}
	};

	obj.foo.name
	// TypeError: Cannot read property 'name' of undefined

	const descriptor = Object.getOwnPropertyDescriptor(obj, 'foo');

	descriptor.get.name // "get foo"
	descriptor.set.name // "set foo"

* bind方法创造的函数，name属性返回bound + 原函数名
* Function构造函数创造的函数，name属性返回anonymous
* 如果对象的方法名是一个symbol值，name属性返回symbol的描述

### object.is()

**同值相等**，与严格比较运算符行为基本一致，区别在于

* `+0` 不等于 `-0`
* NaN 等于 NaN

ES5部署object.is

	Object.defineProperty(Object, 'is', {
	  value: function(x, y) {
	    if (x === y) {
	      // 针对+0 不等于 -0的情况
	      return x !== 0 || 1 / x === 1 / y;
	    }
	    // 针对NaN的情况
	    return x !== x && y !== y;
	  },
	  configurable: true,
	  enumerable: false,
	  writable: true
	});

### objec.assign()

#### 基本用法

用于对象合并，将源对象所有可枚举属性复制到目标对象，包括对象内部的方法**忽略继承属性与不可枚举属性**

**复制时仅会拷贝属性的值，忽略其背后的get与set方法**

	Object.assign(target, source1, source2);

同名属性后面的属性覆盖前面的属性

* 若只有一个参数
	* 参数类型为对象，直接返回该参数
	* 若该参数不是对象，转化为对象后返回
* 非对象参数（number、string、bool）出现在source位置
	* 字符串会以数组形式拷入目标对象
	* 其他值忽略
* 参数中有无法转化为对象的值，如undefined与null
	* 若该值位于首位，则报错
	* 若该值不位于首位，则忽略

#### note

1. 浅拷贝

	Object.assign只进行浅拷贝

2. 同名属性替换

	同名属性后者覆盖前者

3. 数组处理

	数组按照对象进行处理，key与value

4. 取值函数处理

	针对取值函数，对其求值后复制进目标对象中

		const source = {
		  get foo() { return 1 }
		};
		const target = {};

		Object.assign(target, source)
		// { foo: 1 }

#### 常见用途

1. 为对象添加属性
2. 为对象添加方法
3. 克隆对象，只能克隆自身属性

	克隆继承属性：

		function clone(origin) {
		  let originProto = Object.getPrototypeOf(origin);
		  return Object.assign(Object.create(originProto), origin);
		}

4. 合并多个对象
5. 为属性指定默认值

由于是浅拷贝，尽量只操作简单类型值

### 属性的可枚举性和遍历

#### 可枚举性

Object.getOwnPropertyDescriptor属性获取对象特定属性的描述对象

	let obj = { foo: 123 };
	Object.getOwnPropertyDescriptor(obj, 'foo')
	//  {
	//    value: 123,
	//    writable: true,
	//    enumerable: true,可枚举性
	//    configurable: true
	//  }

enumerable属性代表可枚举性，该属性为false时，代表该属性不可枚举，以下操作会忽略不可遍历属性

* for...in 循环：只遍历对象自身的和**继承**的可枚举属性
* Object.keys()：返回对象自身所有可枚举属性的键名
* JSON.stringify()：串行化对象自身的可枚举属性
* Object.assign()：只拷贝对象自身的可枚举属性

**所有class的原型方法都是不可枚举的**

#### 属性的遍历

* for...in：遍历对象自身和**继承**的可枚举属性
* Object.keys(obj):返回一个数组，包括对象自身的（不含继承的）所有可枚举属性（不含 Symbol 属性）的键名
* Object.getOwnPropertyNames(obj):返回一个数组，包含对象自身的所有属性（不含 Symbol 属性，但是包括不可枚举属性）的键名
* Object.getOwnPropertySymbols(obj)：返回一个数组，包含对象自身的所有 Symbol 属性的键名
* Reflect.ownKeys(obj)：返回一个数组，包含对象自身的所有键名，不管键名是 Symbol 或字符串，也不管是否可枚举

遍历规则：
* 首先遍历所有的数值键，按照数值升序排列
* 其次遍历所有的字符串键，按照**加入时间**升序排列
* 最后遍历所有的symbol键，按照**加入时间**升序排列


### Object.getOwnPropertyDescriptors：与Object.getOwnPropertyDescriptor类似，返回对象所有**自身属性**的描述对象

        const obj = {
          foo: 123,
          get bar() { return 'abc' }
        };

        Object.getOwnPropertyDescriptors(obj)
        // { foo:
        //    { value: 123,
        //      writable: true,
        //      enumerable: true,
        //      configurable: true },
        //   bar:
        //    { get: [Function: get bar],
        //      set: undefined,
        //      enumerable: true,
        //      configurable: true } }

方法实现：使用Reflect.ownKeys()与Object.getOwnPropertyDescriptor可以实现该函数

用法：

* 避免Object.assign()函数拷贝对象时无法正确拷贝get与set属性。通过获取到所有属性的descriptor在使用assign进行合并

* 配合Object.create方法，将对象属性克隆到一个新的对象，完成浅拷贝

    * note

        Object.create(proto, [propertiesObject])函数会新创建一个对象，proto作为新创建对象的原型对象，第二个可选参数添加到新创建对象自身的可枚举属性中，作为其**属性描述符**以及相应的属性名称

        如果不显示声明，第二个参数中的属性默认不可遍历

* 完成对象继承

    完成对象继承的几种办法：

    * create

        const obj = Object.create(prot);
        obj.foo = 123;

    * create + assign

        const obj = Object.assign(
          Object.create(prot),
          {
            foo: 123,
          }
        );

    * create + getOwnPropertyDescriptors

        const obj = Object.create(
          prot,
          Object.getOwnPropertyDescriptors({
            foo: 123,
          })
        );

### __proto__属性，Object.setPrototypeOf()，Object.getPrototypeOf()

#### __proto__属性

用于获取当前对象的原型对象，不建议使用，尽量使用一下函数代替

* Object.setPropertyOf()：写操作
* Object.getPropertyOf()：读操作
* Object.create()：生成操作

#### Object.setPropertyOf()

用于设置对象的原型对象

    Object.setPrototypeOf(object, prototype)

* 如果第一个参数不是对象，会将其转化为对象，最终返回的还是第一个参数

* 如果第一个参数不能转化为对象，即null和undefined，报错

#### Object.getPropertyOf()

获取参数的原型对象

* 如果参数不是对象，会自动转为对象

* 如果参数不能转换为对象，报错

### super

this关键字指向函数所在的当前对象，super指向当前对象的原型对象

**super表示原型对象时，只能用在对象的方法中**，而且只能用在对象方法的简写方式中

super.foo 等同于 Object.getPrototypeOf(this).foo（针对属性）或 Object.getPrototypeOf(this).foo.call(this)（针对方法）

### Object.keys()，Object.values()，Object.entries()

#### Object.keys()

ES5引入

#### Object.values()

返回一个数组，其中成员是参数对象自身的（不含继承的）所有可遍历（enumerable）属性的键值，并过滤key为symbol的属性

**遍历顺序与之前介绍的顺序相同**

* 若参数不为对象，会将其转换为对象
* 由于数值和布尔值的包装对象，都不会为实例添加非继承的属性。所以，Object.values会返回空数组

#### Object.entries

返回一个数组，成员是参数对象自身的（不含继承的）所有可遍历（enumerable）属性的键值对数组，并过滤key为symbol的属性

用途：

* 构建Map对象
* 遍历对象属性

### 对象扩展运算符

#### 解构赋值

    let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };
    x // 1
    y // 2
    z // { a: 3, b: 4 }

* 解构赋值只能是等号左边最后一个参数
* 解构赋值等号右边必须是一个对象或者可以转化为对象，否则报错
* 解构赋值仅赋值自身属性
* 解构赋值浅拷贝

**用于扩展对象输入**

#### 扩展运算符

对象的扩展运算符用于出去参数对象的所有可遍历属性，拷贝到当前对象中

    let z = { a: 3, b: 4 };
    let n = { ...z };
    n // { a: 3, b: 4 }

注意：

* 扩展运算符后面可以使用表达式

        const obj = {
          ...(x > 1 ? {a: 1} : {}),
          b: 2,
        };

* 扩展运算符参数为null或undefined会被忽略

* 扩展运算符的参数列表中，如果有取值函数get，函数会被执行


用途：

* 对象的克隆

    完整克隆一个对象包括对象原型+对象实例本身


        // 写法一
        const clone2 = Object.assign(
          Object.create(Object.getPrototypeOf(obj)),
          obj
        );

        // 写法二
        const clone3 = Object.create(
          Object.getPrototypeOf(obj),
          Object.getOwnPropertyDescriptors(obj)
        )

* 对象的合并

        let ab = { ...a, ...b };
        // 等同于
        let ab = Object.assign({}, a, b);

**同名属性后面的属性值会覆盖前面的属性值**，自定义属性放在前面为默认属性值，自定义属性放在后面为强制修改

    let aWithOverrides = { ...a, x: 1, y: 2 };

* 修改现有对象部分属性

        let newVersion = {
          ...previousVersion,
          name: 'New Name' // Override the name property
        };

