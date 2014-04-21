/**
 * Reciever.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {

      rrid:'integer',
      name:'string',
      mac:'string',
      zones:{
      	model:'Zones'
      },
toJSON:function()
      {
        var obj=this.toObject();
        delete obj.createdAt;
        delete obj.updatedAt;
        return obj;
      }
	}

};
