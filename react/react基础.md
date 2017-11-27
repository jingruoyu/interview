# react基础学习

## 依赖库

* react.js，React核心库
* react-dom.js，提供DOM相关操作
* brower.js，将JSX语法转化为JavaScript也发，使用JSX的的地方script标签下type为"text/babel"

## render函数

ReactDOM.render函数将模板转化为HTML，插入到指定DOM节点中

	ReactDOM.render(
	  <h1>Hello, world!</h1>,
	  document.getElementById('example')
	);

## JSX语法

特点为HTML和JavaScript混写

* 遇到HTML标签以HTML规则解析
* 遇到代码块（即大括号）以JavaScript规则解析

		var names = ['Alice', 'Emily', 'Kate'];
	
		ReactDOM.render(
		  <div>
		  {
		    names.map(function (name) {
		      return <div>Hello, {name}!</div>
		    })
		  }
		  </div>,
		  document.getElementById('example')
		);

* 直接在模板中插入JavaScript变量，如果是数组，则展开数组

	**此处为展开数组，并不是调用数组的toString方法**

		var arr = [
		  <h1>Hello world!</h1>,
		  <h2>React is awesome</h2>,
		];
		ReactDOM.render(
		  <div>{arr}</div>,
		  document.getElementById('example')
		);

## 组件

React.createClass方法用于生成组件类

	var HelloMessage = React.createClass({
	  render: function() {
	    return <h1>Hello {this.props.name}</h1>;
	  }
	});
	
	ReactDOM.render(
	  <HelloMessage name="John" />,
	  document.getElementById('example')
	);

组件类的render方法用于输出组件

* 组件类第一个字母必须大写
* 组件类只能包含一个顶层标签
* 可以在调用组件时向其中加入属性

以上指定的name属性，可以在组件内部通过`this.props.name`获取该属性

## this.props.children

this.props中组件的属性与dom的属性一一对应

**this.props.children表示组件的所有子节点**

this.props的取值要点：

* 如果当前组件没有子节点，则值为undefined
* 如果当前组件有一个子节点，则取值类型为object
* 如果当前组件有多个子节点，则取值类型为array

可以使用官方提供的`React.Children.map`遍历子节点，从而避免数据类型的问题