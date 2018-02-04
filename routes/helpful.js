var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    User = require("../models/user"),
    password = 'd6FD453Efsdfeq';
    
var help = {};
    
help.isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()){
        User.findById(req.user.id, function(err, user){
           if(err) console.log(err); 
           
           if(user.confirmed == 2){
               if(user.status == 9){
                   res.locals.level = 9;
               } else {
                   res.locals.level = 0;
               }
               next();
           } else if(user.confirmed == 1){
                res.redirect("/fullsignup?userid=" + help.encrypt(user.email));
           } else {
                req.flash("error", "Сначала нужно подтвердить вашу почту!");
                res.redirect("/signedup?email=" + user.email);
           }
        });
    } else {
        req.flash("error", "Сначала нужно войти!");
        res.redirect("/login");
    }
}

help.validateEmail = function (email) {
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

help.isAdmin = function (req, res, next){
    if (req.isAuthenticated()){
        User.findById(req.user.id, function(err, user){
           if(err) console.log(err); 
           
           if(user.status == 9){
               next();
           } else {
                req.flash("err", "Недостаточно правы!");
                res.redirect("/login");
           }
        });
    } else {
        req.flash("err", "Сначала нужно войти!");
        res.redirect("/login");
    }
}

help.isUser = function(req, res, next){
    if (req.isAuthenticated()){
        User.findById(req.user.id, function(err, user){
           if(err) console.log(err); 
           
           if(user.balance > 0){
               next();
           } else {
                req.flash("err", "Недостаточно прав!");
                res.redirect("/wallet");
           }
        });
    } else {
        req.flash("err", "Сначала нужно войти!");
        res.redirect("/login");
    }
}

help.encrypt = function(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
help.decrypt = function(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}



help.daysToDate = function(input_date, daystoadd) {
    var date = new Date(input_date);
    var newdate = new Date(date);
    newdate.setDate(newdate.getDate() + daystoadd);
    return newdate;
}

help.tillDate = function(welldate){ 
    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var secondDate = new Date(welldate);
    var firstDate = new Date();
    //return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
    return Math.round((firstDate.getTime() - secondDate.getTime())/(oneDay) * -1);
}

help.checkPhone = function(inputtxt){
    var phoneno = /^\d{11}$/;
    if(inputtxt.match(phoneno)){
      return true;
    }
      else
    {
        return false;
    }
}

module.exports = help;