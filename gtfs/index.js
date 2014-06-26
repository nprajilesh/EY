/*

Copyright (C) 2013 Michael Schnuerle <code@yourmapper.com> www.yourmapper.com

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*********
Significant edits to change from web sockets to ajax, new data format,
added popup infowindows, custom symbols for busses with color and orientation, 
bus numbers on symbols, layer for stops, layer for routes, onclick show 
colored layer for one bus, auto refreshing, iOS support.
*********

Intial version (C) and info:

 * Copyright (C) 2012 Brian Ferris <bdferris@onebusaway.org>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.

*/

// Look for *** to know where to replace paths with full URL paths from your own server (required by google for KML overlays)
 
	var marker;
 var infowindow;
 var contentString='';
 var firstTime = 1;
 
	var map;
	var markersArray = [];
	var ShapesLayer;
	    var StopsLayer;
	    var RouteLayer;
	    
	var i = 0;
     var iOS;

     
 
function Init() {
  
    var socket = io.connect('http://localhost:3000/');

     socket.on('connect', function(data){

      // setStatus('connected');
       socket.emit('subscribe', {channel:'realtime'});
     });

     socket.on('reconnecting', function(data){
      // setStatus('reconnecting');
     });

     socket.on('message', function (data) {
       console.log('received a message: ', data);
       addMessage(data);
     });

    function addMessage(data) {

    if (!firstTime) {
                //console.log('cleared');
                clearOverlays();
            }
            firstTime = 0;
    ProcessVehicleData(data);

    }



  var hostandport = window.location.hostname + ':' + window.location.port;

 map = CreateMap();

	/**
	 * Create a custom-styled Google Map with no labels and custom color scheme.
	 */
	function CreateMap() {
		
		var map_canvas = document.getElementById("map_canvas");
		var myOptions = {
			center : new google.maps.LatLng(8.4875,76.9525),
			zoom : 12,
			//styles : map_style,
			mapTypeId : google.maps.MapTypeId.ROADMAP
		};
		 infowindow = new google.maps.InfoWindow({
             content: 'holding...'
         });
        
		return new google.maps.Map(map_canvas, myOptions);
	};
	
    
 

	var vehicles_by_uid = {};
	var animation_steps = 1;


    function showRoute(tripid,tripcolor) {
        if (typeof RouteLayer === 'undefined') {
            
        } else {
            
            RouteLayer.setMap(null);
        }
        // *** needs to be a full URL to a dynamic KML route generator from your GTFS database. 3 sample route#.kml samples provided
        if (tripid === '1')
            var routeURL = 'http://ec2-54-81-137-234.compute-1.amazonaws.com/gtfs/trivroute1.kml'
        else if(tripid === '2')
            var routeURL = 'http://ec2-54-81-137-234.compute-1.amazonaws.com/gtfs/trivroute2.kml'
        
        RouteLayer = new google.maps.KmlLayer({
            url: routeURL,
            clickable: false,
            preserveViewport: true,
            suppressInfoWindows: false,
            screenOverlays: false
        });

        RouteLayer.setMap(map);

    }
    
    
	function UpdateVehicleYM(v_data) {
	    

        var uid = v_data.ID;
        
              
            vehicles_by_uid[uid] = CreateVehicleYM(v_data);
             var vehicle = vehicles_by_uid[uid];

            var op = CreateVehicleUpdateOperationYM(vehicle, v_data.Lat, v_data.Lon);
           
            if (vehicle.uid != '0') {
                
                    google.maps.event.addListener(vehicle.marker, 'click', function() {
                        infowindow.setContent(vehicle.contentinfo);
                        infowindow.open(map,this);
                        // show route
                        showRoute(vehicle.uid, vehicle.color);
                    });
            }
    };    
        function CreateVehicleYM(v_data) {
        //console.log(v_data);
        //console.log(v_data.Point);
        //console.log("CreateVehicle lat value: "+v_data.Lat+" Desc: "+v_data.Trip);
        var point = new google.maps.LatLng(v_data.Lat, v_data.Lon);
        var path = new google.maps.MVCArray();
        path.push(point);
        
        /* 
        //detect brightness of route color
        var rgbcolor = new RGBColor(v_data.Color);
                  if (rgbcolor.ok) { // 'ok' is true when the parsing was a success
                    var brightness = calcBrightness(rgbcolor);
                    var foreColor = (brightness < 130) ? "labelsWhite" : "labels";
                }
        */
        var delay = v_data.Delay;
        if ((delay == 0) || (delay == '')) {
            delay = '';
        } else {
            delay = "("+v_data.Delay+" min delay)";
        }
        contentString = "<b>"+v_data.Line+" "+v_data.Name+"</b><br><hr style='height:4px;border:none;color:#"+v_data.Color+";background-color:#"+v_data.Color+";' /><i>Route</i>: "+v_data.Route+"<br><i>Next Stop</i>: "+v_data.Stop+"<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; at "+v_data.Time+" "+delay+"<br><i>Updated</i>: "+v_data.Date+" "+v_data.Time+" ("+v_data.Ago+" mins ago)<div style='text-align: center; width:100%; margin-top:6px;'><a href='http://www.yourmapper.com/crimescore' target='crimescore'><img src='http://static.yourmapper.com/crimescore/CrimeScoreLogo24.png' style='width:63px;height:24px;vertical-align:middle;margin-right:6px; margin-bottom:4px;' align='ablsmiddle' border='0' title='CrimeScore at current bus location - Click for more details' /></a> <span style='font-weight: bold; font-size:20px; color:#"+v_data.CrimeColor+"; text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;'>"+v_data.CrimeGrade+"</span></div>";
        if (v_data.Line != '') {
        // marker 'M 16,0 C 16,0 0,24 0,33 C 0,42 7,49 16,49 C 25,49 32,42 32,33 C 32,24 16,0 16,0'
        // needle M-30 -2.5L-25 2.5L-20 -2.5L-20 -15L-25 -70L-30 -15z
        // star M 250,75 L 323,301 131,161 369,161 177,301 z
        // double circle M 600,81 A 107,107 0 0,1 600,295 A 107,107 0 0,1 600,81 z M 600,139 A 49,49 0 0,1 600,237 A 49,49 0 0,1 600,139 z
        // arrow head M 0,0  l -15,-5  +5,+5  -5,+5  +15,-5 z
        // arrow M 10,0  l +15,+5  -5,-5  +5,-5  -15,+5  m +10,0 +10,0
        // arrow point M -6,0  l +10,+5  -2,-5  +2,-5  -10,+5 m 8,0 2,0
        // circle arrow M 50 5 A 45 45, 0, 1, 0, 95 50 L 95 5 Z 
        // circle arrow with crosshair M 50 5 A 45 45, 0, 1, 0, 95 50 L 95 5 Z M 0 50 L 100 50 M 50 0 L 50 100
        
        //var bearing_arr = { 0: { x: -6, y: 8}, 45: { x: -2, y: -1}, 90: { x: 8, y: -7}, 135: { x: 18, y: -2}, 180: { x: 22, y: 8}, 225: { x: 18, y: 17}, 270: { x: 8, y: 23}, 315: { x: -2, y: 18}, 360: { x: -6, y: 8} };
        //var bearnum = (Math.round((parseInt(v_data.Bear)+22.5)/45)-1)*45;
        
        //console.log(bearnum);
        //console.log(v_data.Bear+ " " + v_data.Bear+22.5+ " " + (v_data.Bear+22.5)/45 + " " + bearnum+ " " + bearing_arr[bearnum]['x']+","+ bearing_arr[bearnum]['y']);
        
        // v_data.Bear - 45
        
    
        var marker_opts = {
            clickable : true,
            draggable : false,
            flat : false,
            icon : {
                path: 'M 50 5 A 45 45, 0, 1, 0, 95 50 L 95 5 Z',
                scale: .2,
                strokeColor: "000",
                strokeWeight:1,
                strokeOpacity: .7,
                fillColor: v_data.Color,
                fillOpacity: 0.8,
                rotation: v_data.Bear - 45,
                anchor: new google.maps.Point(50,50),
                origin: new google.maps.Point(50,50)
            },
            title : v_data.Line+" "+v_data.Name,
            map : map,
            position : point,
            labelContent: v_data.Line,
            labelAnchor: new google.maps.Point(8,8),
            labelClass: "labelsWhite", // the CSS class for the label
            labelStyle: {opacity: 0.90},
            labelInBackground: false
        };
   
    
        var polyline_opts = {
            clickable : true,
            editable : false,
            map : map,
            path : path,
            strokeColor : 663333,
            strokeOpacity : 0.5,
            strokeWeight : 3
        };
        
      
            var newmarker = new MarkerWithLabel(marker_opts);
            markersArray.push(newmarker);
            return {
                uid : v_data.Trip,
                marker : newmarker,
                //marker : new google.maps.Marker(marker_opts),
                //polyline : new google.maps.Polyline(polyline_opts),
                path : path, 
                contentinfo: contentString,
                color: v_data.Color
                //lastUpdate : v_data.lastUpdate
            };

        } else {
            return {
                uid : '0'
            };
        }
    };

	function CreateVehicleUpdateOperationYM(vehicle, lat, lon) {
		return function() {
			var point = new google.maps.LatLng(lat, lon);
			vehicle.marker.setPosition(point);
			var path = vehicle.path;
			var index = path.getLength() - 1;
			path.setAt(index, point);
		};
	};
	
    var first_update = true;

    

	function ProcessVehicleData(data) {
	    
		var bounds = new google.maps.LatLngBounds();
		
		
		var vehiclecount=1;
		if (iOS) {
		    var maxvehicles = 70;
		} else {
		    var maxvehicles = 300;
		}
	    
		jQuery.each(data, function() {
		    
            UpdateVehicleYM(this);
		    vehiclecount++;
		});
		
        if (first_update && ! bounds.isEmpty()) {
			map.fitBounds(bounds);
			first_update = false;
		}
	};

    function clearOverlays() {
      
        for (var i = 0; i < markersArray.length; i++ ) {
            markersArray[i].setMap(null);
        }
        
        markersArray.length = 0;
        markersArray = [];
      
    }

    
    
    var jsonURL = "data1.json"; // *** static file - you need to make this dynamic from your server
    // If you want to use our dynamic real-time JSON feed, please register at YourMapper.com and contact us
    
    function getRealtimeLocations() {
        $.getJSON( jsonURL, function( data ) {
            if (!firstTime) {
                //console.log('cleared');
                clearOverlays();
            }
            firstTime = 0;
            
                
                if (document.getElementById) { // DOM3 = IE5, NS6 
                    document.getElementById('counter').style.visibility = 'visible'; 
                    document.getElementById('routes').style.visibility = 'visible'; 
                    document.getElementById('stops').style.visibility = 'visible'; 
                } 
                else { 
                    if (document.layers) { // Netscape 4 
                        document.counter.visibility = 'visible'; 
                        document.routes.visibility = 'visible'; 
                        document.stops.visibility = 'visible'; 
                    } 
                    else { // IE 4 
                        document.all.counter.style.visibility = 'visible'; 
                        document.all.routes.style.visibility = 'visible'; 
                        document.all.stops.style.visibility = 'visible'; 
                    } 
                }
            
            ProcessVehicleData(data);
            
                
        //    countdown();
            
            
        });
    }

    function countdown() {
        var seconds = 60;
        function tick() {
            var counter = document.getElementById("counter");
            seconds--;
            counter.innerHTML = "Refresh: " + String(seconds);
            if( seconds > 0 ) {
                setTimeout(tick, 1000);
            } else {
                getRealtimeLocations();
            }
        }
        tick();
    }
    
    
   // getRealtimeLocations();



        // pre-generated KMZ file of shapes from GTFS feed
        // *** needs to be full URL from your server - sample provided here
        ShapesLayer = new google.maps.KmlLayer({
            url: 'http://ec2-54-81-137-234.compute-1.amazonaws.com/gtfs/shapes.kmz',
           // clickable: false,
            //preserveViewport: true,
            //suppressInfoWindows: true,
            //screenOverlays: false
        });
         
        // pre-generated KMZ file of stops from GTFS feed
        // *** needs to be full URL from your server - sample provided here
        StopsLayer = new google.maps.KmlLayer({
            url: 'http://ec2-54-81-137-234.compute-1.amazonaws.com/gtfs/trivstop1.kml',
            clickable: true,
            preserveViewport: true,
            suppressInfoWindows: false,
            screenOverlays: false
        });

        StopsLayer2 = new google.maps.KmlLayer({
            url: 'http://ec2-54-81-137-234.compute-1.amazonaws.com/gtfs/trivstop2.kml',
            clickable: true,
            preserveViewport: true,
            suppressInfoWindows: false,
            screenOverlays: false
        });
    
 ctaLayer = new google.maps.KmlLayer({
    url: 'http://gmaps-samples.googlecode.com/svn/trunk/ggeoxml/cta.kml'
  });
  //ctaLayer.setMap(map);
}



function toggleShapes() { 
    if (!document.getElementById('ShapesLayer').checked)  {
        //console.log("remove");
        ShapesLayer.setMap(null); 
    } else { 
        console.log("show");
       // ctaLayer.setMap(map);
        ShapesLayer.setMap(map); 
    }
}

function toggleStops() { 
    if (!document.getElementById('StopsLayer').checked)  {
        //console.log("remove");
        StopsLayer.setMap(null); 
    } else { 
        //console.log("show");
        StopsLayer2.setMap(map); 
        StopsLayer.setMap(map); 
    }
} 
