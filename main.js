var STATE_STOP = 0;
var STATE_PROCEED = 1;

function Point2D(x, y) {
	this.x = x;
	this.y = y;
}

function copyPoint2D(point) {
	return new Point2D(point.x, point.y);
}

function StraightRoad(fromPoint, toPoint, speed) {
	this.fromPoint = fromPoint;
	this.toPoint = toPoint;
	this.cars = [];
	this.toRoads = [];
	this.speed = speed;
	this.state = STATE_PROCEED;
}

function straightRoadLength(road) {
	return Math.sqrt(Math.pow(road.toPoint.x - road.fromPoint.x, 2) + Math.pow(road.toPoint.y - road.fromPoint.y, 2));
}

function straightRoadAngle(road) {
	return Math.atan2(road.toPoint.y - road.fromPoint.y, road.toPoint.x - road.fromPoint.x);
}

function updateStraightRoad(road) {
	var waitingOffset = followingDist;
	for(var i = road.cars.length - 1; i >= 0; i--) {
		var car = road.cars[i];
		if((car.distance < straightRoadLength(road) - waitingOffset) ||
				(road.cars[i].distance < straightRoadLength(road) && road.state == STATE_PROCEED)) {
			car.distance += road.speed;
			car.point.x = road.fromPoint.x + car.distance * Math.cos(straightRoadAngle(road));
			car.point.y = road.fromPoint.y + car.distance * Math.sin(straightRoadAngle(road));
		} else if(road.state == STATE_PROCEED) {
			addCar(road.cars.pop(), road.toRoads[Math.floor(road.toRoads.length * Math.random())]);
		}
		waitingOffset += car.length + followingDist;
	}
}

function drawStraightRoad(road) {
	context.translate(road.fromPoint.x, road.fromPoint.y);
	context.rotate(straightRoadAngle(road));
	context.beginPath();
	context.moveTo(0, -roadWidth / 2);
	context.lineTo(0, roadWidth / 2);
	context.lineTo(straightRoadLength(road), roadWidth / 2);
	context.lineTo(straightRoadLength(road), -roadWidth / 2);
	context.lineTo(0, -roadWidth / 2);
	context.fillStyle = "#BBBBBB";
	context.fill();
	context.closePath();
	
	context.beginPath();
	context.moveTo(0, -roadWidth / 2);
	context.lineTo(straightRoadLength(road), -roadWidth / 2);
	context.strokeStyle = "#FFFFFF";
	context.stroke();
	context.closePath();
	
	context.beginPath();
	context.moveTo(0, roadWidth / 2);
	context.lineTo(straightRoadLength(road), roadWidth / 2);
	context.strokeStyle = "#FFFFFF";
	context.stroke();
	context.closePath();
	
	context.rotate(-straightRoadAngle(road));
	context.translate(-road.fromPoint.x, -road.fromPoint.y);
}

function ArcRoad(centerPoint, radius, sAngle, eAngle, ccw, speed) {
	this.centerPoint = centerPoint;
	this.radius = radius;
	this.sAngle = sAngle;
	this.eAngle = eAngle;
	this.speed = speed;
	this.ccw = ccw;
	this.toRoads = [];
	this.cars = [];
}

function drawArcRoad(road) {
	var innerRadius = road.radius - roadWidth / 2;
	var outerRadius = road.radius + roadWidth / 2;
	context.beginPath();
	context.moveTo(road.centerPoint.x + innerRadius * Math.cos(road.sAngle), road.centerPoint.y + innerRadius * Math.sin(road.sAngle));
	context.arc(road.centerPoint.x, road.centerPoint.y, innerRadius, road.sAngle, road.eAngle, road.ccw);
	context.arc(road.centerPoint.x, road.centerPoint.y, outerRadius, road.eAngle, road.sAngle, !road.ccw);
	context.fillStyle = "#BBBBBB";
	context.fill();
	context.closePath();
}

function updateArcRoad(road) {
	for(var i = road.cars.length - 1; i >= 0; i--) {
		var car = road.cars[i];
		if(Math.abs(car.distance) < Math.abs(road.eAngle - road.sAngle)) {
			car.point.x = road.centerPoint.x + road.radius * Math.cos(road.sAngle + car.distance);
			car.point.y = road.centerPoint.y + road.radius * Math.sin(road.sAngle + car.distance);
			car.angle = road.sAngle + car.distance + (Math.PI / 2);
			car.distance += (road.ccw ? -1 : 1) * road.speed / road.radius;
		} else {
			addCar(road.cars.pop(), road.toRoads[Math.floor(road.toRoads.length * Math.random())]);
		}
	}
}

function Car(length) {
	this.distance = 0;
	this.point = null;
	this.angle = null;
	this.length = length;
}

function addCar(car, road) {
	if(road instanceof StraightRoad) {
		car.distance = 0;
		car.point = copyPoint2D(road.fromPoint);
		car.angle = straightRoadAngle(road);
		road.cars.unshift(car);
	} else if(road instanceof ArcRoad) {
		car.distance = 0;
		car.point = new Point2D(road.centerPoint.x + road.radius * Math.cos(road.sAngle),
			road.centerPoint.y + road.radius * Math.sin(road.sAngle));
		car.angle = road.sAngle + (Math.PI / 2);
		road.cars.unshift(car);
	}
}

function drawCar(car) {
	context.translate(car.point.x, car.point.y);
	context.rotate(car.angle);
	context.beginPath();
	context.moveTo(-car.length / 2, -carWidth);
	context.lineTo(-car.length / 2, carWidth);
	context.lineTo(car.length / 2, carWidth);
	context.lineTo(car.length / 2, -carWidth);
	context.lineTo(-car.length / 2, -carWidth);
	context.fillStyle = "#FF2244";
	context.fill();
	context.closePath();
	context.rotate(-car.angle);
	context.translate(-car.point.x, -car.point.y);
}

function update() {
	context.beginPath();
	context.fillStyle = "#EEEEEE";
	context.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
	context.closePath();
	for(var i = 0; i < roads.length; i++) {
		if(roads[i] instanceof StraightRoad) {
			updateStraightRoad(roads[i]);
			drawStraightRoad(roads[i]);
		} else if(roads[i] instanceof ArcRoad) {
			updateArcRoad(roads[i]);
			drawArcRoad(roads[i]);
		}
	}
	for(var i = 0; i < roads.length; i++) {
		for(var j = 0; j < roads[i].cars.length; j++) {
			drawCar(roads[i].cars[j]);
		}
	}
}

var roadWidth = 16;
var carWidth = 4;
var followingDist = 20;
var mainCanvas;
var context;

var roadA = new StraightRoad(new Point2D(60, 40), new Point2D(272, 40), 5);
var roadT = new StraightRoad(new Point2D(272, 40), new Point2D(328, 40), 5);
var roadW = new StraightRoad(new Point2D(328, 40), new Point2D(540, 40), 5);
var roadF = new ArcRoad(new Point2D(540, 60), 12 + (roadWidth / 2), 1.5 * Math.PI, 2 * Math.PI, false, 5);
var roadI = new StraightRoad(new Point2D(540, 24), new Point2D(328, 24), 5);
var roadV = new StraightRoad(new Point2D(328, 24), new Point2D(272, 24), 5);
var roadX = new StraightRoad(new Point2D(272, 24), new Point2D(60, 24), 5);
var roadM = new ArcRoad(new Point2D(540, 60), 28 + (roadWidth / 2), 2 * Math.PI, 1.5 * Math.PI, true, 5);

var roadB = new StraightRoad(new Point2D(560, 60), new Point2D(560, 340), 5);
var roadG = new ArcRoad(new Point2D(540, 340), 12 + (roadWidth / 2), 0 * Math.PI, 0.5 * Math.PI, false, 5);
var roadJ = new StraightRoad(new Point2D(576, 340), new Point2D(576, 60), 5);
var roadN = new ArcRoad(new Point2D(540, 340), 28 + (roadWidth / 2), 0.5 * Math.PI, 0 * Math.PI, true, 5);

var roadC = new StraightRoad(new Point2D(540, 360), new Point2D(328, 360), 5);
var roadY = new StraightRoad(new Point2D(328, 360), new Point2D(272, 360), 5);
var roadZ = new StraightRoad(new Point2D(272, 360), new Point2D(60, 360), 5);
var roadE = new ArcRoad(new Point2D(60, 340), 12 + (roadWidth / 2), 0.5 * Math.PI, Math.PI, false, 5);
var roadK = new StraightRoad(new Point2D(60, 376), new Point2D(272, 376), 5);
var road2 = new StraightRoad(new Point2D(272, 376), new Point2D(328, 376), 5);
var road3 = new StraightRoad(new Point2D(328, 376), new Point2D(540, 376), 5);
var roadO = new ArcRoad(new Point2D(60, 340), 28 + (roadWidth / 2), 1 * Math.PI, 0.5 * Math.PI, true, 5);

var roadD = new StraightRoad(new Point2D(40, 340), new Point2D(40, 60), 5);
var roadH = new ArcRoad(new Point2D(60, 60), 12 + (roadWidth / 2), 1 * Math.PI, 1.5 * Math.PI, false, 5);
var roadL = new StraightRoad(new Point2D(24, 60), new Point2D(24, 340), 5);
var roadP = new ArcRoad(new Point2D(60, 60), 28 + (roadWidth / 2), 1.5 * Math.PI, 1 * Math.PI, true, 5);

var roadU = new ArcRoad(new Point2D(328, 60), 28 + (roadWidth / 2), 1.5 * Math.PI, 1 * Math.PI, true, 5);
var roadS = new ArcRoad(new Point2D(272, 60), 12 + (roadWidth / 2), 1.5 * Math.PI, 2 * Math.PI, false, 5);
var roadQ = new StraightRoad(new Point2D(292, 60), new Point2D(292, 340), 5);
var roadR = new StraightRoad(new Point2D(308, 340), new Point2D(308, 60), 5);
var road0 = new ArcRoad(new Point2D(272, 340), 12 + (roadWidth / 2), 0 * Math.PI, 0.5 * Math.PI, false, 5);
var road1 = new ArcRoad(new Point2D(328, 340), 28 + (roadWidth / 2), 1 * Math.PI, 0.5 * Math.PI, true, 5);

var road4 = new ArcRoad(new Point2D(328, 60), 12 + (roadWidth / 2), 1 * Math.PI, 1.5 * Math.PI, false, 5);
var road5 = new ArcRoad(new Point2D(272, 340), 28 + (roadWidth / 2), 0.5 * Math.PI, 0 * Math.PI, true, 5);
var road6 = new ArcRoad(new Point2D(328, 340), 12 + (roadWidth / 2), 0.5 * Math.PI, 1 * Math.PI, false, 5);
var road7 = new ArcRoad(new Point2D(272, 60), 28 + (roadWidth / 2), 2 * Math.PI, 1.5 * Math.PI, true, 5);

roadT.toRoads = [roadW];
roadW.toRoads = [roadF];
roadS.toRoads = [roadQ];
roadA.toRoads = [roadS, roadT];
roadF.toRoads = [roadB];
roadB.toRoads = [roadG];
roadG.toRoads = [roadC];
roadC.toRoads = [roadY, road6];
road6.toRoads = [roadR];
roadY.toRoads = [roadZ];
roadZ.toRoads = [roadE];
roadE.toRoads = [roadD];
roadD.toRoads = [roadH];
roadH.toRoads = [roadA];
roadR.toRoads = [road4, road7];
road4.toRoads = [roadW];
road7.toRoads = [roadX];

roadI.toRoads = [roadV, roadU];
roadU.toRoads = [roadQ];
roadV.toRoads = [roadX];
roadX.toRoads = [roadP];
roadP.toRoads = [roadL];
roadL.toRoads = [roadO];
roadO.toRoads = [roadK];
roadK.toRoads = [road2, road5];
road2.toRoads = [road3];
road3.toRoads = [roadN];
roadN.toRoads = [roadJ];
roadJ.toRoads = [roadM];
roadM.toRoads = [roadI];
roadQ.toRoads = [road0, road1];
road1.toRoads = [road3];
road0.toRoads = [roadZ];
road5.toRoads = [roadR];

var roads = [roadA, roadB, roadC, roadD, roadE, roadF, roadG, roadH, roadI, roadJ, roadK, roadL, roadM, roadN, roadO, roadP, roadQ, roadR, roadS, roadT, roadU, roadV, roadW, roadX, roadY, roadZ, road0, road1, road2, road3, road4, road5, road6, road7];

window.onload = function() {
	mainCanvas = document.getElementById("mainCanvas");
	context = mainCanvas.getContext("2d");
	window.setInterval(update, 30);
}

document.onkeypress = function (e) {
	var keyCode = e.which || e.keyCode;
	if(keyCode == 32) {
		for(var i = 0; i < roads.length; i++) {
			roads[i].state = (roads[i].state == STATE_STOP ? STATE_PROCEED : STATE_STOP);
		}
	} else if(keyCode == 13) {
		addCar(new Car(20), roadA);
		addCar(new Car(20), roadL);
	}
};

