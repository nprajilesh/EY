var map;
var poly;
var path;
var infowindow;
var autocomplete;
var uid;
var markersarr = {};
var vehicles = {};
var vehicle_id= -1;

function init()
{
	
	var socket = io.connect('http://localhost:3000/');

	socket.on('connect', function(data){
	    socket.emit('subscribe', {channel:'realtime'});
    });

    socket.on('reconnecting', function(data){
    });

    socket.on('realtime', function (data) {
     	console.log(data);
   	    updatevehicle(data);
   		angular.element("#hideclick").scope().updateFn(vehicles[vehicle_id]);
 
    });

    createmap();
     
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
	infowindow = new google.maps.InfoWindow({
             content: 'holding...'
        });	


var polyOptions = {
    strokeColor: '#428CCC',
    strokeOpacity: 1.0,
    strokeWeight: 3
	  };
  poly = new google.maps.Polyline(polyOptions);
  poly.setMap(map);
}

function updatevehicle(data)
{
	var point = new google.maps.LatLng(data.lat, data.lng);
	uid = data.ID;
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
	path = poly.getPath();
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
	google.maps.event.addListener(markersarr[uid], 'mouseover', function() {

    	infowindow.setContent(JSON.stringify(data.emp));
    	infowindow.open(map,this);
    });

    google.maps.event.addListener(markersarr[uid], 'mouseout', function() {

     		infowindow.close();       	
    });

  	google.maps.event.addListener(markersarr[uid], 'click', function() {
  		showroute(this);
  		vehicle_id=this.id;
  		angular.element("#hideclick").scope().clickUpdate(vehicles[this.id]);
  	});

  	url = 'http://ec2-54-81-137-234.compute-1.amazonaws.com/gtfs/trivroute'+data.ID+'.kml'
 // 	console.log(url);
  	var routelayer = new google.maps.KmlLayer({
		url : url,
		preserveViewport : true,
		map : map
	});

 	return {
		uid : uid,
		marker : newmarker,
		route : routelayer,
		contentinfo : data.emp,
		headingTo : uid


	}

}

function showroute(data)
{
	vehicles[data.id].route.setMap(map);
}