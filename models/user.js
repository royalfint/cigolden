var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    confirmed: Number,
    email: String,
    status: Number,
    balance: Number,
    firstname: String,
    lastname: String,
    docs: String,
    phone: Number,
    net_profit: Number,
    deposit_percent: Number,
    deposit_date: Date,
    next_payment: Date,
    widthdrawal_date: Date,
    exit_date: Date,
    signup_date: Date,
    referal_profit: Number,
    referal: String,
    refs1_percent: Number,
    refs1: [{
        username: String,
        active: Boolean,
        deposit_date: Date,
        balance: Number,
        percent: Number,
        reward_date: Date,
        paid: Boolean
    }],
    refs2_percent: Number,
    refs2: [{
        username: String,
        active: Boolean,
        deposit_date: Date,
        balance: Number,
        percent: Number,
        reward_date: Date,
        paid: Boolean
    }]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);