var rendererOptions;
var directionsDisplay;
var directionsService;
var waypoints=[];
var count=0;
var inputc=1;
var stops={};
var places={};
var markers=[];
var pos;
google.maps.event.addDomListener(window, 'load', initialize);
var map;

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
     
  rendererOptions = {
    map: map,
    draggable: true
    };
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
  directionsDisplay.setMap(map);
}

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
      console.log("matches");
      waypoints.push({
          location:place.formatted_address,
          stopover:false
      });
      console.log(waypoints);
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
    //infowindow.open(map, marker);
  });
}

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
    }
  });
}

function addwaypoint(elem){
  
  if(count<8){
    console.log(count);
    document.getElementById(elem.id).disabled=true;
    $("#form>input:nth-child("+inputc+")").after('<br><input id="waypoint-'+count+'" type="text" class="controls" placeholder="Via" onclick="search(this)" size="45">');
    inputc++;
    inputc++;
    console.log(inputc);
  }
}

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
    place = autocomplete.getPlace();
    marker.setVisible(false);

    if (!place.geometry)
      return;
    
    if (place.geometry.viewport) 
      map.fitBounds(place.geometry.viewport);

    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

  });
}

function reset_route(){
  directionsDisplay.setMap(null);
  console.log(directionsDisplay.getMap());
  places={};
  waypoints=[];
  for(var i=0; i<markers.length; i++)
    markers[i].setMap(null);
  markers=[];
  document.getElementById("reset_button").style.visibility="hidden";
  map.setCenter(pos);
  map.setZoom(10);
}
