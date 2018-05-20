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

`Symbol.for`会被登记在全局环境中，可以在不同的`iframe`或`service work`中访问到同一个值

## 实例

使用symbol实现模块的`Singleton`模式，即多次调用同一个模块返回的是同一个实例

解决办法为将新建的实例存储在全局对象中，其key值为一个symbol.for建立的symbol值

优点：

1. 由于symbol值独一无二，可以避免全局对象下属性值不经意的修改

2. 需要修改时，可以使用symbol.for进行修改，保证自由度

**不能直接使用symbol()建立的symbol值作为key。**因为每一次模块的执行都会新建一个symbol值，导致每次得到的key值是不一样的。即使node会将脚本的执行结果缓存，但是并不是你绝对可靠。

## 内置的symbol值

ES6提供了11个内置的symbol值，以供语言内部使用

### `Symbol.hasInstance`

对象的`Symbol.hasInstance`属性，指向一个内部方法

`foo instanceof Foo` 实际调用的是 `Foo[Symbol.hasInstance](foo)`

构造函数内部有Symbol.hasInstance方法，可以自行定义进行测试。如下所示

    class Even {
      static [Symbol.hasInstance](obj) {
        return Number(obj) % 2 === 0;
      }
    }

    // 等同于
    const Even = {
      [Symbol.hasInstance](obj) {
        return Number(obj) % 2 === 0;
      }
    };

    1 instanceof Even // false
    2 instanceof Even // true
    12345 instanceof Even // false

### `Symbol.isConcatSpreadable`

对象的`Symbol.isConcatSpreadable`属性等于一个布尔值，表示对象使用`Array.prototype.concat()`方法时，能否展开。

针对数组：

* 属性值默认为undefined，可以展开
* 属性值置为true时，也有展开效果
* 属性值置为false时，不展开

类数组对象：

* 默认不展开
* 属性值设为true，才可以展开

`Symbol.isConcatSpreadable`属性的定义，可以在类的定义中完成

* 在实例中定义属性

        class A1 extends Array {
          constructor(args) {
            super(args);
            this[Symbol.isConcatSpreadable] = true;
          }
        }

* 在类本身中定义

        class A2 extends Array {
          constructor(args) {
            super(args);
          }
          get [Symbol.isConcatSpreadable] () {
            return true;
          }
        }

在两个位置定义效果相同

### `Symbol.species`

`Symbol.species`定义的属性用于指定**衍生对象**的构造函数。

衍生对象：

    class MyArray extends Array {
    }

    const a = new MyArray(1, 2, 3);
    const b = a.map(x => x);
    const c = a.filter(x => x > 1);

其中b和c即为a的衍生对象，默认情况下b和c的构造函数与a的相同

**`Symbol.species`属性使用`get`取值器定义，衍生对象使用该属性返回的函数作为构造函数。**

    class MyArray extends Array {
      static get [Symbol.species]() { return Array; }
    }

    const a = new MyArray();
    const b = a.map(x => x);

    b instanceof MyArray // false
    b instanceof Array // true

promise的then方法也属于创建衍生对象的过程

### `Symbol.match`

用于字符串的match操作。

当执行`str.match(myObject)`时，会调用`myObject`内部`Symbol.match`方法，str作为参数注入该方法，最后返回该方法的返回值

### `Symbol.replace`

当对象被`String.prototype.replace`方法调用时，会返回该方法的返回值

`Symbol.replace`方法接收两个参数，即调用replace的对象与替换后的值

### `Symbol.search`

同上

### `Symbol.split`

### `Symbol.iterator`

指向该对象的默认遍历器方法

对象进行`for...of`循环时，会调用`Symbol.iterator`方法，返回对象的默认遍历器

一般使用generator函数的yield指定每次返回值

### `Symbol.toPromitive`

对象被转为原始类型的值时，会调用这个方法，返回该对象对应的原始类型值

该方法被调用时接收一个字符串参数，表明当前运算的模式

* Number，需要转化为数值
* String，需要转化为字符串
* Default，可以转化为数值也可以转化为字符串

### `Symbol.toStringTag`

指向一个方法，当调用`Object.prototype.toString`时，此方法返回值将出现在toString方法返回的字符串中，表示对象的类型。

如`[object Object]`或者`[object Array]`中的第二项

### `Symbol.unscopables`

指向一个对象，指定当对该对象使用`with`关键字时，在with环境中会被忽略的属性

    // 有 unscopables 时
    class MyClass {
      foo() { return 1; }
      get [Symbol.unscopables]() {
        return { foo: true };
      }
    }

    var foo = function () { return 2; };

    with (MyClass.prototype) {
      foo(); // 2
    }

如上例所示，`Symbol.unscopables`中指定foo的值为true，表示其会被with环境忽略，故其会执行外层作用域下的foo函数