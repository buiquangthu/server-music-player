const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const register = asyncHandler(async (req, res) => {

    const { userName, email, passWord } = req.body;
    const checkEmail = await UserModel.findOne({ email });

    const getJsonWebToken = async (email, id) => {
        const payload = {
            email,
            id,
        };
        const token = jwt.sign(payload, process.env.SECRET_KEY, {
            expiresIn: '1h',
        });
        return token;
    }

    if (checkEmail) {

        res.status(401)
        throw new Error('Email already exists');
    }

    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(passWord, salt);

    console.log(hashPassword)
    const newUser = new UserModel({
        userName,
        email,
        passWord: hashPassword,
    });
    await newUser.save();

    res.status(200).json({
        message: 'Register successfully',
        data: {
            ...newUser,
            accessToken: await  getJsonWebToken(email, newUser.id)
        }
    })
    
})

module.exports = { register };