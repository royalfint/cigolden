var express = require("express"),
    app = express.Router(),
    User = require("../models/user"),
    Request = require("../models/request"),
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

app.get("/bonus", help.isLoggedIn, function(req, res) {
    User.findById(req.user.id, function(err, user){
        if(err) console.log(err);
        
        res.render("panel/bonus", {user: user, refered: user.refs1.length});
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
        
        if(help.tillDate(user.widthdrawal_date) <= 0){
            available_funds += user.net_profit;
        }
        if(help.tillDate(user.exit_date) <= 0){
            available_funds += user.balance;
        }
        
        res.render("panel/withdrawal", {user: user, available_funds: available_funds});
    });
});

app.post("/withdrawal", help.isLoggedIn, function(req, res){
    User.findById({_id: req.user.id}, function(err, user){
        if(err)
            console.log(err);
        
        /* counting funds */
        var available_funds = 0;
        
        if(help.tillDate(user.widthdrawal_date) <= 0){
            available_funds += user.net_profit;
        }
        if(help.tillDate(user.exit_date) <= 0){
            available_funds += user.balance;
        }
        
        /* requesting */
        if(req.body.method == "card") {
            if(req.body.card && req.body.card.length > 0 &&
            req.body.withdraw && req.body.withdraw.length > 0 && 
            req.body.withdraw > 0){
                if( Number(req.body.withdraw) <= Number(available_funds)){
                        Request.create({
                            username: user.username,
                            email: user.email,
                            amount: req.body.withdraw,
                            date: new Date(),
                            method: "card",
                            card: req.body.card,
                            paid: false,
                            firstname: user.firstname,
                            lastname: user.lastname,
                            docs: user.docs,
                            phone: user.phone
                        }, function(err, requ){
                            if(err) console.log(err);
                            
                            req.flash("success", "Заявка успешно отправлена!");
                            res.redirect("/withdrawal");
                        });
                }else{
                    req.flash("error", "Недостаточно средств!");
                    res.redirect("/withdrawal");
                }
            } else {
                req.flash("error", "Введите номер карты и сумму!");
                res.redirect("/withdrawal");
            }
        } else if(req.body.method == "cash"){
            if(req.body.withdraw && req.body.withdraw.length && req.body.withdraw > 0){
                if(Number(req.body.withdraw) <= Number(available_funds)){
                    Request.create({
                        username: user.username,
                        email: user.email,
                        amount: req.body.withdraw,
                        date: new Date(),
                        method: "cash",
                        card: "",
                        paid: false,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        docs: user.docs,
                        phone: user.phone
                    }, function(err, requ){
                        if(err) console.log(err);
                        
                        req.flash("success", "Заявка успешно отправлена!");
                        res.redirect("/withdrawal");
                    });
                }else{
                    req.flash("error", "Недостаточно средств!");
                    res.redirect("/withdrawal");
                }
            } else {
                req.flash("error", "Введите сумму!");
                res.redirect("/withdrawal");
            }
        } else {
            req.flash("error", "Неправильный метод вывода!");
            res.redirect("/withdrawal");
        }
    });
});

module.exports = app;