var map;
var poly;
var path;
var infowindow;
var autocomplete;
var uid;
var markersarr = {};
var vehicles = {};
var vehicle_id= -1;
var vehicle_selected;

var app = angular.module('details',['ui.bootstrap']);
app.controller('DetailsController',function($scope,$log)
{
   $scope.empList={};
   $scope.updateFn=function(data)
   {
     $scope.empList=data;
     $scope.$digest();
   };
 });




function init()
{

	var socket = io.connect('http://localhost:3000/');

	socket.on('connect', function(data){
		console.log('web socket connected');
	});

    socket.on('reconnecting', function(data){
    });

    socket.on('realtime', function (data) {
    	console.log(data);
   	 	updatevehicle(data);
   		angular.element("#hideclick").scope().updateFn(data.det);
    });

    createmap();
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('hideclick'));
    document.getElementById("hideclick").style.display="none"; 

}



function createmap()
{

	map_canvas = document.getElementById("map_canvas");
	var myOptions = {
			center : new google.maps.LatLng(8.4875,76.9525),
			zoom : 12,
			mapTypeId : google.maps.MapTypeId.ROADMAP
		};
	map = new google.maps.Map(map_canvas, myOptions);

}

function updatevehicle(data)
{
	var point = new google.maps.LatLng(data.position.lat, data.position.lng);
	uid = data.trip_id;
	if(!(uid in markersarr))
		vehicles[uid] = createvehicle(data,point);
	else
	{
		vehicles[uid].contentinfo = data.emp;
		markersarr[uid].animateTo(point,{ 
			easing : "linear",
			duration : 1000,
			complete : function(){}
		});
	}
	path = vehicles[uid].polyline.getPath();
	path.push(point);
}

function createvehicle(data,point)
{

	var image = 'bus.png'
	var	newmarker = new google.maps.Marker({
			position : point,
			map : map,
			id : uid,
			icon : image
		});

	newmarker.setTitle(toString(uid));
	markersarr[uid]=newmarker;
  	google.maps.event.addListener(markersarr[uid], 'click', function() {
  		socket.emit('click',this.id);			//send the trip id through socket
  		vehicle_selected=this.id;				//set the trip id of selected vehicle
  	 document.getElementById('hideclick').style.display = "block";
  	});
  	
  	var polyOptions = {
		strokeColor: '#428CCC',
		strokeOpacity: 1.0,
		strokeWeight: 3
	};
	poly = new google.maps.Polyline(polyOptions);
	poly.setMap(map);

 	return {
		uid : uid,
		marker : newmarker,
		polyline:poly
	}
}