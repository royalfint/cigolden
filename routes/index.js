var express = require("express"),
    app = express.Router(),
    passport = require("passport"),
    User = require("../models/user"),
    help = require("./helpful"),
    ObjectID = require('mongodb').ObjectID,
    sgMail = require('@sendgrid/mail');
    
var api_key = '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';

app.get("/", function(req, res) {
   res.render("landing");
});

app.get("/login", function(req, res) {
    res.render("login", { login_errors: req.session.messages, req: req});
});

app.get("/signedup", function(req, res) {
    var passedVariable = req.query.email;
    
    sgMail.setApiKey(api_key);
    const msg = {
      to: passedVariable,
      from: 'no-reply@cigolden.com',
      subject: 'Подтверждение аккаунта',
      html: 'Пройдите по ссылке для подтверждения вашего почтового адреса: <a href="' + res.locals.siteurl +'/confirming/' + help.encrypt(passedVariable) + '">Нажмите здесь.</a>',
    };
    sgMail.send(msg);
    
    res.render("signedup");
});

//продолжение регистрации
app.post("/signupnext", function(req, res){
    if(req.body.userid && req.body.userid.length > 0){
        var useremail = help.decrypt(req.body.userid);
        if(req.body.firstname && req.body.firstname.length > 0){
            if(req.body.lastname && req.body.lastname.length > 0){
                if(req.body.docs && req.body.docs.length == 12){
                    if(req.body.phone && help.checkPhone(req.body.phone)){
                        User.find({email: useremail}, function(err, newUser){
                            if(err) console.log(err);
                            
                            console.log("newUser: "+newUser)
                            if(newUser[0]){
                                User.findByIdAndUpdate(newUser[0].id, {
                                    firstname: req.body.firstname,
                                    lastname: req.body.lastname,
                                    docs: req.body.docs,
                                    phone: req.body.phone,
                                    confirmed: 2
                                }, function(err, altUser){
                                    if(err) console.log(err);
                                    
                                    console.log("altUser: "+altUser);
                                    res.redirect("/wallet");
                                });
                            }else{
                                req.flash("error", "Нет пользователя с таким email!");
                                res.redirect("back");
                            }
                        });
                    } else{
                        req.flash("error", "Введите ваш сотовый верно!");
                        res.redirect("back");
                    }
                } else {
                    req.flash("error", "Введите ваш ИИН верно!");
                    res.redirect("back");
                }
            } else {
                req.flash("error", "Введите вашу фамилию!");
                res.redirect("back");
            }
        } else {
            req.flash("error", "Введите ваше имя!");
            res.redirect("back");
        }
    } else {
        req.flash("error", "Ошибка ID при регистрации.");
        res.redirect("back");
    }
});

app.get("/confirming/:id", function(req, res) {
    var useremail = help.decrypt(req.params.id);
    console.log(useremail);
    User.find({email: useremail}, function(err, foundUser){
        console.log("user with the email: " + foundUser);
        if(foundUser){
            if(foundUser[0].confirmed == 0){
                User.findByIdAndUpdate(foundUser[0].id, {confirmed: 1}, function(err, confUser){
                   if(err) console.log(err);
                   
                   res.redirect("/fullsignup?userid=" + req.params.id);
                });
            }else if(foundUser[0].confirmed == 1){
                res.redirect("/fullsignup?userid=" + req.params.id);
            }
        } else {
            console.log("no user with such email");
        }
    });
});

app.get("/fullsignup", function(req, res) {
    if(req.query.userid){
        res.render("fullsignup", {userid: req.query.userid});
    }
    else{
        req.flash("error", "Неправильный ID при регистрации.")
        res.redirect("back");
    } //TODO make confirm 1 when confirm 1 unavailable
});

app.post("/login", help.tolowercase, passport.authenticate("local", {
        successRedirect: "/wallet",
        failureRedirect: "/login",
        failureMessage: "Неверный логин или пароль"
    }), function(req, res){
});

app.get("/signup", function(req, res) {
    res.render("signup");
});

app.post("/signup", help.tolowercase, function(req, res) {
    if(req.body.email){
        if(!help.validateEmail(req.body.email)){
            req.flash("error", "Введите правильный email!");
            return res.redirect("back");
        } else {
             User.find({email: req.body.email}, function(err, anotherUser){
                 if (err) console.log(err);
                 
               if(anotherUser && anotherUser.length > 0){
                   req.flash("error", "Данный email уже используется!");
                   return res.redirect("back");
               } else {
                    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
                       if(err) {
                           req.flash("error", err.message); //TODO add email erorr! and double pass field
                           res.redirect("/signup");
                       }
                        passport.authenticate("local")(req, res, function(){
                           User.find({ _id: req.user.id }, function(err, _users) {
                                if(err) {
                                    console.log(err);
                                    res.redirect("back");
                                } else {
                                    if(req.session.referal){
                                        console.log("Кто нас пригласил: "+req.session.referal);
                                        User.findById(new ObjectID(req.session.referal), function(err, refUser){// TODO check if referrer exists
                                           if(err) console.log(err);
                                               var newRefs1 = refUser.refs1;
                                               newRefs1.push({
                                                    username: req.user.username,
                                                    active: false,
                                                    paid: false,
                                                    balance: 0,
                                                    percent: refUser.refs1_percent,
                                                    reward_date: 0,
                                                    deposit_date: 0
                                               });
                                               User.findByIdAndUpdate(new ObjectID(req.session.referal), {refs1: newRefs1}, function(err, newUser) {
                                                  if(err) console.log(err); // Добавились в список реферов 1 уровны
                                                  
                                                    if(newUser.referal && newUser.referal.length > 0){ //Если у пригласителя есть пригласитель
                                                        console.log("Кто пригласил пригласитля: "+newUser.referal);
                                                        User.findById(newUser.referal, function(err, secondUser){
                                                           if(err) console.log(err);
                                                               var newRefs2 = secondUser.refs2;
                                                               newRefs2.push({
                                                                    username: req.user.username,
                                                                    active: false,
                                                                    paid: false,
                                                                    balance: 0,
                                                                    percent: secondUser.refs2_percent,
                                                                    reward_date: 0,
                                                                    deposit_date: 0
                                                               });
                                                               User.findByIdAndUpdate(newUser.referal, {refs2: newRefs2}, function(err, newSecUser) {
                                                                  if(err) console.log(err); // Добавились в список реферов 1 уровны
                                                               });
                                                        });
                                                    } else {
                                                        console.log("У пригласителя нету пригласителя!");
                                                    }
                                               });
                                        });
                                    }
                                    
                                    var ourreferal = "";
                                    if(req.session.referal)
                                        ourreferal = req.session.referal;
                                    User.findByIdAndUpdate(req.user.id, {
                                        email: help.tolowercasef(req.body.email),
                                        confirmed: 0,
                                        balance: 0,
                                        status: 0,
                                        net_profit: 0,
                                        referal_profit: 0,
                                        deposit_percent: 0,
                                        upgrades: 0,
                                        refs1_percent: 0,
                                        referal: ourreferal,
                                        refs2_percent: 0,
                                        signup_date: Date(new Date())
                                    }, function(err, newUser){
                                        if(err) {
                                            console.log(err);
                                            res.redirect("back");
                                        } else {
                                            //updated our email!!!
                                            res.redirect("/signedup?email="+req.body.email);
                                        }
                                    });
                                }
                            });
                       });
                    });
               }
            });   
        }
    }else{
        req.flash("error", "Введите ваш email!");
        return res.redirect("back");
    }
});

app.post("/contact", function(req, res) {
    if(req.body.email && req.body.email.length > 0){
        if(req.body.thread && req.body.thread.length > 0) {
            if(req.body.message && req.body.message.length > 0) {
                sgMail.setApiKey(api_key);
                const msg = {
                  to: res.locals.adminemail,
                  from: req.body.email,
                  subject: req.body.thread,
                  html: req.body.message
                };
                sgMail.send(msg);
            } else {
                req.flash("error", "Введите сообщение!");
                res.redirect("back");
            }
        } else {
            req.flash("error", "Введите тему!");
            res.redirect("back");
        }
    }
    else {
        req.flash("error", "Введите email!");
        res.redirect("back");
    }
    
    res.redirect("back");
});

app.get("/logout", function(req, res){
    res.locals.status = 0;
    req.logout();
    res.redirect("/");
});

app.get("/r/:id", function(req, res){
    req.session.referal = req.params.id;
    res.redirect("/");
});

// TEST
/*
app.get("/test", function(req, res){
    User.find({username: "royalfint"}, function(err, gotUsers){
        if(err) console.log(err);
        
        User.findByIdAndUpdate(gotUsers[0]._id, {
            next_payment: new Date()
        }, function(err, newUser){
            if(err) console.log(err);
            res.send("done!");
        });
    });
    var logf = "";
    
    User.find({}, function(err, users){
       users.forEach(function(user){
            var email = help.tolowercasef(user.email);
           // console.log(email);
            User.findByIdAndUpdate(user.id, { }, function(err, newUser){
                console.log(newUser.email);
            });
       });
    });
    
    res.send(logf);
});*/

app.get("/addref", function(req, res) {
   res.render("addref");
});

app.post("/addref", function(req, res) {
    
});

/*
app.get("/check", function(req, res){
   User.find({}, function(err, users){
        if(err)
            console.log(err);
        users.forEach(function(user){
           if(help.tillDate(user.next_payment) > 0){
               console.log("Days left " + help.tillDate(user.next_payment) + " for user " + user.username);
            } else {
                //pay the guy
                var future_profit = (user.balance + user.net_profit) * (user.deposit_percent / 100);
                User.findByIdAndUpdate(user._id, {
                    net_profit: Number(user.net_profit) + Number(future_profit),
                    next_payment: help.daysToDate(new Date(), 31)
                }, function(err, newUser) {
                        if(err) console.log(err);
                });
            } 
        });
   });
   res.send("finished with the data");
});
*/
module.exports = app;