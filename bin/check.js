var User      = require("../models/user"),
    mongoose  = require('mongoose'),
    help      = require("../routes/helpful");

//mongoose.connect("mongodb://localhost/cigolden_db");
mongoose.connect("mongodb://ciadmin:YtEpyftimVjq1Gfhjkm@ds113648.mlab.com:13648/cigolden");

User.find({}, function(err, users){ //выплаты
        if(err) console.log(err);
        
        users.forEach(function(user){
            
            if(help.tillDate(user.next_payment) <= 0){ //выплачиваем следующий платеж по первому депозиту
                var future_profit = (user.balance + user.net_profit + user.deposit_back) * (user.deposit_percent / 100);
                User.findByIdAndUpdate(user._id, {
                    net_profit: Number(user.net_profit) + Number(future_profit),
                    next_payment: help.daysToDate(user.next_payment, user.every)
                }, function(err, newUser) {
                        if(err) throw new Error(err);
                });
            } 
            
            if(help.tillDate(user.next_payment_two) <= 0){ //выплачиваем следующий платеж по второму депозиту
                var future_profit_two = (user.balance_two + user.net_profit_two + user.deposit_back_two) * (user.deposit_percent_two / 100);
                User.findByIdAndUpdate(user._id, {
                    net_profit_two: Number(user.net_profit_two) + Number(future_profit_two),
                    next_payment_two: help.daysToDate(user.next_payment_two, user.every)
                }, function(err, newUser) {
                        if(err) throw new Error(err);
                });
            } 
            
            if(help.tillDate(user.next_payment_three) <= 0){ //выплачиваем следующий платеж по третьему депозиту
                var future_profit_three = (user.balance_three + user.net_profit_three + user.deposit_back_three) * (user.deposit_percent_three / 100);
                User.findByIdAndUpdate(user._id, {
                    net_profit_two: Number(user.net_profit_three) + Number(future_profit_three),
                    next_payment_three: help.daysToDate(user.next_payment_three, user.every)
                }, function(err, newUser) {
                        if(err) throw new Error(err);
                });
            } 
            
            var refs1 = user.refs1; //ищем выплаты для рефералов первого уровня
            refs1.forEach(function(ref1){ 
               
               if(ref1.active && ref1.paid == false && help.tillDate(ref1.reward_date) <= 0){ //награда за первый депозит
                    
                    var reward_size = Number(ref1.balance) * Number(ref1.percent) / 100;
                    ref1.paid = true;
                    
                    User.findByIdAndUpdate(user._id, {
                        referal_profit: Number(user.referal_profit) + Number(reward_size),
                        refs1: refs1
                    }, function(err, newUser) {
                            if(err) throw new Error(err);
                            
                        //alert("updated out user: " + newUser);
                    });
               } else if(ref1.active && ref1.upgrades > 0 && ref1.paid_two == false && help.tillDate(ref1.reward_date_two) <= 0){ //награда за 2 депозит
                    
                    var reward_size = Number(ref1.balance_two) * Number(ref1.percent_two) / 100;
                    ref1.paid_two = true;
                    
                    User.findByIdAndUpdate(user._id, {
                        referal_profit: Number(user.referal_profit) + Number(reward_size),
                        refs1: refs1
                    }, function(err, newUser) {
                            if(err) throw new Error(err);
                            
                        //alert("updated out user: " + newUser);
                    });
               } else if(ref1.active && ref1.upgrades > 1 && ref1.paid_three == false && help.tillDate(ref1.reward_date_three) <= 0){ //награда за 3 депозит
                    
                    var reward_size = Number(ref1.balance_three) * Number(ref1.percent_three) / 100;
                    ref1.paid_three = true;
                    
                    User.findByIdAndUpdate(user._id, {
                        referal_profit: Number(user.referal_profit) + Number(reward_size),
                        refs1: refs1
                    }, function(err, newUser) {
                            if(err) throw new Error(err);
                            
                        //alert("updated out user: " + newUser);
                    });
               }
                
            });
            
            
            var refs2 = user.refs2; //ищем выплаты для рефералов первого уровня
            refs2.forEach(function(ref2){ 
               
               if(ref2.active && ref2.paid == false && help.tillDate(ref2.reward_date) <= 0){ //награда за первый депозит
                    
                    var reward_size = Number(ref2.balance) * Number(ref2.percent) / 100;
                    ref2.paid = true;
                    
                    User.findByIdAndUpdate(user._id, {
                        referal_profit: Number(user.referal_profit) + Number(reward_size),
                        refs2: refs2
                    }, function(err, newUser) {
                            if(err) throw new Error(err);
                            
                        //alert("updated out user: " + newUser);
                    });
               } else if(ref2.active && ref2.upgrades > 0 && ref2.paid_two == false && help.tillDate(ref2.reward_date_two) <= 0){ //награда за 2 депозит
                    
                    var reward_size = Number(ref2.balance_two) * Number(ref2.percent_two) / 100;
                    ref2.paid_two = true;
                    
                    User.findByIdAndUpdate(user._id, {
                        referal_profit: Number(user.referal_profit) + Number(reward_size),
                        refs2: refs2
                    }, function(err, newUser) {
                            if(err) throw new Error(err);
                            
                        //alert("updated out user: " + newUser);
                    });
               } else if(ref2.active && ref2.upgrades > 1 && ref2.paid_three == false && help.tillDate(ref2.reward_date_three) <= 0){ //награда за 3 депозит
                    
                    var reward_size = Number(ref2.balance_three) * Number(ref2.percent_three) / 100;
                    ref2.paid_three = true;
                    
                    User.findByIdAndUpdate(user._id, {
                        referal_profit: Number(user.referal_profit) + Number(reward_size),
                        refs2: refs2
                    }, function(err, newUser) {
                            if(err) throw new Error(err);
                            
                        //alert("updated out user: " + newUser);
                    });
               }
                
            });
            
            
            
        });
   });
   
