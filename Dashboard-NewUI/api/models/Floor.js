/**
 * Floors.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {

      flo_id:'integer',
      flo_name:'string',
      buildings:{
        model:'Building'
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
