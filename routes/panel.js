var express = require("express"),
    app = express.Router(),
    User = require("../models/user"),
    Request = require("../models/request"),
    passportLocalMongoose = require("passport-local-mongoose"),
    help = require("./helpful"),
    sgMail = require('@sendgrid/mail');
    
var api_key = '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';
    
app.get("/wallet", help.isLoggedIn, function(req, res) {
    User.findById(req.user.id, function(err, user){
        if(err) console.log(err);
        
        var lefttillpayment = 999; 
        var closesdayid = -1;
        
        if(user.balance > 0 && help.tillDate(user.next_payment) < lefttillpayment){
            lefttillpayment = help.tillDate(user.next_payment);
            closesdayid = 1;
        }
        
        if (user.upgrades > 0 && help.tillDate(user.next_payment_two) < lefttillpayment){
            lefttillpayment = help.tillDate(user.next_payment_two);
            closesdayid = 2;
        } 
        
        if (user.upgrades > 1  && help.tillDate(user.next_payment_three) < lefttillpayment) {
            lefttillpayment = help.tillDate(user.next_payment_three);
            closesdayid = 3;
        }
        
        var future_profit = 0;
        
        if(user.upgrades == 2)
            future_profit = ((user.balance + user.deposit_back + user.net_profit) * (user.deposit_percent / 100)) +
                ((user.balance_two + user.deposit_back_two + user.net_profit_two) * (user.deposit_percent_two / 100)) + 
                ((user.balance_three + user.deposit_back_three + user.net_profit_three) * (user.deposit_percent_three / 100));
        else if (user.upgrades == 1)
            future_profit = ((user.balance + user.deposit_back + user.net_profit) * (user.deposit_percent / 100)) +
                ((user.balance_two + user.deposit_back_two + user.net_profit_two) * (user.deposit_percent_two / 100));
        else if (user.balance > 0)
            future_profit = ((user.balance + user.deposit_back + user.net_profit) * (user.deposit_percent / 100));
            
        res.render("panel/wallet", {user: user, daystillpayment: lefttillpayment, next_profit: future_profit});
    });
});

app.get("/bonus", help.isLoggedIn, function(req, res) {
    User.findById(req.user.id, function(err, user){
        if(err) console.log(err);
        
        res.render("panel/bonus", {user: user, refered: user.refs1.length});
    });
});

app.get("/marketing", help.isUser, function(req, res) {

   res.render("marketing");
});

/* После нажатия на кнопку забыл пароль попадаем сюда*/
app.get("/reset", function(req, res){
    res.render("reset");
});

/* Форма с почтой забыл пароль отправляется сюда*/
app.post("/resetpass", function(req, res){
   if(req.body.email && req.body.email.length > 0) { //если ввели какую то почту то
       User.find({email: req.body.email}, function(err, resetttingUser){
           if(err) console.log(err);
           
           if(resetttingUser[0]){
               sgMail.setApiKey(api_key);
                const msg = {
                  to: req.body.email,
                  from: 'no-reply@cigolden.com',
                  subject: 'Сброс пароля',
                  html: 'Ваш логин: ' + resetttingUser[0].username + ' .Пройдите по ссылке для смены вашего пароля: <a href="' + res.locals.siteurl +'/resetpass/' + help.encrypt(resetttingUser[0].email) + '">Нажмите здесь.</a>',
                };
                sgMail.send(msg);
                req.flash("success", "Сообщение отправлено!");
                res.redirect("/reset");
           } else { 
               req.flash("error", "Нет пользователя с такой почтой!");
               res.redirect("/reset")
           }
       });
   } else { //если не ввели в поле ничего
       req.flash("error", "Введите ваш email!");
       res.redirect("/reset");
   }
});

/* с письма восстановления пароль пользователь попадет сюда */
app.get("/resetpass/:useremail", function(req, res){
    if(req.params.useremail && req.params.useremail.length > 0){
        res.render("resetform", {email: req.params.useremail});
    } else{
        res.send("Неправлиьная почта!");
    }
});

/* с формы выше новый пароль отправляется сюда*/
app.post("/resetnewpass", function(req, res) {
    var email = help.decrypt(req.body.email); // разшифровываем почту
    email.trim(); //чистим от пробелов
    
    if(req.body.pass1 && req.body.pass1.length > 0) {
        if(req.body.pass2 && req.body.pass2.length > 0) {
            if(String(req.body.pass2) == String(req.body.pass1)) { //если оба пароля присутствуют и сходятся
            
                User.find({email: email}, function(err, changer){ //ищем пользователя с такой почтой
                
                    if(changer[0]){ //если есть человек с такой почтой
                        User.findByUsername(changer[0].username).then(function(sanitizedUser){
                            if (sanitizedUser){
                                sanitizedUser.setPassword(req.body.pass2, function(err){
                                    if(err) console.log(err);
                                    
                                    sanitizedUser.save();
                                    req.flash("success", "Пароль успешно изменен!");
                                    res.redirect("/login");
                                });
                            }
                        },function(err){
                            console.error(err);
                        });
                    } else {
                        req.flash("error", "Нет такого пользователя!");
                        res.redirect("/settings");
                    }
                });
            }else {
               req.flash("error", "Пароли не сходятся!");
               res.redirect("/resetpass/" + req.body.email);
            }
        }else {
           req.flash("error", "Введите подтверждение!");
           res.redirect("/resetpass/" + req.body.email);
        }
   }else {
       req.flash("error", "Введите пароль!");
       res.redirect("/resetpass/" + req.body.email);
   }
});

/* форма смены пароля внутри личного кабинета */
app.post("/reset", help.isLoggedIn, function(req, res){
    if(req.body.old && req.body.old.length > 0){
        if(req.body.new && req.body.new.length > 0){
            User.findByUsername(req.user.username).then(function(sanitizedUser){
                if (sanitizedUser){
                    sanitizedUser.changePassword(req.body.old, req.body.new, function(err){
                        if(err && err.name == "IncorrectPasswordError"){
                            req.flash("error", "Неправильный текущий пароль!");
                            res.redirect("/settings");
                        } else {
                            sanitizedUser.save();
                            req.flash("success", "Пароль успешно изменен!");
                            res.redirect("/settings");
                        }
                    });
                } else {
                    req.flash("error", "Нет такого пользователя!");
                    res.redirect("/settings");
                }
            },function(err){
                console.error(err);
            });
        }else {
            req.flash("error", "Введите новый пароль!");
            res.redirect("/settings");
        }
    }else {
        req.flash("error", "Введите старый пароль!");
        res.redirect("/settings");
    }
    
});

app.get("/settings", help.isLoggedIn, function(req, res) {
    User.findById(req.user.id, function(err, user){
        if(err) console.log(err);
        
        res.render("panel/settings", {user: user});
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
                res.render("panel/refs_user", {user: referals1lvl, daystillpayment: rdate, reward: reward_size});
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
                res.render("panel/refs_user2", {user: referals2lvl, daystillpayment: rdate, reward: reward_size});
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
        
        available_funds += Number(user.referal_profit);
        
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
        
        available_funds += Number(user.referal_profit);
        
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