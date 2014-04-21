/**
 * BeaconController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
	
   find: function(req, res) {

        Beacon.find(function userfound(err,user){
            if(err)
              {
                return res.redirect('/static/new');
              }

             res.json(user);
        });
          
         
    },

     subscribe:function(req,res)
      {
        console.log('subscribed');
         Beacon.find(function foundusers(err,users){
 

             Beacon.find(req.socket);

             Beacon.find(req.socket,users);
         });
      }
};
