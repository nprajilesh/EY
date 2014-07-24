var rendererOptions;
var directionsDisplay;
var directionsService;
var waypoints=[];
var stop_id=0;
var count=0;
var inputc=1;
var stops=[];
var route={};
var places={};
var markers=[];
var pos;
var stop_nam;
var cordinates=[];
var route_response;
var map;
var polystr;
var polyline_dynamic;
google.maps.event.addDomListener(window, 'load', initialize);


/* Initializes the Google map and load the input div in top left direction services are initialized */
function initialize() {

  var mapOptions = {
    zoom: 10,
    panControl: false,
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL,
      position: google.maps.ControlPosition.RIGHT_BOTTOM
    }
  }
  map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
  
  if(navigator.geolocation) 
    navigator.geolocation.getCurrentPosition(function(position) {
            pos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
            map.setCenter(pos);
    });
  else{
    pos = new google.maps.LatLng(8.487495,76.948623);   // Browser doesn't support Geolocation
    map.setCenter(pos);
  }
    
  var input = document.getElementById('input');
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var stop_details=document.getElementById('stop_details'); 
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(stop_details);
  document.getElementById('stop_details').style.display = "none"; 
     
  rendererOptions = {
    map: map,
    draggable: true
    };
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
  directionsDisplay.setMap(map);
}


/*Select start and destination */
function search(elem){
  
  var input = document.getElementById(elem.id);
  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  var infowindow = new google.maps.InfoWindow();
  var marker = new google.maps.Marker({
    map: map,
    draggable:true,
    animation: google.maps.Animation.DROP

  });
  
   var place;
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
    infowindow.close();
    marker.setVisible(false);
    place = autocomplete.getPlace();
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
    places[elem.id]={
      place: place.geometry.location,
      marker: marker
    };


       
    var regex= /^waypoint-?/;
    
    if(regex.test(elem.id)){
      waypoints.push({
          location:place.formatted_address,
          stopover:false
      });
      count++;
      document.getElementById('waypoint_button').disabled=false;
      if(count===8)
         document.getElementById('waypoint_button').disabled=true;
      return;
    }

    if (!place.geometry)
      return;
    if (place.geometry.viewport)                    // If the place has a geometry, then present it on a map.
      map.fitBounds(place.geometry.viewport);
    else 
      map.setCenter(place.geometry.location);
      
    markers.push(marker);
    
    var address = '';
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }

    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
  });
}


/* Route details are obtained by direction Service API*/
function getdirections(){
  
  var request = {
      origin:places['source'].marker.getPosition(),
      destination:places['destination'].marker.getPosition(),
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: false,
      waypoints:waypoints

  };

  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      console.log(response);
      directionsDisplay.setDirections(response);
      document.getElementById('reset_button').style.visibility="visible";
      places['source'].marker.setMap(null);
      places['destination'].marker.setMap(null);
      route_response=response;
    // inserttodb(response);
    }
  });
}

/* Upto 8 wavepoints are added for each wavepoint a new autocomplete input field is created*/
function addwaypoint(elem){
  
  if(count<8){
    document.getElementById(elem.id).disabled=true;
    $("#form>input:nth-child("+inputc+")").after('<br><input id="waypoint-'+count+'" type="text" class="controls" placeholder="Via" onclick="search(this)" size="45">');
    inputc++;
    inputc++;
  }
}


/* Stops are added into maps by searching in autocomplete field*/
function addstops(elem){
  var input = document.getElementById(elem.id);
  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);


  var marker = new google.maps.Marker({
    map:map,
    draggable:true,
    animation: google.maps.Animation.DROP
  });

  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    var place = autocomplete.getPlace();
    console.log(place);
    document.getElementById('stop_details').style.display = "block";
    marker.setVisible(false);
    if (!place.geometry)
      return;
    

    if (place.geometry.viewport) 
      map.fitBounds(place.geometry.viewport);

    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
    document.getElementById('reset_button').style.visibility="visible";
    });
    input.value="";
    input.placeholder="Add stops";
   
}

/* Resets the markers and Wave Points*/
function reset_route(){
  directionsDisplay.setMap(null);
  if(polyline_dynamic)
      polyline_dynamic.setMap(null);
  places={};
  waypoints=[];
  for(var i=0; i<markers.length; i++)
    markers[i].setMap(null);
  markers=[];
  document.getElementById("reset_button").style.visibility="hidden";
  document.getElementById('stop_details').style.display = "none"; 
  map.setCenter(pos);
  map.setZoom(10);
}


/* Overview_polyline is inserted into databse along with route Id*/
function inserttodb(response){
    
    $.ajax({
      type: 'POST',
      url: 'http://192.168.0.175:1337/shapes/create',
      data: {shape_id:'20',route:response.routes[0].overview_polyline},
      dataType: 'json',
      success: function(data) { 
        alert('Route Created Sucessfully '); 
      },
      error: function() { alert('something bad happened'); }
    });
}


/*Load Route into map , overview_polyline is fetched from data base and decoded to get the latLngs*/
function loadroute(){
  $.ajax({
      type: 'POST',
      url: 'http://192.168.0.175:1337/shapes/findbyid',
      data: {id:20},
      dataType: 'json',
      success: function(data) { 
       
        console.log(data);
        var decpoly = google.maps.geometry.encoding.decodePath(data.route);
        console.log(decpoly);
        polyline_dynamic = new google.maps.Polyline({map:map,path:decpoly,polyline_style:2}); 
         document.getElementById('reset_button').style.visibility="visible";
        // and this is where we actually draw it. 
      
      },
      error: function() { alert('something bad happened'); }
    });
    
}

function addstop()
{
    var id=document.getElementById('stop_id');
    var time=document.getElementById('stop_time');
    var desc=document.getElementById('stop_desc');
//    stops[stop_id++] = {stopid:id,time:time,desc:desc,name:}



}

function submit_route()
{

}