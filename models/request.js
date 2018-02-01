var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var RequestSchema = new mongoose.Schema({
    username: String,
    amount: Number,
    method: String,
    email: String,
    firstname: String,
    lastname: String,
    docs: String,
    phone: String,
    date: Date,
    paid: Boolean,
    card: String
});

RequestSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Request", RequestSchema);