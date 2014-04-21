/**
 * RecieverController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
	
    findrecid: function(req, res) {
      var id1=req.param('id');
      //Console log --> id 
      console.log(id1);
      Reciever.find({id:id1}).done(function(err, rec){
            
            if(err)
            {
              return res.redirect('/static/index');
            }        
      
            res.json(rec);
    });

    },
    findrecasset: function(req, res) {
      var id1=req.param('id');
      var arr1=[];
      //Console log --> id 
      console.log(id1);
      Beacon.find({reciever:id1}).done(function(err, rec){
            
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

    }

};
