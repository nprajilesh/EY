var rendererOptions;
var directionsDisplay;
var directionsService;

function initialize() {
  var mapOptions = {
    zoom: 10,
    panControl: false,
    zoomControl: true,
    zoomControlOptions: {
        style: google.maps.ZoomControlStyle.SMALL,
        position: google.maps.ControlPosition.RIGHT_BOTTOM
    }
  };

  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      map.setCenter(pos);
    });
  }else {
    var pos = new google.maps.LatLng(8.487495,76.948623);   // Browser doesn't support Geolocation
    map.setCenter(pos);
  }

  map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
 
  //$("input").each(function(){    
    var input = document.getElementById('input');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    console.log(input);
   // map.controls[google.maps.ControlPosition.LEFT_TOP].push(document.getElementById('stops'));
    //});
  rendererOptions = {
    map: map,
    draggable: true
    };
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
  directionsDisplay.setMap(map);
  
}

var places={};

function search(elem){
  
  var input = document.getElementById(elem.id);
  console.log(elem.id);
  
  //map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  var infowindow = new google.maps.InfoWindow();
  var marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29)
  });
  var place;
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    infowindow.close();
    marker.setVisible(false);
    place = autocomplete.getPlace();
    places[elem.id]=place.geometry.location;
    console.log(place.name+','+place.formatted_address);
    //console.log(places['source']);
    
    var regex= /^waypoint-?/;
    
    if(regex.test(elem.id)){
      console.log("matches");
      waypoints.push({
          location:place.formatted_address,
          stopover:false
      });
      console.log(waypoints);
      count++;
      document.getElementById('button').disabled=false;
      if(count===8){
        document.getElementById('button').disabled=true;
      }
    return;
    }

    if (!place.geometry) {
      return;
    }

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(10);  // Why 17? Because it looks good.
    }
    marker.setIcon(/** @type {google.maps.Icon} */({
      url: place.icon,
      size: new google.maps.Size(71, 71),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(35, 35)
    }));
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    var address = '';
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ');
    }

    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
    infowindow.open(map, marker);
  });
}







function getdirections(){
  console.log("button clicked");
  console.log(waypoints);
  //console.log(places['destination']);

  

  var request = {
      origin:places['source'],
      destination:places['destination'],
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: false,
      waypoints:waypoints

  };

  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      console.log(response);
      directionsDisplay.setDirections(response);
    }
  });
}

waypoints=[];
var count=0;
var inputc=1;
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

var stops={};
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
google.maps.event.addDomListener(window, 'load', initialize);