var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
    username: String,
    password: String,
    confirmed: Number,
    email: String,
    status: Number,
    balance: Number,
    balance_two: Number,
    balance_three: Number,
    firstname: String,
    lastname: String,
    every: Number,
    docs: String,
    phone: Number,
    net_profit: Number,
    net_profit_two: Number,
    net_profit_three: Number,
    deposit_percent: Number,
    deposit_percent_two: Number,
    deposit_percent_three: Number,
    deposit_back: Number,
    deposit_back_two: Number,
    deposit_back_three: Number,
    deposit_date: Date,
    deposit_date_two: Date,
    deposite_date_three: Date,
    next_payment: Date,
    next_payment_two: Date,
    next_payment_three: Date,
    widthdrawal_date: Date,
    widthdrawal_date_two: Date,
    widthdrawal_date_three: Date,
    exit_date: Date,
    exit_date_two: Date,
    exit_date_three: Date,
    signup_date: Date,
    referal_profit: Number,
    referal: String,
    upgrades: Number,
    refs1_percent: Number,
    refs1: [{
        username: String,
        active: Boolean,
        upgrades: Number,
        deposit_date: Date,
        deposit_date_two: Date,
        deposit_date_three: Date,
        balance: Number,
        balance_two: Number,
        balance_three: Number,
        percent: Number,
        percent_two: Number,
        percent_three: Number,
        reward_date: Date,
        reward_date_two: Date,
        reward_date_three: Date,
        paid: Boolean,
        paid_two: Boolean,
        paid_three: Boolean
    }],
    refs2_percent: Number,
    refs2: [{
        username: String,
        active: Boolean,
        upgrades: Number,
        deposit_date: Date,
        deposit_date_two: Date,
        deposit_date_three: Date,
        balance: Number,
        balance_two: Number,
        balance_three: Number,
        percent: Number,
        percent_two: Number,
        percent_three: Number,
        reward_date: Date,
        reward_date_two: Date,
        reward_date_three: Date,
        paid: Boolean,
        paid_two: Boolean,
        paid_three: Boolean
    }]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);