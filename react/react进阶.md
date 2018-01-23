# React进阶

## JSX

JSX本质为React.createElement()的语法糖

### React的声明

JSX编译后会调用React.createElement方法，故需要提前声明引入react变量

### 点表示法

组件自身也可作为一个对象的属性存在

### 首字母大写

React组件名首字母必须为大写。

React中默认首字母小写的为HTML标签，大写的为React组件，将调用React.component进行编译

### 运行时选择组件类型

如需运行时根据变量确定所使用的元素类型，需要将其先赋值给一个大写字母开头的变量，再用这个变量进行组件的渲染

	import React from 'react';
	import { PhotoStory, VideoStory } from './stories';
	
	const components = {
	  photo: PhotoStory,
	  video: VideoStory
	};
	
	function Story(props) {
	  // 正确！JSX 标签名可以为大写开头的变量。
	  const SpecificStory = components[props.storyType];
	  return <SpecificStory story={props.story} />;
	}

### 属性的使用

JSX中有几种不同的方式指定属性

#### javascript表达式

使用javascript表达式对属性进行赋值

	<MyComponent foo={1 + 2 + 3 + 4} />

注意：if和for不算表达式

#### 字符串常量

可以将字符串常量作为属性值传递

	<MyComponent message="hello world" />

	<MyComponent message={'hello world'} />

两种方法等价

**字符串常量在进行传递时，不会对其进行HTML转义**，故`<3`与`$lt;3`相同

#### 属性值默认为true

如果没有给属性传值，则默认为true

	<MyTextBox autocomplete />
	
	<MyTextBox autocomplete={true} />

**不建议使用**

#### 扩展属性

可以使用ES6的对象扩展符将对象中所有属性传递过去

	function App1() {
	  return <Greeting firstName="Ben" lastName="Hector" />;
	}
	
	function App2() {
	  const props = {firstName: 'Ben', lastName: 'Hector'};
	  return <Greeting {...props} />;
	}

**不建议使用，容易导致不相关属性的传递**

### 子节点的传递

组件内部可以使用props.chirldren获取外部传入的子节点，子节点的传入有以下方法

#### 字符串常量

在开始与结束标签之间放入一个字符串，则props.children就是那个字符串

JSX会移除空行和开始与结尾处的空格，字符串内部的换行会被压缩成一个空格。

#### JSX

	<MyContainer>
	  <MyFirstComponent />
	  <MySecondComponent />
	</MyContainer>

**一个React组件只能返回一个元素**

#### javascript表达式

将用大括号`{}`包裹的javascript表达式作为子元素传递

	function Item(props) {
	  return <li>{props.message}</li>;
	}
	
	function TodoList() {
	  const todos = ['finish doc', 'submit pr', 'nag dan to review'];
	  return (
	    <ul>
	      {todos.map((message) => <Item key={message} message={message} />)}
	    </ul>
	  );
	}

可以与其他类型的子代混合使用

#### 函数

props.children可以传递任何数据，包括函数。只要将该组件在React渲染前转换成React能够理解的结构即可。

	// Calls the children callback numTimes to produce a repeated component
	function Repeat(props) {
	  let items = [];
	  for (let i = 0; i < props.numTimes; i++) {
	    items.push(props.children(i));
	  }
	  return <div>{items}</div>;
	}
	
	function ListOfTenThings() {
	  return (
	    <Repeat numTimes={10}>
	      {(index) => <div key={index}>This is item {index} in the list</div>}
	    </Repeat>
	  );
	}

#### 布尔值、Null和undefined被忽略

false、null、undefined 和 true 都是有效的子代，但它们不会直接被渲染

以下表达式等价：

	<div />

	<div></div>
	
	<div>{false}</div>
	
	<div>{null}</div>
	
	<div>{undefined}</div>
	
	<div>{true}</div>

React中，出现了`falsy`值,即强制类型转换后会变为false的值，包括有0，“”，null，undefined 和 NaN，在进行组件渲染的&&判断时不会起到作用

	<div>
	  {props.messages.length &&
	    <MessageList messages={props.messages} />
	  }
	</div>

当length为0时，后面的组件依然会得到渲染。

**解决办法为使得&&前面的表达式始终为布尔值**

如果需要将false、true、null或者undefined出现在输出中，则必须先将其转换为字符串再加入到元素中。