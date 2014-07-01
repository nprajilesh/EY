function init(){
	
	var socket = io.connect('http://localhost:3000/');

	socket.on('connect', function(data){
	    socket.emit('subscribe', {channel:'realtime'});
    });

    socket.on('reconnecting', function(data){
    });

    socket.on('realtime', function (data) {
     // data = JSON.parse(data);
     	console.log(data);
   //    console.log('received a message: ', data.ID);
   		angular.element("#app-angular").scope().updateFn(data);
       updatevehicle(data);
    });

    createmap();

}

var map;
var infowindow;

function createmap(){

	map_canvas = document.getElementById("map_canvas");
	var myOptions = {
			center : new google.maps.LatLng(8.4875,76.9525),
			zoom : 12,
			mapTypeId : google.maps.MapTypeId.ROADMAP
		};
	map = new google.maps.Map(map_canvas, myOptions);
	infowindow = new google.maps.InfoWindow({
             content: 'holding...'
        });
}

function clearmap(){
  for (var i = 0; i < markersarr.length; i++) {
    markersarr[i].setMap(null);
  	markersarr = [];
  }
}

var uid;
var markersarr = {};
var vehicles = {};

function updatevehicle(data){

	var point = new google.maps.LatLng(data.lat, data.lng);
	uid = data.ID

	if(!(uid in markersarr)){

		vehicles[uid] = createvehicle(data,point);
		//console.log("uid"+marker.id)
	}else{
		markersarr[uid].animateTo(point,{ 
			easing : "linear",
			duration : 1000,
			complete : function(){}
		});
		//markersarr[uid].setPosition(point);
	}
}

function createvehicle(data,point){

	var image = 'bus.png'

	var	newmarker = new google.maps.Marker({
			position : point,
			map : map,
			id : uid,
			icon : image
		});
	newmarker.setTitle(toString(uid));
	markersarr[uid]=newmarker;
	google.maps.event.addListener(markersarr[uid], 'mouseover', function() {

    	infowindow.setContent(JSON.stringify(data.emp));
    	infowindow.open(map,this);
    });

    google.maps.event.addListener(markersarr[uid], 'mouseout', function() {
 	
 		infowindow.close();

       	
    });

  	google.maps.event.addListener(markersarr[uid], 'click', function() {
  		showroute(this);
  	});

  	url = 'http://ec2-54-81-137-234.compute-1.amazonaws.com/gtfs/trivroute'+data.ID+'.kml'
  	console.log(url);
  	var routelayer = new google.maps.KmlLayer({
		url : url,
		preserveViewport : true,
		map : map
	});

  	content = JSON.stringify(data.emp);
	return {
		uid : uid,
		marker : newmarker,
		route : routelayer,
		contentinfo : content

	}

}

function showroute(data){
	vehicles[data.id].route.setMap(map);
//	console.log(vehicles[data.id].route.url);
}