//create mongoose user schema and model
const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose');
const Schema = mongoose.Schema

const userSchema = new Schema ({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    facebookId: String, //if only saying type, don't need to say it explicitly
    admin: {
        type: Boolean,
        default: false
    }
})

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', userSchema) //model is name User so collections will be called users, and using userSchema