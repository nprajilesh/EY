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
	infowindow = new google.maps.InfoWindow({
             content: 'holding...'
        });	

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
  		showroute(this);
  		vehicle_id=this.id;
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

function showroute(data)
{
	
}