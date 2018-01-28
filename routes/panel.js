var express = require("express"),
    app = express.Router(),
    User = require("../models/user"),
    help = require("./helpful");
    
app.get("/wallet", help.isLoggedIn, function(req, res) {
    User.find({_id: req.user.id}, function(err, users){
        if(err)
            console.log(err);
        //calcing future profit
        var lefttillpayment=help.tillDate(users[0].next_payment);
        var future_profit = (users[0].balance + users[0].net_profit) * (users[0].deposit_percent / 100);
        res.render("panel/wallet", {user: users[0], daystillpayment: lefttillpayment, next_profit: future_profit});
    });
});

app.get("/refs1/:num", help.isLoggedIn, function(req, res) {
    var page = 0; //getting suggested page
    if(req.params.num && req.params.num > 0) {
        page = Number(req.params.num) * 10;
    }
    User.count({referal: req.user.id}, function(err, count) { //getting pages count
        if(err)
            console.log(err);

        User.findById(req.user.id, function(err, user){ //passing current page users and total count
            if(err){
                console.log(err);
            }
            res.render("panel/referals1", {user: user, pages: count / 10});
        }).skip(page).limit(10);
    });
});

app.get("/refs2/:num", help.isLoggedIn, function(req, res) {
    var page = 0; //getting suggested page
    if(req.params.num && req.params.num > 0) {
        page = Number(req.params.num) * 10;
    }
    User.count({referal: req.user.id}, function(err, count) { //getting pages count
        if(err)
            console.log(err);

        User.findById(req.user.id, function(err, user){ //passing current page users and total count
            if(err){
                console.log(err);
            }
            res.render("panel/refs2", {user: user, pages: count / 10});
        }).skip(page).limit(10);
    });
});

app.get("/refs1/user/:id", help.isLoggedIn, function(req, res){
    User.findById(req.user.id, function(err, user){ //req.params.id
        if(err) console.log(err);
        
        user.refs1.forEach(function(referals1lvl){
            console.log(referals1lvl.id + " ]] " + req.params.id);
            if(String(referals1lvl.id) === String(req.params.id)){
                var rdate = help.tillDate(referals1lvl.reward_date);
                var reward_size = Number(referals1lvl.balance) * Number(referals1lvl.percent) / 100;
                res.render("panel/refs_user", {user: referals1lvl, reward_date: rdate, reward: reward_size});
            }
        });
    });
});

app.get("/refs2/user/:id", help.isLoggedIn, function(req, res){
    User.findById(req.user.id, function(err, user){ //req.params.id
        if(err) console.log(err);
        
        user.refs2.forEach(function(referals2lvl){
            if(String(referals2lvl.id) === String(req.params.id)){
                var rdate = help.tillDate(referals2lvl.reward_date);
                var reward_size = Number(referals2lvl.balance) * Number(referals2lvl.percent) / 100;
                res.render("panel/refs_user2", {user: referals2lvl, reward_date: rdate, reward: reward_size});
            }
        });
    });
});


app.get("/refs1", help.isLoggedIn, function(req, res){
   res.redirect("panel/refs1/0");
});

app.get("/refs2", help.isLoggedIn, function(req, res){
   res.redirect("panel/refs2/0");
});

app.get("/withdrawal", help.isLoggedIn, function(req, res){
    User.findById({_id: req.user.id}, function(err, user){
        if(err)
            console.log(err);
        
        var available_funds = 0;
        
        console.log("До выдачи профита дней" + help.tillDate(user.widthdrawal_date));
        console.log("До выдачи баланса дней" + help.tillDate(user.exit_date));
        
    
        res.render("panel/withdrawal", {user: user, available_funds: available_funds});
    });
});

module.exports = app;