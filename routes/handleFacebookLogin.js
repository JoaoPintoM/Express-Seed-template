/*
  Author : Joao Pinto
   - pinto.joao@outlook.com
*/

var express = require('express');
var router = express.Router();

var User = require('./../models/user');


module.exports = function(accessToken, refreshToken, profile, done) {

    if(!profile.emails){
      console.log('fuck this shit');
      done(null, false, { message: 'No email returned from facebook' });    
    }
      

    var u =  {
          name: profile.displayName,
          facebookId: profile.id,
          picture: profile.photos[0].value,
          email: profile.emails[0].value
        };

  //Verify information provided by facebook
  //check if user email exists in database
  User.findOne({email: u.email}, function (err, user){
    if(err){
      return done('POST /users/register : ' + err);

    //If user exists then we login
    } else if (user){
      done(null, user, { message: 'You are now logged with your facebook account' });
    }
    //if everything alright then we try to save the user
    else{
      var user = new User();
      
      user.email = u.email;
      user.picture = u.picture;

      user.save(function (err){
        if(err){
          console.log('Register with FACEBOOK error : ' + err);
          done(null, false, { message: 'internal Error sorry we could not make it' });  
        }
        //if no error the user is register now, we need to inform the user
        //we log in the user too
        else{
          done(null, user, {message: 'Successfully register with facebook account'});
        }
      });
    }
  });
};