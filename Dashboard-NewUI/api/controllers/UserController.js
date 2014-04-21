/**
 * UserController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
	findbyId:function(req,res)
	{	
		var id= req.param('id');
		User.findOne({empid:id})
		.exec(function(err,user){
			if(err)
				res.json({});
			
			res.json(user);
		});

	},
	findbyMac:function(req,res)
	{
		var id= req.param('id');
		User.findOne({mac:id})
		.exec(function(err,user){
			if(err)
				res.json({});
			
			res.json(user);
		});
	}
};
