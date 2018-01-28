var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");

var RequestSchema = new mongoose.Schema({
    username: String,
    confirmed: Number,
    email: String,
});

RequestSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Request", RequestSchema);