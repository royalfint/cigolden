var express               = require('express'),
    app                   = express(),
    mongoose              = require('mongoose'),
    passport              = require('passport'),
    flash                 = require('connect-flash'),
    bodyParser            = require("body-parser"),
    User                  = require("./models/user"),
    localStrategy         = require("passport-local");
    
var adminRoutes = require("./routes/admin"),
    indexRoutes = require("./routes/index"),
    panelRoutes = require("./routes/panel");
    
//mongoose.connect("mongodb://localhost/cigolden_db");
mongoose.connect("mongodb://ciadmin:YtEpyftimVjq1Gfhjkm@ds113648.mlab.com:13648/cigolden");

app.set("view engine", "ejs");
app.use(require("express-session")({
    secret: "sjd;fljsdlUjHjl words a few of them",
    resave: false,
    saveUninitialized: false
}));
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next) {
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.level = 0;
   res.locals.success = req.flash("success");
   next();
});
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* =============
ROUTES
===============*/

app.use(indexRoutes);
app.use(adminRoutes);
app.use(panelRoutes);

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Server has started!");
});