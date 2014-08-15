var rendererOptions;
var directionsDisplay;
var directionsService;
var waypoints=[];
var count=0;
var inputc=1;
var stops={};
var places={};
var markers=[];
var markerid;
var pos;
var cordinates=[];
var map;
var polystr;
var waymarkers=[];

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
  
  rendererOptions = {
    map: map,
    draggable: true
  };
  directionsService = new google.maps.DirectionsService();
  directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
  directionsDisplay.setMap(map);

  /*var sourcedat=[];
  $.ajax({
    type:'POST',
    url: "http://192.168.0.175:1337/stops/find",
    dataType: "json",
    data: {},
    success: function(data) {
      console.log(data);
      sourcedat = $.map(data, function(item) {
        return {
          label: item.stop_name,
          id: item.id,
        };
      });
      console.log(sourcedat);
      $("#stops").autocomplete({
        source: sourcedat,
        minLength: 0,
        select: function(event, ui) {
          //$('#stop_id').val(ui.item.id);
        }
      });
    }
  });*/

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
      waymarkers.push(marker);
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
    document.getElementById('reset_button').style.visibility="visible";
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
  
  for(m in waymarkers){
    waypoints.push({
          location:waymarkers[m].getPosition(),
          stopover:false
      });
  }
    

  var request = {
      origin:places['source'].marker.getPosition(),
      destination:places['destination'].marker.getPosition(),
      travelMode: google.maps.TravelMode.DRIVING,
      provideRouteAlternatives: false,
      waypoints:waypoints
  };

  var polyline = new google.maps.Polyline({
    path: [],
    strokeColor: '#FF0000',
    strokeWeight: 3
    });

  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
 //     console.log(response);
 //     directionsDisplay.setDirections(response);
      document.getElementById('reset_button').style.visibility="visible";
      places['source'].marker.setMap(null);
      places['destination'].marker.setMap(null);
      for(m in waymarkers)
        waymarkers[m].setMap(null);
    

      var legs = response.routes[0].legs;
      for (i=0;i<legs.length;i++) {
        var steps = legs[i].steps;
        for (j=0;j<steps.length;j++) {
          var nextSegment = steps[j].path;
          for (k=0;k<nextSegment.length;k++) {
            polyline.getPath().push(nextSegment[k]);
          }
        }
      }
      polyline.setMap(map);
      latlngarray=polyline.getPath().getArray();
      jsondat={shape_id:1,cordinates:[]};
      for(var i=0;i<latlngarray.length;i++){
        //console.log(latlngarray[i].lat());r
        jsondat.cordinates.push({shape_pt_lon:latlngarray[i].lng(),shape_pt_lat:latlngarray[i].lat(),shape_pt_sequence:i+1});
      }

    //  inserttodb(jsondat);
 //     jsondat=JSON.stringify(jsondat);
      console.log(jsondat);
     
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




/* Resets the markers and Wave Points*/
function reset_route(){
  directionsDisplay.setMap(null);
  places={};
  waypoints=[];
  for(var i=0; i<markers.length; i++)
    markers[i].setMap(null);
  markers=[];
  waymarkers=[];
  document.getElementById("reset_button").style.visibility="hidden";
  document.getElementById("form").reset();
  map.setCenter(pos);
  map.setZoom(10);
}


/* Overview_polyline is inserted into databse along with route Id*/
function inserttodb(jsondata){
    
    $.ajax({
      type: 'POST',
      url: 'http://192.168.0.175:1337/shapes/create',
      data: jsondata,
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
      data: {id:7},
      dataType: 'json',
      success: function(data) { 

       console.log(data);
       
      /*  console.log(data);
        var decpoly = google.maps.geometry.encoding.decodePath(data.route);
        console.log(decpoly);
        var polyline= new google.maps.Polyline({map:map,path:decpoly}); 
        console.log(data); */


      },
      error: function() { alert('something bad happened'); }
    });
    
}

function gettime(){
  
  console.log(document.getElementById('stop_time').value);
  stops[markerid].time=document.getElementById('stop_time').value;
  console.log(stops);
  document.getElementById('stop_details').style.visibility='hidden';
}