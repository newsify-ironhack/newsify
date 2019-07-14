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
        type: [{ type: Schema.Types.ObjectId, ref: 'New' }],
        qty: {
            type: Number,
            default: 0
        }
    },
    following: {
        type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        qty: {
            type: Number,
            default: 0
        }
    },
    linkedin: {
        type: Boolean,
        default: false
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
