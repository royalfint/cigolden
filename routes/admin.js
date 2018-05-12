var express = require("express"),
    app = express.Router(),
    User = require("../models/user"),
    Request = require("../models/request"),
    help = require("./helpful"),
    ObjectID = require('mongodb').ObjectID;

//admin panel user actions
app.post("/admin/action/:action", help.isAdmin, function(req, res) {
    if(req.params.action=="balance"){ //adding balance
        if(req.body.amount && req.body.amount > 0 && req.body.hash.length > 0){
            var userid = help.decrypt(req.body.hash);
            User.findById(userid, function(err, user){ //user we add balance to
                if(err)
                    console.log(err);
                    
                if(user && user.deposit_percent > 0) { //делаем депозит
                    if(user.referal && user.referal != "") {
                        console.log("кто пригласил: " + user.referal);
                        User.findById(new ObjectID(user.referal), function(err, gotUser){ //ищем пригласившего
                            //НАГРАЖДЕМ ПРИГЛАСИТЕЛЯ 2 УР!!!
                            console.log("кто пригласил пригласителя" + gotUser.referal);
                            if(gotUser.referal && gotUser.referal.length > 0){
                                User.findById(new ObjectID(gotUser.referal), function(err, secondUser){ //ищем кто пригласил пригласителя
                                    console.log("кто пригласил пригласителя: " + gotUser.referal);
                                    
                                    var list = secondUser.refs2;
                                    list.forEach(function(mofi){
                                        if(String(mofi.username) == String(user.username)){
                                            //АКЦИЯ получи награду за реферал сегодня help.daysToDate(new Date(), 31);
                                            if(user.upgrades == 0 && user.balance == 0){ //первый депозит
                                                mofi.active = true;
                                                mofi.upgrades = 0,
                                                mofi.deposit_date = new Date();
                                                mofi.balance = Number(req.body.amount);
                                                mofi.paid = false,
                                                mofi.percent = secondUser.refs2_percent,
                                                mofi.reward_date = new Date();        
                                            } else if(user.balance > 0 && user.upgrades == 0) { //уже второй
                                                mofi.active = true;
                                                mofi.upgrades = 1,
                                                mofi.paid_two = false,
                                                mofi.percent_two = secondUser.refs2_percent,
                                                mofi.deposit_date_two = new Date();
                                                mofi.balance_two = Number(req.body.amount);
                                                mofi.reward_date_two = new Date();  
                                            } else if (user.balance > 0 && user.upgrades == 1){ //уже третий
                                                mofi.active = true;
                                                mofi.upgrades = 2,
                                                mofi.paid_three = false,
                                                mofi.percent_three = secondUser.refs2_percent,
                                                mofi.deposit_date_three = new Date();
                                                mofi.balance_three = Number(req.body.amount);
                                                mofi.reward_date_three = new Date();  
                                            }
                                        }
                                    });
                                    console.log("new refs: "+ list);
                                    User.findByIdAndUpdate(new ObjectID(gotUser.referal), {refs2: list} , function(err, reward2User){
                                    }); //наградили пригласителя 2 уровня
                                });
                            } else 
                                console.log("У пригласителя нету пригласителя");
                              
                            //НАГРАЖДЕМ ПРИГЛАСИТЕЛЯ 1 уровня!!!
                            var list = gotUser.refs1;
                            list.forEach(function(mofi){
                                if(String(mofi.username) == String(user.username)){
                                    //АКЦИЯ получи награду за реферал сегодня help.daysToDate(new Date(), 31);
                                    if(user.upgrades == 0 && user.balance == 0){ //первый депозит
                                        mofi.active = true;
                                        mofi.upgrades = 0,
                                        mofi.paid = false,
                                        mofi.percent = gotUser.refs1_percent,
                                        mofi.deposit_date = new Date();
                                        mofi.balance = Number(req.body.amount);
                                        mofi.reward_date = new Date();        
                                    } else if(user.balance > 0 && user.upgrades == 0) { //уже второй
                                        mofi.active = true;
                                        mofi.upgrades = 1,
                                        mofi.paid_two = false,
                                        mofi.percent_two = gotUser.refs1_percent,
                                        mofi.deposit_date_two = new Date();
                                        mofi.balance_two = Number(req.body.amount);
                                        mofi.reward_date_two = new Date();  
                                    } else if (user.balance > 0 && user.upgrades == 1){ //уже третий
                                        mofi.active = true;
                                        mofi.upgrades = 2,
                                        mofi.paid_three = false,
                                        mofi.percent_three = gotUser.refs1_percent,
                                        mofi.deposit_date_three = new Date();
                                        mofi.balance_three = Number(req.body.amount);
                                        mofi.reward_date_three = new Date();  
                                    }
                                }
                            });
                            console.log("new refs: "+ list);
                           User.findByIdAndUpdate(new ObjectID(user.referal), {refs1: list} , function(err, rewardUser){
                               console.log("Наградили пригласителя 1го уровня");
                           });
                        });
                    } else 
                        console.log("no referrer!");
                        
                    var back_percent = 0;
                    if(req.body.back && req.body.back.length > 0) {
                        back_percent = req.body.back;
                    }
                    
                    if(user.upgrades == 0 && user.balance == 0){ //первый депозит
                        User.findByIdAndUpdate(userid, {
                            balance: Number(req.body.amount),
                            upgrades: 0,
                            deposit_date: new Date(),
                            next_payment: help.daysToDate(new Date(), 31),
                            widthdrawal_date: help.daysToDate(new Date(), 93),
                            exit_date: help.daysToDate(new Date(), 186),
                            deposit_back: Number(req.body.amount) / 100 * Number(back_percent)  
                        }, function(err, newUser){
                            if(err) console.log(err);
                                
                            req.flash("success", "Баланс успешно обновлен!");
                            res.redirect("back");
                        }); 
                    } else if(user.balance > 0 && user.upgrades == 0) { //уже второй
                        User.findByIdAndUpdate(userid, {
                            upgrades: 1,
                            balance_two: Number(req.body.amount),
                            deposit_date_two: new Date(),
                            next_payment_two: help.daysToDate(new Date(), 31),
                            widthdrawal_date_two: help.daysToDate(new Date(), 93),
                            exit_date_two: help.daysToDate(new Date(), 186),
                            deposit_back_two: Number(req.body.amount) / 100 * Number(back_percent) 
                        }, function(err, newUser){
                            if(err) console.log(err);
                                
                            req.flash("success", "Баланс успешно обновлен!");
                            res.redirect("back");
                        }); 
                    } else if (user.balance > 0 && user.upgrades == 1){ //уже третий
                        User.findByIdAndUpdate(userid, {
                            upgrades: 2,
                            balance_three: Number(req.body.amount),
                            deposit_date_three: new Date(),
                            next_payment_three: help.daysToDate(new Date(), 31),
                            widthdrawal_date_three: help.daysToDate(new Date(), 93),
                            exit_date_three: help.daysToDate(new Date(), 186),
                            deposit_back_three: Number(req.body.amount) / 100 * Number(back_percent) 
                        }, function(err, newUser){
                            if(err) console.log(err);
                                
                            req.flash("success", "Баланс успешно обновлен!");
                            res.redirect("back");
                        }); 
                    } else {
                        req.flash("error", "Больше депозитов делать нельзя!");
                        res.redirect("back");
                    }
                    
                } else { //she didn't set the deposit percent
                    req.flash("error", "Сначала нужно указать процент!");
                    res.redirect("back");
                }
           });
       } else {
            req.flash("error", "Укажите значение баланса!");
            res.redirect("back");
       }
    } else if(req.params.action == "percent"){
       if(req.body.percent && req.body.percent > 0 && req.body.hash.length > 0){
            var userid = help.decrypt(req.body.hash);
           
            User.findById(userid, function(err, ourpUser){
                if(err) console.log(err);
                
                if(req.body.which == 1){ //первый депозит
                    User.findByIdAndUpdate(userid, {deposit_percent: req.body.percent}, function(err, newUser){
                        if(err) console.log();
                            
                        req.flash("success", "Процент успешно обновлен!");
                        res.redirect("back");
                    });
                } else if(req.body.which == 2) { //уже второй
                    User.findByIdAndUpdate(userid, {deposit_percent_two: req.body.percent}, function(err, newUser){
                        if(err) console.log();
                            
                        req.flash("success", "Процент успешно обновлен!");
                        res.redirect("back");
                    });
                } else if (req.body.which == 3){ //уже третий
                    User.findByIdAndUpdate(userid, {deposit_percent_three: req.body.percent}, function(err, newUser){
                        if(err) console.log();
                            
                        req.flash("success", "Процент успешно обновлен!");
                        res.redirect("back");
                    });
                } 
            });
       };
    } else if(req.params.action == "every") {
       if(req.body.every && req.body.every > 0 && req.body.hash.length > 0){
            var userid = help.decrypt(req.body.hash);
            User.findByIdAndUpdate(userid, {every: req.body.every}, function(err, newUser){
                if(err)
                    console.log();
                    
                req.flash("success", "Расписание выплат успешно обновлено!");
                res.redirect("back");
            });
       }
    } else if(req.params.action == "ref1") {
       if(req.body.percent && req.body.percent > 0 && req.body.hash.length > 0){
            var userid = help.decrypt(req.body.hash);
            User.findByIdAndUpdate(userid, {refs1_percent: req.body.percent}, function(err, newUser){
                if(err)
                    console.log();
                    
                req.flash("success", "Процент реф 1ур. успешно обновлен!");
                res.redirect("back");
            });
       }
    } else if(req.params.action == "ref2") {
       if(req.body.percent && req.body.percent > 0 && req.body.hash.length > 0){
            var userid = help.decrypt(req.body.hash);
            User.findByIdAndUpdate(userid, {refs2_percent: req.body.percent}, function(err, newUser){
                if(err)
                    console.log();
                    
                req.flash("success", "Процент реф 2ур. успешно обновлен!");
                res.redirect("back");
            });
       }
    } else if(req.params.action == "withdraw") {
       if(req.body.useremail && req.body.amount){
           Request.find({email: req.body.useremail}, function(err, gotRequests) {
              if(gotRequests) {
                  Request.findByIdAndUpdate(gotRequests[0].id, {paid: true}, function(err, newReq){
                      console.log("paid req: " + newReq);
                  });
              }
           });
           
           User.find({email: req.body.useremail}, function(err, gotUser){
              if(gotUser){
                    var newProfitNum = Number(gotUser[0].net_profit);
                    var newRefProfit = Number(gotUser[0].referal_profit);
                    var withAm = Number(req.body.amount);
                  
                    if(withAm <= newRefProfit) {
                        newRefProfit -= withAm;
                    } else if (withAm > newRefProfit){
                        withAm -= newRefProfit;
                        newRefProfit = 0;
                        newProfitNum -= withAm;
                    }
                  
                    var newBalanceNum = Number(gotUser[0].balance); // не помню зачем это еще нужно
                    /*
                    if( newBalanceNum < 0) {
                        newBalanceNum += newProfitNum;
                    }*/
                    
                    User.findByIdAndUpdate(gotUser[0].id, { net_profit: newProfitNum, referal_profit: newRefProfit, balance: newBalanceNum}, function(err, newBalancedUser) {
                        console.log("User with the new balance: " + newBalancedUser);
                        
                        Request.find({email: req.body.useremail, amount: req.body.amount}, function(err, gotRequests) {
                          if(gotRequests) {
                              Request.findByIdAndUpdate(gotRequests[0].id, {paid: true}, function(err, newReq){
                                  console.log("paid req: " + newReq);
                                  res.redirect("/admin/requests");
                              });
                          }
                       });
                    });
                    
                    
              } 
           });
       }
    } else if (req.params.action == "bonus") {
       if(req.body.useremail){
           Request.find({email: req.body.useremail}, function(err, gotRequests) {
              if(gotRequests) {
                  Request.findByIdAndUpdate(gotRequests[0].id, {paid: true}, function(err, newReq){
                      console.log("paid req: " + newReq);
                      res.redirect("/admin/requests");
                  });
              }
           });
       }
    }
});

//Requests page
app.get("/admin/requests", help.isAdmin, function(req, res) {
    Request.find({}, function(err, gotRequests){ //passing current page users and total count
        if(err) console.log(err);
            
        res.render("admin/requests", {requests: gotRequests});
    });
});

app.get("/admin/request/:id", help.isAdmin, function(req, res) {
   Request.findById(req.params.id, function(err, reqs){
      res.render("admin/request", {request: reqs});
   });
});

//user with certain id page
app.get("/admin/user/:id", help.isAdmin, function(req, res) {
    User.find({ _id: req.params.id }, function(err, users){
        if(err)
            console.log(err);
        var foruserhash = help.encrypt(req.params.id);
        var referal = "";
        if(users[0].referal) {
            User.findById(new ObjectID(users[0].referal), function(err, ourrUser) {
                if(err) console.log(err);
                
                if(ourrUser){ referal = ourrUser.username; }
                //calcing future profit
                var next_profit = (users[0].balance + users[0].net_profit) * (users[0].deposit_percent / 100);
                res.render("admin/user", {user: users[0], future_profit: next_profit, userhash: foruserhash, referal: referal});
            });
        } else {
            //calcing future profit
            var next_profit = (users[0].balance + users[0].net_profit) * (users[0].deposit_percent / 100);
            res.render("admin/user", {user: users[0], future_profit: next_profit, userhash: foruserhash, referal: referal});
        }
    });
});

//user list page
app.get("/admin/users/:num", help.isAdmin, function(req, res) {
    var page = 0; //getting suggested page
    if(req.params.num && req.params.num > 0) {
        page = Number(req.params.num) * 10;
    }
    User.count({}, function(err, count) { //getting pages count
        if(err)
            console.log(err);

        User.find({}, function(err, users){ //passing current page users and total count
            if(err){
                console.log(err);
            }
            res.render("admin/users", {users: users, pages: count / 10});
        }).skip(page).limit(10);
    });
});

//user list first page redirect
app.get("/admin/users", help.isAdmin, function(req, res) {
    res.redirect("/admin/users/0");
});

//user search results page
app.post("/admin/users", help.isAdmin, function(req, res) {
    User.find({ username: req.body.search }, function(err, users){ //passing current page users and total count
        if(err){
            console.log(err);
        }
        res.render("admin/search", {users: users});
    });
});

module.exports = app;