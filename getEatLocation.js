function getEatLation () {
	var list = [];
	var weight = {
		"螺蛳粉": 0,
		"711": 0,
		"小江南": 0,
		"阿里": 0,
		"哈尔滨坛肉": 0,
		"人人": 0,
		"知味湘": 0,
		"桂林米粉": 0,
		"顺口溜": 0,
		"满里": 0,
		"麻辣烫": 0,
		"重庆小面": 0,
		"周三老面馆": 0,
		"外卖": 0
	}
	for (var key in weight) {
		if(weight[key] === 0) continue;
		for(var i=0;i<weight[key];i++) {
			list.push(key);
		}
	}
	var index = parseInt(list.length*Math.random());
	var date = new Date();
	console.log(formatDate(date));
	console.log(list[index]);
}
function formatDate (date) {
	var date = new Date(date);
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var day = date.getDate();
	return year + "-" + (month < 10?"0"+month:month) + "-" + (day < 10?"0"+day:day)
}
getEatLation();