/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
		timestamp:'string',
	     count:'integer',
		 lon:'float',
		 members:{
		 	 type:'array'
		 },
		 lat:'float',
		 batteryleve:'integer',
		 imei:'string'
	}

};
