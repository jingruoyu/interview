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

React DOM 在渲染之前默认会 过滤 所有传入的值。它可以确保你的应用不会被注入攻击，防止XSS攻击。

**CSRF(cross site request forgery)与XSS(cross site script)**

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

## this.props

this.props中组件的属性与dom的属性一一对应，具有只读性

**this.props.children表示组件的所有子节点**

this.props的取值要点：

* 如果当前组件没有子节点，则值为undefined
* 如果当前组件有一个子节点，则取值类型为object
* 如果当前组件有多个子节点，则取值类型为array

可以使用官方提供的`React.Children.map`遍历子节点，从而避免数据类型的问题

## propTypes

验证组件实例的属性是否符合要求

取值为对象，其中key为相应参数，value为取值类型、是否必须等

	propTypes: {
		title: React.PropTypes.string.isRequired
	}

## getDefaultProps

设置参数默认值

取值为函数，该函数返回一个对象，其中key为参数名，value为相应参数默认取值

	getDefaultProps () {
		return {
			title: "456"
		}
	}

## ref获取DOM元素

react中通过虚拟DOM操作DOM树，但是使用ref获取真正DOM元素

	<input type="text" ref="myTextInput" />

	//使用ref获取DOM元素
	this.refs.myTextInput.focus();

**此处获取的DOM节点为真实DOM节点，需要在虚拟DOM插入文档后再进行操作，否则会报错**

## this.state

react将组件看作一个状态机，this.state规定组件内部数据属性，组件内部调用this.setState({})改变状态

getInitialState 函数规定函数内部初始状态，函数返回一个对象，其中即为组件的初始状态，会在组件挂载时自动执行。这个对象可以在外部通过this.state读取

**state与props的区别**

* props存储的数据已经定义不再改变
* state中存储组件内部随用户操作而变化的特性
* **state与props为异步更新，需要改变状态时解决办法为使用setState的函数参数**

		this.setState((prevState, props) => ({
		  counter: prevState.counter + props.increment
		}));

## react生命周期

![react生命周期图](http://upload-images.jianshu.io/upload_images/1814354-4bf62e54553a32b7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

大流程顺序如下所示：

1. constructor:创建组件时调用一次

2. componentWillMount:组件挂载前调用

3. componentDidMount:组件挂载后调用

4. componentWillUpdate(object nextProps, object nextState) 

5. componentDidUpdate(object prevProps, object prevState)

6. componentWillUnmount()

此外，还有其他钩子函数：

1. componentWillReceiveProps(nextProps)

	props是父组件传递给子组件的。父组件发生render的时候子组件就会调用componentWillReceiveProps（不管props有没有更新，也不管父子组件之间有没有数据交换）

2. shouldComponentUpdate(nextProps, nextState)

	组件挂载之后，每次调用setState后都会调用shouldComponentUpdate判断是否需要重新渲染组件。默认返回true，需要重新render。在比较复杂的应用里，有一些数据的改变并不影响界面展示，可以在这里做判断，优化渲染效率

## 请求的使用

通常数据请求在componentDidMount中使用，而后根据请求获得的数据使用setState更改状态

## 事件处理

* react中事件绑定属性采用驼峰写法
* 需要传入函数作为事件处理函数，而不是函数名字符串

		<button onClick={activateLasers}>
		  Activate Lasers
		</button>

		//原生javascript
		<button onclick="activateLasers()">
		  Activate Lasers
		</button>

* 必须使用preventDefault阻止默认事件
* 事件处理函数触发时最后一个参数默认为事件对象

绑定事件处理函数中this对象方法：

* 构造函数中绑定

		constructor(props) {
		    // This binding is necessary to make `this` work in the callback
		    this.handleClick = this.handleClick.bind(this);
		}

	即在构造函数中使用bind直接给函数绑定 this值

* 属性初始化器语法

		handleClick = () => {
		    console.log('this is:', this);
		}

	在函数定义时使用箭头函数确定函数中this指向

* 回调函数中的箭头函数

		<button onClick={(e) => this.handleClick(e)}>

	在函数调用时使用箭头函数

	**此方法下，当回调函数作为一个属性值传入低阶组件，这些组件可能会进行额外的重新渲染**

### 事件函数传参

向事件处理函数传参有两种方法：

* 使用箭头函数

		<button onClick={(e) => this.deleteRow(id, e)}>Delete Row</button>

	此方法下所有参数都必须显式传递，包括事件对象，这与箭头函数机制有关

* 使用bind函数

		<button onClick={this.deleteRow.bind(this, id)}>Delete Row</button>

	此方法下事件对象可以隐式传递，事件对象默认为所有参数的最后一个，如下示

		preventPop(name, e){    //事件对象e要放在最后
	        e.preventDefault();
	        alert(name);
	    }