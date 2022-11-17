const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');     // addidng passport local mongoose to the model.It automaticallly adds a username and a password to the model, which is passport default function while doing authentication.

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});
UserSchema.plugin(passportLocalMongoose);  //By pluggin in the passportLocalMongoose we are adding the username hash and salt to the model which comes as a default in passport.


module.exports = mongoose.model('User', UserSchema);