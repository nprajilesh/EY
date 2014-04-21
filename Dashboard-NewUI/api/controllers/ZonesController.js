/**
 * ZonesController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {

findzonid: function(req, res) {
      var id1=req.param('id');
      //Console log --> id 
      console.log(id1);
      Zones.find({id:id1}).done(function(err, zon){
            
            if(err)
            {
              return res.redirect('/static/index');
            }        
      
            res.json(zon);
    });

    },

findrr: function(req, res) {
      var id1=req.param('id');
      var arr1=[];
      //Console log --> id 
      console.log(id1);
      Reciever.find({zones:id1}).done(function(err, rec){
            
            if(err)
            {
              return res.redirect('/static/index');
            }      
            for(var i=0;i<rec.length;i++)
            {
              arr1.push(rec[i]);
            }
            res.json(arr1);
    });

    },

	findasset: function(req, res) {
    	var id1=req.param('id');
    	var a;
      var arr=[];
    	//Console log --> id 
      console.log(id1);
    	Reciever.find({zones:id1}).done(function(err, rec){
            
            if(err)
            {
              return res.redirect('/static/index');
            }        
            for(var i=0;i<rec.length;i++)
            {
              //console log --> receiver details
              console.log(JSON.stringify(rec[i]));
              a=JSON.stringify(rec[i].id);
              // console log -->> receiver id
              console.log(a);
              Beacon.find({reciever:a}).done(function(err, user){
                if(err)
                {
                	return res.redirect('/static/index');
                }
                console.log(user.length);
	            if(user.length!=0)
	            {
	            	console.log(JSON.stringify(user[0].bea_mac));
	            	for(j=0;j<user.length;j++)
	            		arr.push(user[j]);
				}                  
              });
            }
            console.log(arr);
            res.json(arr);
    });

    },
    findmaxasset: function(req, res) {
      //var id1=req.param('id');
      //Console log --> id 
      var a,b,c,g,h;
      var temp=0;
      var arr=[],arr1=[];
      Zones.find().done(function(err,zon){
            if(err)
            {
              return res.redirect('/static/index');
            }     
              a=zon.length;
               console.log('zon:'+a);
               // console.log(zon[2].zon_name);
            for(i=0;i<a;i++)
            {
              
                 g=zon[i].id;
                  console.log('zon:'+g);
                 Reciever.find({zones:g}).done(function(err, rec){
            
                      console.log(rec.length);
                     if(err)
                      {
                        return res.redirect('/static/index');
                      }    
                        for(var j=0;j<rec.length;j++)
                         {
                            console.log(JSON.stringify(rec[j]));
                             c=JSON.stringify(rec[j].id);
                                 // console log -->> receiver id
                                 console.log(c);
                                 Beacon.find({reciever:c}).done(function(err, user){
                                    if(err)
                                     {
                                       return res.redirect('/static/index');
                                     }
                                       console.log('No of beacons:'+user.length);
                                   if(user.length!=0)
                                     {
                                        temp=temp+user.length; 
                                        
                                     }                  
                                 });      
                          }
                          arr.push(temp);
                          arr1.push(temp);
                  });
                    temp=0;
              console.log(arr);
            } 
      });


      for(i=0;i<a;i++)
       {
        for(j=i+1;j<a;j++)
         {
            if(arr[j]<arr[i])
            {
                t=arr[j];
                arr[j]=arr[i];
                arr[i]=t;
            }
         }
       }
       for(k=0;k<a;k++)
       {
         if(arr[a-1]==arr1[k])
         {
          break;
         }    
       }
       var obj='{"Zone" :'+(k+1)+',"Max-Assets":'+arr1[k]+'}'; 
       res.send(JSON.parse(obj));
       console.log( 'Zone '+(k+1)+' have maximum assets:'+arr1[k]);
    }

};
