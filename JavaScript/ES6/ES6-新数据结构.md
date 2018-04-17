# 数据结构

# set

## 基础

新数据结构，类似于数组，成员值唯一，没有重复

Set是一个构造函数，用于生成Set数据结构，使用add向其中添加成员

    const s = new Set();

    [2, 3, 5, 4, 5, 2, 2].forEach(x => s.add(x));

Set构造函数接收一个数组或者其他具有iterable接口的数据结构（如类数组对象）作为参数

    const set = new Set([1, 2, 3, 4, 4]);

    const set = new Set(document.querySelectorAll('div'));

**Set可以用于去除数组重复成员，但是set不会对成员进行数据类型的转化**

Set内部判断两个值是否相等算法类似于精确相等运算符（`===`），区别对于Set在于`NaN`等于`NaN`

## 属性与方法

### 实例属性

* `Set.prototype.constructor`：指向构造函数Set
* `Set.prototype.size`:返回实例的成员总数

### 实例方法

实例方法分为操作方法与遍历方法

#### 操作方法

* add(value)：添加，返回Set结构本身
* delete(value)：删除，返回bool值，表示删除是否成功
* has(value)：查找，返回bool值，代表该值是否存在于实例中
* clear()：清除所有成员，无返回值

**Array.from()可以将Set结构转换为数组**

    const items = new Set([1, 2, 3, 4, 5]);
    const array = Array.from(items);

去除数组中重复成员方法：

    function dedupe(arr) {
        return Array.from(new Set(arr))
    }

#### 遍历操作

* keys()；返回键名遍历器
* values()：返回键值遍历器

    由于Set结构没有键名只有键值，或者键名与键值相同，所以keys和values方法行为相同

* entries()：返回键值对遍历器

    如下例：

        let set = new Set(['red', 'green', 'blue']);

        for (let item of set.keys()) {
          console.log(item);
        }
        // red
        // green
        // blue

        for (let item of set.entries()) {
          console.log(item);
        }
        // ["red", "red"]
        // ["green", "green"]
        // ["blue", "blue"]

    **默认遍历器**

    对象的`[Symbol.iterator]`属性指向其`for...of`循环时的默认遍历器方法。

    Set的默认遍历器方法即为`values()`方法

        Set.prototype[Symbol.iterator] === Set.prototype.values

    故可以直接使用`for...of`循环遍历Set

* forEach()：使用回调函数遍历每个成员

        set = new Set([1, 4, 9]);
        set.forEach((value, key, set) => console.log(key + ' : ' + value), this)

    * 回调函数三个参数分别为value，key和set本身，其中value和key相等
    * forEach的第二个参数用于指定处理函数内部的this

* 扩展运算符

    扩展运算符内部使用`for...of`循环，故可以用于Set

        let arr = [3, 5, 2, 2, 5, 5];
        let unique = [...new Set(arr)];


**目前无法再遍历时同步改变Set**，可以使用其他方法辅助完成

* 使用Array.from()

    let set = new Set([1, 2, 3]);
    set = new Set(Array.from(set, val => val * 2));

* 将原有的set结构映射为数组，再将数组转为set

    let set = new Set([1, 2, 3]);
    set = new Set([...set].map(val => val * 2));


# WeakSet

与Set结构区别：

* 内部成员只能是对象
* 弱引用，不计入引用计数，成员随时可能被垃圾回收，**不可遍历**

    WeakSet 适合临时存放一组对象，以及存放跟对象绑定的信息。只要这些对象在外部消失，它在 WeakSet 里面的引用就会自动消失

WeakSet是构造函数，接收任何具有iterable接口的对象，如数组、类数组对象等

    const a = [[1, 2], [3, 4]];
    const ws = new WeakSet(a);

定义完之后，数组的所有成员均自动成为WeakSet实例对象的成员，而WeakSet要求内部成员只能为对象，所以要求**数组的每一项也必须为对象**

## 内部方法

* WeakSet.prototype.add(value)，添加
* WeakSet.prototype.delete(value)，删除
* WeakSet.prototype.has(value)，查找，返回布尔值

**无法遍历WeakSet，所以没有size属性与froEach方法**

## 用途

* 存储dom节点，不用担心内存泄漏
* 存储对象实例使用，且在删除实例时，不需要考虑WeakSet中的内容

# map

object中key只能是字符串，如果使用非字符串的key，会默认将其转化为字符串

map结构避免此类限制，各种数据类型的值都可以作为key，包括object

* object提供“字符串——值”的对应关系
* Map提供“值——值”的对应关系，更为完善

## 构造实例

* 使用构造函数传参

        const m = new Map();

        const map = new Map([
          ['name', '张三'],
          ['title', 'Author']
        ]);

    Map构造函数接收任何具有iterator接口、且每个成员都是一个双元素数组的数据结构作为参数，故Set和Map都可以用于生成新的Map

* 使用实例的set方法

        const m = new Map();

        const m = new Map();
        const o = {p: 'Hello World'};

        m.set(o, 'content')
        m.get(o) // "content"

    使用实例的set方法，其参数分别为key和value

    对同一个键多次赋值，后面的值将会覆盖前面

* **当使用对象作为key时，需要注意对象为引用类型。只有对同一个对象的引用，才会被视为同一个键**
* **使用简单类型值作为key时，只要两个值严格相等，就会被视为同一个键**

## 属性与方法

* size：返回Map结构的成员总数
* set(key, value)：返回整个Map结构
* get(key)：返回对应的键值，若不存在返回undefined
* has(key)：返回布尔值
* delete(key)：返回布尔值值，false表示删除失败
* clear()：无返回值

## 遍历方法

* keys()
* values()
* entries()
* forEach()

**Map的遍历顺序就是插入顺序，与对象的便遍历顺序相同**

各方法的使用与set相同

## Map与其他数据结构的转换

* Map ——> 数组：扩展运算符
* 数组 ——> Map：Map构造函数
* Map ——> 对象

        function strMapToObj(strMap) {
          let obj = Object.create(null);
          for (let [k,v] of strMap) {
            obj[k] = v;
          }
          return obj;
        }

* 对象 ——> Map

        function objToStrMap(obj) {
          let strMap = new Map();
          for (let k of Object.keys(obj)) {
            strMap.set(k, obj[k]);
          }
          return strMap;
        }

* Map ——> JSON

    * 键名均为字符串，转为对象json：```JSON.stringify(strMapToObj(strMap))```
    * 键名有非字符串，转为数组json：```JSON.stringify(...strMap)```

* JSON ——> Map

    * 键名均为字符串：```objToStrMap(JSON.parse(jsonStr))```
    * JSON为数组，每个数组成员是本身有两个成员的数组

            function jsonToMap(jsonStr) {
              return new Map(JSON.parse(jsonStr));
            }

            jsonToMap('[[true,7],[{"foo":3},["abc"]]]')


## WeakMap

### 区别：

* 只接受对象作为键名
* 键名弱引用，键名所指的对象不计入垃圾回收机制

用于为某个对象存储对应数据，对象被清除后，其对应的WeakMap记录自动清除，**避免内存泄漏**

**仅键名是弱引用，键值时正常引用**

### 方法

* 没有遍历操作
* 没有clear方法

* set()
* get()
* has()
* delete()

**note**

可以通过查看内存使用情况判断WeakMap的执行

### 典型应用

* 使用DOM节点作为key，为其存储数据
* 部署私有属性

    在全局WeakMap中存储实例的私有属性，实例清除后属性消失


>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


* node --expose-gc：表示在手动执行垃圾回收机制的情况下运行node
* process.memoryUsage()：查看内存使用情况
* global.gc()：执行垃圾回收
