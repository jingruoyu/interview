# react基础学习

[搭建React框架指南](https://github.com/facebookincubator/create-react-app)，类似于vue-cli

## 依赖库

* react.js，React核心库
* react-dom.js，提供DOM相关操作
* brower.js，将JSX语法转化为JavaScript语法，使用JSX的的地方script标签下type为"text/babel"

## render函数

ReactDOM.render函数将模板转化为HTML，插入到指定DOM节点中

	ReactDOM.render(
	  <h1>Hello, world!</h1>,
	  document.getElementById('example')
	);

多次使用render方法时以最后一次为准

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
* **state与props为异步更新，不可依赖，需要改变状态时解决办法为使用setState的函数参数prevState**

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

## 条件渲染

react中使用javascript中if或者条件运算符进行条件渲染

条件判断可以依据props和state中变量进行相应判断

javascript中条件运算可以使用

* if
* &&

		judge && expression

	此种原理即为利用&&与||的计算特点，当条件为true时执行后面语句，为false时不执行第二项

* 三目运算符

**组件不希望进行条件渲染时可以直接返回null，返回null不影响该组件生命周期钩子函数的执行**

## 列表渲染

列表渲染使用js的循环或遍历实现

列表渲染需要为每一项设置相应的key，key的作用在于当DOM发生变化时帮助react判断哪些DOM发生了变化

### key的应用

* key的作用为与兄弟组件进行比较，因此无需为每一项均指定相应的key
* key在兄弟元素之间唯一，无需全局唯一
* key作为标识不会传递给子组件，必要时需要使用其他属性传递

	**子组件的props中没有key属性**

## react的双向数据绑定

### 数据双向绑定实现

react组件内部状态只能使用setState函数进行，故在view中状态改变时，需要进行手动的viewmodel操作，此处即为受控组件的意义

	//输入框输入时触发事件更改组件状态
	<input type="text" value={this.state.value} onChange={this.handleChange} />

	//手动完成状态更改，函数中使用event.target.value获取输入值
	handleChange(event) {
	    this.setState({value: event.target.value});
	}

**在组件初始化时用状态设置初始值，使用onChange事件处理用户输入，使用event.target.value获取用户输入**

此方法适用于input、textarea与select等输入

在状态修改的同时，也可以对用户输入值可以进行一定的修改和限制

### 多输入解决办法

存在多个input输入框时，通过为input指定name属性进行区分

	  handleInputChange(event) {
	    const target = event.target;
	    const value = target.type === 'checkbox' ? target.checked : target.value;
	    const name = target.name;

	    this.setState({
	      [name]: value
	    });
	  }

此处最后的状态更改语句用到了ES6的计算属性名，选择相应的变量进行赋值

此即为受控组件的内部原理，受控组件较为复杂，但是其内部的数据流动更为清晰，便于开发

## 状态提升

多个组件均会用到的数据，使用状态提升的方法将共享状态提升至最近的父组件中进行管理

* 父组件传递数据到子组件使用props，props为只读
* 子组件传递数据到父组件，需要在调用子组件时使用props，将父组件内部的函数方法传递到子组件，子组件内部数据更改时调用该方法，将更改后的数据传递至父组件

### 经验教训

* **单一数据源**

	对于任何可变数据只有一个单一数据源，位于需要渲染数据的组件中。

	当其他组件中需要这些数据时，将数据提升至最近的父组件中，而且需要保证数据均为**自顶向下**流动，避免出现不同组件中状态的同步

* 状态提升更易于调试

	当出现bug时，只需要查找哪些组件中保有状态数据，因为只有这些组件才可以操作数据，减小bug查找范围

* props可以提供的数据可以不必出现在state中

	减少state中不必要状态的存储，如果状态可以通过props计算得出，则可以不使用state

* react开发者工具辅助开发

## 组合与继承

建议使用组合复用组件之间的代码，避免使用继承

### 包含关系

* 组件内部通过props.children访问外部注入的子元素
* 需要进行区分时，使用props参数进行不同子元素的区分

		function App() {
		  return (
		    <SplitPane
		      left={
		        <Contacts />
		      }
		      right={
		        <Chat />
		      } />
		  );
		}

	上例中，在props属性中使用left和right区分不同项

props参数可以传递任意值，包括数据、DOM结构与函数等

### 特殊实例

在 React 中，通过属性配置的方法，组件可以作为其他组件的特殊实例

如配置children属性或其他属性


**属性+组合**提供了以清晰和安全的方式自定义组件的样式和行为所需的所有灵活性，此外，组件可以接受任意元素，包括基本数据类型、React 元素或函数

当需要复用与展示无关的功能时，可以将其提取到单独的javascript模块中，在需要的地方进行导入即可，避免对组件进行不必要的扩展


## React理念

1. 根据UI划分组件层级

	划分可以根据单一功能原则进行划分。理想情况下一个组件仅做一件事，若组件功能过于复杂，则可以进一步划分。

	**此处涉及到javascript设计模式**

2. 创建静态应用

	传入数据模型 + UI渲染，不包括交互

	区分props与state，state主要用于数据交互阶段

	开发模式可以分为**自顶向下**和**自底向上**两种，自顶向下有利于框架设计，自底向上有利于具体实现与单元测试

	这一步使用props的单向数据流实现一个静态的数据模型，不涉及交互操作，便于观察UI更新流程

3. 确定应用中state

	state的确定应该具有不可重复性，避免数据冗余。其确立原则有：

	* 是否通过props从父级获得，若是，则可能不是state
	* 是否一直不会改变，若是，则可能不是state
	* 是否可以通过组件中state或props计算得出，若是，则可能不是state

4. 确定state位置

	确定state位置方法：

	* 寻找所有需要这个state的组件
	* 寻找所有需要state组件的公共父组件，state存储于这个组件中
	* 若没有公共父组件，则创建一个专门用于保存状态的组件

5. 添加反向数据流

	添加反向数据流，完成数据的双向绑定


React特点：组件化，模块化