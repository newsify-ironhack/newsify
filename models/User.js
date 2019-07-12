const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        // required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String
    },
    img: {
        type: String,
        // default: 
    },
    news: {
        type: [{ type: Schema.Types.ObjectId, ref: 'New' }]
    },
    following: {
        type: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    }
})

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8));
}

userSchema.methods.validatePassword = function(password) {
    if(!this.password) {
        return false;
    }

    return bcrypt.compareSync(password, this.password)
}

module.exports = mongoose.model('User', userSchema)
