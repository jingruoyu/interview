## 伪类

* checked

	当用CSS一个开关时，可以使用input的CheckBox输入框

	**CheckBox与radio具有checked伪类，可以针对选中和未选中做不同的样式**

* focus

	为div元素添加focus

	div等元素本身没有focus，但是在对其是指tabindex值后，即可拥有focus

	方法一：

		<div tabindex="-1" onfocus="console.log('focus')" onblur="console.log('blur')">Focus me</div>

	指定TabIndex为-1，然后使用编程的方式来获得focus

	方法二：

		<style>
			#focus-example > .extra { display: none; }
			#focus-example:focus > .extra { display: block; }
		</style>
		<div id="focus-example" tabindex="0">
		  <div>Focus me!</div>
		  <div>Hooray!</div>
		</div>

	指定TabIndex为0，然后CSS中就可以拥有focus伪类

	TabIndex取值含义：

	* -1：用户不能通过tab的形式到达该元素，只能通过编程的方式绑定focus事件来获得focus
	* 0：用户可以通过tab的方式到达该元素，自动定义tab的顺序
	* >1：给元素指定一个tab优先级，等于1时优先级最高

## 瀑布流

## 梯形、三角形的绘制

使用border绘制，利用四条边的交叉绘制三角形及其他图形

## [动画的性能优化](http://www.jianshu.com/p/2b10d0822d3f)

**回流reflow、重绘repaint、重布局relayout、图层重组recomposite**

当要增加元素宽度时，使用width会导致页面的回流。但是使用transform放大元素仅仅会导致元素的重绘，达到性能优化的目的，即所谓的**硬件加速**

更深层次的原因在于GPU对页面的绘制过程。

浏览器在渲染一个页面时，会将页面分为很多个图层，每个图层上包含一个或多个节点。在渲染DOM时，浏览器进行如下操作

1. 获取DOM后分割为多个图层
2. 对每个图层上的节点计算样式结果（Recalculate style--样式重计算）
3. 为每个节点生成图形和位置（Layout--回流即重布局）
4. 将每个节点绘制填充到图层位图中（Paint Setup和Paint--重绘）
5. 图层作为纹理上传至GPU
6. 符合多个图层到页面上生成最终屏幕图像（Composite Layers--图层重组）

**当图层中某一个元素需要重绘时，整个图层都会重绘。**如gif图的每一帧，都会重绘整个图层的其他节点，然后生成最终的图层位图。这就需要强制将gif图设置成一个独立的图层。

动画的绘制过程为：

1. 计算需要被加载节点的样式结果（样式重计算）
2. 为每个节点生成图形和位置（回流reflow）
3. 将每个节点填充到图层上（重绘repaint）
4. 组合图层到页面上（composite layers--图层重组）

动画性能的优化关键点在于减少浏览器在动画运行是所要进行的工作。**最好的情况是动画改变的属性仅影响最后一步即组合图层到页面**

变换transform与透明度opacity的使用就属于上述情况。现代浏览器都对变换和透明度采用硬件加速

做动画最好使用下列属性：

* opacity
* translate
* rotate
* scale

## 回流详解

回流的触发：

* 添加或者删除可见的DOM元素
* 元素位置改变
* 元素尺寸改变——边距、填充、边框、宽度和高度
* 内容改变——比如文本改变或者图片大小改变而引起的计算值宽度和高度改变
* 页面渲染初始化
* 浏览器窗口尺寸改变——resize事件发生时

触发回流的属性：

* 盒子模型相关属性
	
	width/height/padding/border-width/margin/min-height/display

* 定位与浮动属性

	float/clear/position/top/left/right/bottom

* 节点内部文字结构

	text-align/vertical-align/overflow/line-height/font-size/font-height/font-family/white-space

**避免使用CSS类名对节点做状态标记，因为会触发节点的回流与重绘**

## 触发重绘的属性

只触发重绘的属性

* color
* border-style
* border-redius
* visibility
* text-decoration:设置文本修饰，不影响大小布局
* **bachground**
* background-image
* background-position
* background-repeat
* background-size
* box-shadow
* 等

不修改节点大小和位置的属性，均不会触发回流，只是节点内部的渲染效果发生了改变，重绘就可以了

## 触发图层重组的属性

* opacity

	透明度改变时，GPU只会在原来的纹理上修改alpha值达到效果，不会重绘，前提为被修改元素必须是一个图层

	强制浏览器创建图层：

	* 设置与opacity相关的过渡效果或动画
	* 使用translateZ(0)或translate3d(0,0,0)，不应过多使用，否则创建过多图层导致崩溃

* transform

	使用translate代替left、top改变元素的位置，避免重布局

## BFC

BFC不影响外部的具体解释

## CSS的7阶层叠模型

1. 层叠上下文元素的边框和背景色
2. 拥有负 z-index 的子堆叠上下文元素 （负的越高越堆叠层级越低）
3. 正常流式布局，非 inline-block，无 position 定位（static除外）的子元素
4. 无 position 定位（static除外）的 float 浮动元素
5. 正常流式布局， inline-block元素，无 position 定位（static除外）的子元素（包括 display:table 和 display:inline ）
6. 拥有 z-index:0 /auto的子堆叠上下文元素以及“positioned”且层叠级数为0的后代元素
7. 拥有正 z-index: 的子堆叠上下文元素（正的越低越堆叠层级越低）

简言之，先是父元素的绘制，然后是z-index为负值的元素绘制，然后是没有定义position的元素，最后是按照z-index的层叠级数从0开始逐级绘制。如果层级相同，则按照元素在DOM树中的先后顺序来进行绘制