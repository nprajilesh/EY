          var myJSONobj = [{"zone":"101", "time":"10.30"},{"zone":"108","time":"10.35"},{"zone":"106","time":"10.40"},{"zone":"104","time":"10.50"},{"zone":"201","time":"11.30"},{"zone":"204","time":"11.50"},{"zone":"208","time":"12.30"},{"zone":"305","time":"1.30"},{"zone":"307","time":"4.30"},{"zone":"102","time":"6.30"}];


  
      function getDataMain() {
        return {
          'Basement': {
            id:'1',
            color: 'green',
            points: [49,197,49,179, 380,249, 527,210, 526,233, 377,277]
          },
          'Ground Floor': {
            id:'2',
            color: 'orange',
            points: [49,179,47,163,380,217,529,186,527,209,378,248]
          },
          'First Floor': {
            id:'3',
            color: 'yellow',
            points: [48,162,47,143,382,182,530,160,529,184,380,216]
          }
        }
      }

     
    //indiactes currently selected floor previous floor and zone 
      var curr_floor=" ";
      var curr_zone=" ";
      var search_zone=307;
      var prev_floor="   ";

      //shapelayer and tooltiplayer of container 1
      var shapesLayer = new Kinetic.Layer();
      var tooltipLayer = new Kinetic.Layer();
      
    //shapelayer and tooltiplayer of container 2
      var tooltipLayer2 = new Kinetic.Layer();
      var shapesLayer2 = new Kinetic.Layer();
      var textLayer = new Kinetic.Layer();
      var rectLayer = new Kinetic.Layer();
   
      
      //cordinates of Third floor zones
      function getDataTop() 
      {
        return {
        'Zone 1': {
            id : 301,
            color: 'yellow',
            points: [3,10,3,320,28,320,28,10]
            },
          'Zone 2': {
            id : 302,
            color: 'yellow',
            points: [28,10,28,32,550,32,550,10]
            },
          'zone 3': {
            id : 303,
            color: 'yellow',
            points: [550,10,550,32,550,320,577,320,577,10]
            },
          'zone 4': {
            id : 304,
            color: 'yellow',
            points: [550,320,550,200,457,200,457,320]
            },
          'zone 5': {
            id : 305,
            color: 'yellow',
            points: [550,200,457,200,457,138,398,138,398,32,550,32]
            },
          'zone 6': {
            id : 306,
            color: 'yellow',
            points: [ 398,138,398,32,182,32,182,138]
            },
          'zone 7': {
            id : 307,
            color: 'yellow',
            points: [ 182,32,182,138,123,138,123,199,28,199,28,32]
            },
          'zone 8': {
            id : 308,
            color: 'yellow',
            points: [ 123,199,28,199,28,320,123,320]
            },
          'zone 9': {
            id : 309,
            color: 'yellow',
            points: [ 123,320,123,138,457,138,457,320,428,320,428,165,150,165,150,320]
            },
          'zone 10': {
            id : 310,
            color: 'yellow',
            points: [ 428,320,428,165,150,165,150,320,215,320,215,184,365,185,365,320]
            }
          }
        }

      //cordinates of second floor zones
      function getDataMiddle() 
      {
        return {
          'Zone 1': {
            id : 201,
            color: 'orange',
            points: [2,2,2,143,120,143,120,2]
            },
          'Zone 2': {
            id : 202,
            color: 'orange',
            points: [  120,143,2,143,2,313,120,313]
            },
          'zone 3': {
            id : 203,
            color: 'orange',
            points: [214,2,120,2,120,125,214,125]
            },
          'zone 4': {
            id : 204,
            color: 'orange',
            points: [  120,125,214,125,214,157,428,157,428,313,363,313,363,177,214,177,214,313,120,313]
            },
          'zone 5': {
            id : 205,
            color: 'orange',
            points: [ 214,2,214,157,363,157,363,99,428,99,428,2]
            },
          'zone 6': {
            id : 206,
            color: 'orange',
            points: [ 363,99,428,99,428,2,575,2,575,157,363,157]
            },
          'zone 7': {
            id : 207,
            color: 'orange',
            points: [428,157,428,313,575,313,575,222,440,222,440,157]
            },
          'zone 8': {
            id : 208,
            color: 'orange',
            points: [  440,157,575,157,575,222,440,222]
            },
          'zone 9': {
            id : 209,
            color: 'orange',
            points: [  363,313,363,177,214,177,214,313]
            }
          }
        }
       


      
       
      //cordinates of first floor zones
      function getDataBottom()
      {
        return {
        'zone 1': {
            id : 101,
            color : 'green',
            points: [1,1,120,1,120,142,1,142]
          },
        'zone 2': {
            id : 102,
            color : 'green',
            points: [1,144,120,144,120,219,1,219]
          },
        'zone 3': {
            id : 103,
            color : 'green',
            points: [1,220,120,220,120,310,1,310]
          },
        'zone 4': {
            id : 104,
            color : 'green',
            points: [122,1,215,1,215,178,122,178]
          },
        'zone 5': {
            id : 105,
            color : 'green',
            points: [122,196,215,196,215,310,122,310]
          },  
        'zone 6': {
            id : 106,
            color : 'green',
            points: [428,1,575,1,575,310,428,310]
          },
        'zone 7': {
            id : 107,
            color : 'green',
            points: [215,1,365,1,365,98,293,98,293,157,215,157]
          },
        'zone 8': {
            id : 108,
            color : 'green',
            points: [366,1,366,98,293,98,293,157,366,157,366,243,426,243,426,1]
          },
        }
      }


      //Function to draw tooltip at x y cordinate
      function updateTooltip(tooltip, x, y, text) 
      {
        tooltip.getText().text(text);
        tooltip.position({x:x, y:y});
        tooltip.show();
      }

      //stage for container 1 (EY building)
      var stage = new Kinetic.Stage({
        container: 'container',
        width: 578,
        height: 325
      });

      //tooltip for container1
      var tooltip = new Kinetic.Label({
        opacity: 0.75,
        visible: false,
        listening: false
      });

      //tooltip  configuration container 1
      tooltip.add(new Kinetic.Tag({
        fill: 'black',
        pointerDirection: 'down',
        pointerWidth: 10,
        pointerHeight: 10,
        lineJoin: 'round',
        shadowColor: 'black',
        shadowBlur: 10,
        shadowOffset: {x:10,y:10},
        shadowOpacity: 0.5
      }));
      
      tooltip.add(new Kinetic.Text({
        text: '',
        fontFamily: 'Calibri',
        fontSize: 18,
        padding: 5,
        fill: 'white'
      }));
    

    //tooltip2 for container 2
      var tooltip2 = new Kinetic.Label({
        opacity: 0.75,
        visible: false,
        listening: false
      });
        
      tooltip2.add(new Kinetic.Tag({
             fill: 'black',
             pointerDirection: 'down',
             pointerWidth: 10,
             pointerHeight: 10,
             lineJoin: 'round',
             shadowColor: 'black',
             shadowBlur: 10,
             shadowOffset: {x:10,y:10},
             shadowOpacity: 0.5
          }));
      
      tooltip2.add(new Kinetic.Text({
           text: '',
           fontFamily: 'Calibri',
           fontSize: 18,
           padding: 5,
           fill: 'white'
        }));
  
      //draw rectangle in container 2
      var rect = new Kinetic.Rect({
        x: 130,
        y: 140,
        fill: '#3c8dbc',
        width: 360,
        height: 50,
      });

      //text in container2
      var simpleText = new Kinetic.Text({
        x: 235,
        y: 155,
        text: 'No Floor selected',
        fontSize: 19,
        fontFamily: 'Calibri',
        fill: '#fff'
      });
      
     
      //stage for container 2 (floor plans)
      var stage2 = new Kinetic.Stage({
        container: 'container2',
        width: 580,
        height: 327
      });
     
      //add textlayer to container2
      textLayer.add(rect);
      textLayer.add(simpleText);
      stage2.add(textLayer);
      
      
      //function to update points of container 1
      function updatepoints1()
      {
      
      	// get areas data of container 1
        var areas = getDataMain();
    
        // draw areas of container1
        for(var key in areas) 
        {

          var area = areas[key];
          var points = area.points;

            var shape = new Kinetic.Line({
                 points: points, 
                 fill: area.color,
                 id:area.id,
                 opacity: 0,
                 key: key,
                 closed: true
            });
          shapesLayer.add(shape);
          tooltipLayer.add(tooltip);
       }

        //add shapes to stage
        stage.add(shapesLayer);
        stage.add(tooltipLayer);

      }
      
      //updates region in selected floor 
      function updatepoints()
       {
          
          var areas2;
          shapesLayer2.destroyChildren();
          tooltipLayer2.remove();
                   
          if(curr_floor=="Basement")
                areas2 = getDataBottom();
          else if(curr_floor=="Ground Floor")
                areas2 = getDataMiddle();
          else if(curr_floor=="First Floor")
                areas2 = getDataTop();
           

          //draw area of selected floor
          for(var key in areas2) 
          {
              var area = areas2[key];
              var points = area.points;
              var shape = new Kinetic.Line({
                points: points,
                fill: area.color,
                opacity: 0,
                id:area.id,
                key: key,
                closed: true
                });
              
              shapesLayer2.add(shape);
              tooltipLayer2.add(tooltip2);

            }
            
             //add shape to stage2
             stage2.add(shapesLayer2);
             stage2.add(tooltipLayer2);
         }
      

        //function to update no floor selected text
        function nofloorselected()
        {
             document.getElementById("container2").style.backgroundImage = "";
             document.getElementById("container2").style.border="2px solid gray";
             textLayer.destroyChildren();
             textLayer.add(rect);
             textLayer.add(simpleText);
             stage2.add(textLayer);
             shapesLayer.removeChildren();
             shapesLayer2.removeChildren();
             updatepoints1();
             updatepoints();
        
        }

      //function to load detailde image floor
      function updatefloorpic(floorname)
      {
            shapesLayer.removeChildren();
            updatepoints1();
            document.getElementById("container2").style.border="none";
            updatepoints(); 
            textLayer.clear();
            textLayer.destroyChildren();
            
            if(prev_floor!=curr_floor || curr_floor=='$')
            {
                  if(floorname==="Basement")
                      document.getElementById("container2").style.backgroundImage = "url('./img/floorplan/bottom.png')";
                  else if(floorname==="Ground Floor")
                      document.getElementById("container2").style.backgroundImage = "url('./img/floorplan/middle.png')";
                  else if(floorname==="First Floor")
                      document.getElementById("container2").style.backgroundImage = "url('./img/floorplan/top.png')";
                  else
                      nofloorselected();
            }
      }


          
      //mouse over function for container 1
      updatepoints1();
      stage.on('mouseover', function(evt)
        {
          var shape = evt.targetNode;
          if (shape)
            {
              shape.setOpacity(0.5);
              shapesLayer.draw();
            }
        });

      //mouse out event for container 1
      stage.on('mouseout', function(evt) 
      {
          var shape = evt.targetNode;
          if (shape.getAttr('key')!=curr_floor)
            {
             shape.opacity(0);
             shapesLayer.draw();
            }
          
          if(shape)
          {
            tooltip.hide();
            tooltipLayer.draw();
          }
      });

      //mouse move function for container 1
      stage.on('mousemove', function(evt)
      {
          var shape = evt.targetNode;
          if (shape) 
            {
              var mousePos = stage.getPointerPosition();
              var x = mousePos.x;
              var y = mousePos.y - 5;
              updateTooltip(tooltip, x, y, shape.getAttr('key'));
              tooltipLayer.batchDraw();
            }
      });

      //mouse out function for container 2
      stage2.on('mouseout', function(evt)
      {
          var shape = evt.targetNode;
          if (shape.getAttr('id')!=curr_zone)
            {
              shape.opacity(0);
              shapesLayer2.draw();
            }
          if (shape) 
            {
              tooltip2.hide();
              tooltipLayer2.draw();
            }
      });

      //mouse move function for container 2
      stage2.on('mousemove', function(evt) 
        {
          var shape = evt.targetNode;
          if (shape) 
            {
              var mousePos = stage2.getPointerPosition();
              var x = mousePos.x;
              var y = mousePos.y - 5;
              updateTooltip(tooltip2, x, y, shape.getAttr('key'));
              tooltipLayer2.batchDraw();
            }
        }); 

      //mouse over function for container 2
      stage2.on('mouseover', function(evt)
      {
          var shape = evt.targetNode;
          if (shape) 
            {
              shape.setOpacity(0.5);
              shapesLayer2.draw();
           }
        });
  

     //onclick function for container 1

      stage.on('click', function(evt) 
      {
          var shape = evt.targetNode;
          if (shape)
            {
              curr_floor=shape.getAttr('key');
              curr_zone=" ";
              updatefloorpic(curr_floor); 
              prev_floor=curr_floor;
             
            }
        });
      

      //onclick function for container 2
      stage2.on('click',function(evt)
       {
          var shape = evt.targetNode;
          if(shape)
          {
              curr_zone=shape.getAttr('id');
              shapesLayer2.removeChildren();
              updatepoints();
              var zone_id=shape.getAttr('id');
              console.log(zone_id);
          }
       });

      	//function to highlight selcted zone
      	function highlightzone(search_zone)
      	{
      		  curr_zone=search_zone;
      		  var floor_num;    			
      		  if(search_zone>300 && search_zone<=310)
      		  {
      		 	    floor_num=3;
      		 	    curr_floor="First Floor";
      		  }
      		  else if(search_zone>200 && search_zone<=209)
      		  {
      		 	    curr_floor="Ground Floor";
      		 	    floor_num=2;
      		  }
      		  else if(search_zone>100 && search_zone<=108)
      		  {
      		 	    curr_floor="Basement";
      		 	    floor_num=1;
      		  }
            else
              curr_floor="$";
            console.log(curr_floor);

      		 updatefloorpic(curr_floor);
      		 prev_floor=curr_floor; 
      		 var shape1 =stage.find('#'+floor_num);
      		 shape1.setOpacity(0.5);
      		 shapesLayer.draw();
           console.log(search_zone);
           shapesLayer2.removeChildren();
           updatepoints();
             
      		 var shape2=stage2.find('#'+search_zone);
           blinkzone(shape2);
      		 shape2.setOpacity(0.5);
      	   return curr_floor;	
        }

        //function to blink the selected zone
        function blinkzone(shape2)
        {
            var x=0;
            var flag=0;
            var myob=setInterval(function(){

              x++;
              if(x>20)
              {
                clearInterval(myob);
                shape2.setOpacity(0.5);
                shapesLayer2.draw();
              }
              else
              {

                if(flag==0)
                {
                  shape2.setOpacity(0.5);
                  shapesLayer2.draw();
                  flag=1;
                }
                else
                {
                  shape2.setOpacity(0);
                  shapesLayer2.draw();
                  flag=0;
                }
          
              }

            },250);
        }

     //onclick function to search employee
      function searchemployee(id)
      {
           highlightzone(id);
                         
      }

        //function play history of asset movements
      	function playhistory()
      	{
      		var asset_id=document.getElementById('play-emp').value;

      			console.log(myJSONobj.length);
      			var i=0;
            highlightzone(myJSONobj[i].zone); 
             
      			var myob = setInterval(function()
            {
              i++;
             	if(i<myJSONobj.length)
                highlightzone(myJSONobj[i].zone); 
      				else
      				  clearInterval(myob);
      			},5000);
   			
	  	  }


      //function to remove selction onclick  ouside building(container 1)
      stage.getContent().addEventListener('click', function()
        {
          curr_floor="";
          prev_floor=" ";
          nofloorselected();
         });
