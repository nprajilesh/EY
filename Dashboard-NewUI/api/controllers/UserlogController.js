/**
 * UserlogController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
	
	finddesc:function(req,res)
	{
		Userlog.find()
		.limit(25)
		.sort('timestamp DESC')
		.exec(function(err,users){
			console.log(users);
				for(var i=0;i<users.length;i++)
			{
				obj = users[i];
				console.log(obj.userid);
				User.findOne({empid:obj.userid})
				.exec(function(err,detuser)
				{
					if(err)
						return;
					console.log(detuser);
					obj.username=detuser.name;
				});
			}
			console.log(users);
			return res.json(users);
		});
	},

	findLastbyId:function(req,res)
	{
		var id = req.param('id');
		console.log(id);
		Userlog.findOne({userid:id})
		.sort('timestamp DESC')
		.exec(function(err,user){
			console.log(user);
			User.findOne({empid:user.userid})
				.exec(function(err,detuser)
				{
					if(err)
						return;
					console.log(detuser);
					user.username=detuser.name;
					Reciever.findOne({rrid:user.rr})
					.exec(function(err,rruser){
						if(err)
							return;
						console.log(rruser);
						user.rec=rruser.name;
						Zones.findOne({id:rruser.zones})
						.exec(function(err,zzuser){
								if(err)
									return;
								console.log(zzuser);
								user.zoneid=zzuser.zoneid;
								user.zname=zzuser.name;									
						});
					});

				});
				console.log(user);
				res.json(user);
		});
	},
	findLastNumbyId:function(req,res)
	{
		var id = req.param('id');
		var userjson=[];
		console.log(id);
		Userlog.find({userid:id})
		.limit(10)
		.sort('timestamp DESC')
		.exec(function(err,nuser){
			console.log(nuser);
			nuser.forEach(function(user){
				User.findOne({empid:user.userid})
				.exec(function(err,detuser)
				{
					if(err)
						return;
					console.log(detuser);
					user.username=detuser.name;
					Reciever.findOne({rrid:user.rr})
					.exec(function(err,rruser){
						if(err)
							return;
						console.log(rruser);
						user.rec=rruser.name;
						Zones.findOne({id:rruser.zones})
						.exec(function(err,zzuser){
								if(err)
									return;
								console.log(zzuser);
								user.zoneid=zzuser.zoneid;
								user.zname=zzuser.name;									
						});
					});
					userjson.push(user);	
				});
				
			});
		});
		console.log(userjson);
		res.json(userjson);
	}
};
