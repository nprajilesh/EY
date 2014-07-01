var map;
var poly;
var path;
var infowindow;
var autocomplete;
var uid;
var markersarr = {};
var vehicles = {};

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
   		angular.element("#app-angular").scope().updateFn(data);
   	    updatevehicle(data);
    });

    createmap();
    placelist();   
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


function placelist()
{
	var input = document.getElementById('autocomplete');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);
    google.maps.event.addListener(autocomplete, 'place_changed',onPlaceChanged);
}


function updatevehicle(data)
{
	var point = new google.maps.LatLng(data.lat, data.lng);
	uid = data.ID;
	if(!(uid in markersarr))
		vehicles[uid] = createvehicle(data,point);
	else
	{
		markersarr[uid].animateTo(point,{ 
			easing : "linear",
			duration : 1000,
			complete : function(){}
		});
	}
	path = poly.getPath();
	path.push(point);
	console.log('*****************************'+point);
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

function onPlaceChanged()
 {	    
		    var place = autocomplete.getPlace();
		    if (!place.geometry) 
		      return;

		    // If the place has a geometry, then present it on a map.
		    if (place.geometry.viewport) 
		    	  map.fitBounds(place.geometry.viewport);
		    else 
		    {
			      map.setCenter(place.geometry.location);
			      map.setZoom(17);  // Why 17? Because it looks good.
		    }  
}


function showroute(data)
{
	vehicles[data.id].route.setMap(map);
}