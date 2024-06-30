const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
    },
    passWord:{
        type: String,
        required: true,
    },
    avatar:{
        type: String,
    },
    createAt:{
        type: Date,
        default: Date.now,
    },
    updateAt:{
        type: Date,
        default: Date.now,
    }
});

const UserModel = mongoose.model('Users', userSchema);
module.exports = UserModel;