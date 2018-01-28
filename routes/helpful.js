var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    User = require("../models/user"),
    password = 'd6FD453Efsdfeq';
    
var help = {};
    
help.isLoggedIn = function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()){
        User.findById(req.user.id, function(err, user){
           if(err) console.log(err); 
           
           if(user.confirmed == 2){
               next();
           } else {
                req.flash("err", "Сначала нужно подтвердить вашу почту!");
                res.redirect("/signedup");
           }
        });
    } else {
        req.flash("err", "Сначала нужно войти!");
        res.redirect("/login");
    }
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

help.encrypt = function encrypt(text){
  var cipher = crypto.createCipher(algorithm,password)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}
 
help.decrypt = function decrypt(text){
  var decipher = crypto.createDecipher(algorithm,password)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

help.daysToDate = function daysToDate(input_date, daystoadd) {
    var date = new Date(input_date);
    var newdate = new Date(date);
    newdate.setDate(newdate.getDate() + daystoadd);
    return newdate;
}

help.tillDate = function tillDate(welldate){ 
    var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
    var secondDate = new Date(welldate);
    var firstDate = new Date();
    return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
}

module.exports = help;