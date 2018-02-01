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
                if(user.deposit_percent > 0 && user.balance == 0) { //делаем первый депозит
                    
                    User.findById(userid, function(err, payingUser){ //ищем пользователя чтобы глянуть кто пригласил
                       if(payingUser.referal && payingUser.referal != "") {
                           console.log("кто пригласил: " + payingUser.referal);
                           User.findById(new ObjectID(payingUser.referal), function(err, gotUser){
                                //НАГРАЖДЕМ ПРИГЛАСИТЕЛЯ 2 УР!!!
                                console.log(gotUser.referal);
                                if(gotUser.referal && gotUser.referal.length > 0){
                                    User.findById(new ObjectID(gotUser.referal), function(err, secondUser){ //ищем пользователя чтобы глянуть кто пригласил пригласителя
                                        console.log("кто пригласил пригласителя: " + gotUser.referal);
                                        
                                        var list = secondUser.refs2;
                                        list.forEach(function(mofi){
                                            if(String(mofi.username) == String(user.username)){
                                                mofi.active = true;
                                                mofi.deposit_date = new Date();
                                                mofi.balance = Number(req.body.amount);
                                                mofi.reward_date = help.daysToDate(new Date(), 31);
                                            }
                                        });
                                        console.log("new refs: "+ list);
                                        User.findByIdAndUpdate(new ObjectID(gotUser.referal), {refs2: list} , function(err, reward2User){
                                        }); //наградили пригласителя 2 уровня
                                    });
                                }
                                   
                                var list = gotUser.refs1;
                                list.forEach(function(mofi){
                                    if(String(mofi.username) == String(user.username)){
                                        mofi.active = true;
                                        mofi.deposit_date = new Date();
                                        mofi.balance = Number(req.body.amount);
                                        mofi.reward_date = help.daysToDate(new Date(), 31);
                                    }
                                });
                                console.log("new refs: "+ list);
                               User.findByIdAndUpdate(new ObjectID(payingUser.referal), {refs1: list} , function(err, rewardUser){
                                   console.log("Наградили пригласителя 1го уровня");
                               }); //наградили пригласителя 1 уровня
                           });
                       } else 
                        console.log("no referrer!");
                    });

                    User.findByIdAndUpdate(userid, { //making an investment
                        balance: Number(req.body.amount) + Number(user.balance),
                        deposit_date: new Date(),
                        next_payment: help.daysToDate(new Date(), 31),
                        widthdrawal_date: help.daysToDate(new Date(), 93),
                        exit_date: help.daysToDate(new Date(), 186)
                    }, function(err, newUser){
                        if(err)
                        //TODO CAlculate previous profit
                            console.log(err);
                            
                            req.flash("success", "Баланс успешно обновлен!");
                            res.redirect("back");
                    }); 
                } else if(user.deposit_percent > 0 && user.balance > 0){ //если это доливка а не первый депозит
                    User.findById(userid, function(err, ourUser){
                        if(err) console.log(err);
                   
                        //текущая прибыль
                        var next_profit = (Number(ourUser.balance) + Number(ourUser.net_profit)) * (Number(ourUser.deposit_percent) / 100);
                        console.log("След прибыль: " + next_profit);
                        var daysToPaying = help.tillDate(ourUser.next_payment);
                        console.log("Дней до след прибыли: "+ daysToPaying);
                        var cur_profit = Number(next_profit) / 31 * (31 - Number(daysToPaying));
                        console.log("Итого нам заплатят: " + cur_profit);
                        User.findByIdAndUpdate(userid, {
                            net_profit: Number(ourUser.net_profit) + Number(cur_profit),
                            balance: Number(ourUser.balance) + Number(req.body.amount),
                            deposit_date: new Date(),
                            next_payment: help.daysToDate(new Date(), 31),
                            widthdrawal_date: help.daysToDate(new Date(), 93),
                            exit_date: help.daysToDate(new Date(), 186)
                        }, function(err, newUser){
                            if (err) console.log(err);
                           
                            req.flash("success", "Баланс успешно обновлен!!");
                            res.redirect("back");
                        });
                    });
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
            User.findByIdAndUpdate(userid, {deposit_percent: req.body.percent}, function(err, newUser){
                if(err)
                    console.log();
                    
                req.flash("success", "Процент успешно обновлен!");
                res.redirect("back");
            });
       };
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
                  var newProfitNum = Number(gotUser[0].net_profit) - Number(req.body.amount);
                  var newBalanceNum = Number(gotUser[0].balance);
                  if( newBalanceNum < 0) {
                      newBalanceNum += newProfitNum;
                  }
                  User.findByIdAndUpdate(gotUser[0].id, { net_profit: newProfitNum, balance: newBalanceNum}, function(err, newBalancedUser) {
                      console.log("User with the new balance: " + newBalancedUser);
                      res.redirect("/admin/requests");
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
        //calcing future profit
        var next_profit = (users[0].balance + users[0].net_profit) * (users[0].deposit_percent / 100);
        res.render("admin/user", {user: users[0], future_profit: next_profit, userhash: foruserhash});
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