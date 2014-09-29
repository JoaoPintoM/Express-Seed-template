/*
  Author : Joao Pinto
   - pinto.joao@outlook.com

  based on the work of phildow from OK CODERS
      -> https://github.com/okcoders
*/

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var schema = mongoose.Schema({
  email: {type: String, require: true, trim: true, unique: true},
  password: {type: String, require: false},
  admin: {type: Boolean, default: false},
  activated : {type: Boolean, default: false},
  secret: {type: String, default: null},
  picture: {type: String, default: null}
});

schema.methods.generateHash = function (password) {
	 return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

schema.methods.isValidPassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};

var User = mongoose.model('user', schema);
module.exports = User;