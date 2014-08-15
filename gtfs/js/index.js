var map;
var poly;
var path;
var infowindow;
var autocomplete;
var uid;
var markersarr = {};
var vehicles = {};
var vehicle_id= -1;
var socket;


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

var map_style =[{"featureType":"landscape","stylers":[{"hue":"#F1FF00"},{"saturation":-27.4},{"lightness":9.4},{"gamma":1}]},{"featureType":"road.highway","stylers":[{"hue":"#0099FF"},{"saturation":-20},{"lightness":36.4},{"gamma":1}]},{"featureType":"road.arterial","stylers":[{"hue":"#00FF4F"},{"saturation":0},{"lightness":0},{"gamma":1}]},{"featureType":"road.local","stylers":[{"hue":"#FFB300"},{"saturation":-38},{"lightness":11.2},{"gamma":1}]},{"featureType":"water","stylers":[{"hue":"#00B6FF"},{"saturation":4.2},{"lightness":-63.4},{"gamma":1}]},{"featureType":"poi","stylers":[{"hue":"#9FFF00"},{"saturation":0},{"lightness":0},{"gamma":1}]}];

function init()
{

	socket = io.connect('http://localhost:3000');

	socket.on('connect', function(data){
	    //socket.emit('subscribe', {channel:'realtime'});
    });

    socket.on('reconnecting', function(data){
    });

    socket.on('realtime', function (data) {
    		console.log(data);
   	 		updatevehicle(data);
   		 	if(data.det.trip_id==vehicle_id)
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
			mapTypeId : google.maps.MapTypeId.ROADMAP,
			streetViewControl: false,
			mapTypeControl: false,
			panControl: false
//			styles:map_style
		};
	map = new google.maps.Map(map_canvas, myOptions);
	infowindow = new google.maps.InfoWindow({
             content: 'holding...'
        });	

}

function updatevehicle(data)
{
	var point = new google.maps.LatLng(data.position.lat, data.position.lng);
	uid = data.det.trip_id;
	if(!(uid in markersarr))
		vehicles[uid] = createvehicle(data,point);
	else
	{
		vehicles[uid].contentinfo = data.emp;
		markersarr[uid].animateTo(point,{  
			easing : "linear",
			duration : 1000,
			complete : function(){

			}
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

	newmarker.setTitle(uid);
	markersarr[uid]=newmarker;
  	google.maps.event.addListener(markersarr[uid], 'click', function() {
  	   	vehicle_id=this.id;
  		socket.emit('click',vehicle_id);
     	 document.getElementById('hideclick').style.display = "block";
  	});
  	
  	var routelayer = new google.maps.KmlLayer({
		preserveViewport : true,
		map : map
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
		route : routelayer,
		contentinfo : data.emp,
		headingTo : uid,
		polyline:poly


	}

}


function close_details()
{
	  document.getElementById("hideclick").style.display="none"; 
}
