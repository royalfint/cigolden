var User      = require("../models/user"),
    mongoose  = require('mongoose'),
    help      = require("../routes/helpful");

mongoose.connect("mongodb://localhost/cigolden_db");

User.find({}, function(err, users){ //выплаты
        if(err)
            console.log(err);
        users.forEach(function(user){
           if(help.tillDate(user.next_payment) > 0){
               console.log("Days left " + help.tillDate(user.next_payment) + " for user " + user.username);
            } else {
                //pay the guy if the date is due
                var future_profit = (user.balance + user.net_profit) * (user.deposit_percent / 100);
                User.findByIdAndUpdate(user._id, {
                    net_profit: Number(user.net_profit) + Number(future_profit),
                    next_payment: help.daysToDate(new Date(), 31)
                }, function(err, newUser) {
                        if(err) console.log(err);
                });
                //checking for referal payment;
                var refs1 = user.refs1;
            } 
        });
   });
   
throw new Error("Done with cron job!");