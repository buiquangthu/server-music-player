const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();


const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
        user: process.env.USERNAME_EMAIL,
        pass: process.env.PASSWORD_EMAIL,
    },
});


const handlerSendEmail = async (val, email) => {

    try {
        await transporter.sendMail({
            from: `"Support MusicPlayer" <${process.env.USERNAME_EMAIL}>`, // sender address
            to: email, // list of receivers
            subject: "Xác minh email", // Subject line
            text: "Mã xác minh của bạn", // plain text body
            html: `<h1>${val}</h1>`, // html body
        });

    } catch (error) {
        console.log(error)
    }
}

const handlerSendEmailForgotPassword = async (val, email) => {
    try {
        await transporter.sendMail({
            from: `"Support MusicPlayer" <${process.env.USERNAME_EMAIL}>`, // sender address
            to: email,
            subject: "Đặt lại mật khẩu",
            text: "Mật khẩu mới",
            html: `<h1>${val}</h1>`
        });
    } catch (error) {
        console.log(error)
    }
}


const verification = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const verificationCode = Math.round(1000 + Math.random() * 9000);
    console.log(verificationCode)

    try {
        await handlerSendEmail(verificationCode, email);
        res.status(200).json({
            message: 'Gửi Email thành công',
            data: {
                code: verificationCode
            }
        })
    } catch (error) {
        res.status(401)
        throw new Error('Không thể gửi Email')
    }
})



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

const register = asyncHandler(async (req, res) => {

    const { userName, email, passWord } = req.body;
    const checkEmail = await UserModel.findOne({ email });


    if (checkEmail) {

        res.status(401)
        throw new Error('Email đã tồn tại');
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
            userName: newUser.userName,
            id: newUser.id,
            accessToken: await getJsonWebToken(email, newUser.id)
        }
    })

});

const login = asyncHandler(async (req, res) => {
    const { email, passWord } = req.body;


    // console.log(email)
    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
        res.status(403)
        throw new Error('Người dùng không tồn tại')
    }
    const isMatchPassword = await bcrypt.compare(passWord, existingUser.passWord);
    // console.log(isMatchPassword)
    if (!isMatchPassword) {
        res.status(403).json({
            message: "Tài khoản hoặc mật khẩu không chính xác"
        });
    }

    res.status(200).json({
        message: 'Đăng nhập thành công',
        data: {
            id: existingUser.id,
            email: existingUser.email,
            accessToken: await getJsonWebToken(email, existingUser.id)
        }
    });
});

const generateRandomPasswoerd = (length) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength)
        result += characters[randomIndex]
    }
    return result;
}

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const randomPassword = generateRandomPasswoerd(8);
    console.log(randomPassword)

    const user = await UserModel.findOne({ email });
    if (user) {
        const salt = await bcrypt.genSalt(10);

        const hashPassword = await bcrypt.hash(`${randomPassword}`, salt);
        await UserModel.findByIdAndUpdate(
            user._id,
            {
                passWord: hashPassword,
                isChangePassword: true
            }
        ).then(() =>{
            console.log('Xong')
        }).catch((error) => {
            console.log(error)
        })
        await handlerSendEmailForgotPassword(randomPassword, email).then(() => {
            res.status(200).json({
                message: 'Đã gửi mật khẩu mới',
                data: []
            })
        }).catch((error) => {
            res.status(401)
            throw new Error('Không thể gửi mật khẩu mới')
        })

    } else {
        res.status(401)
        throw new Error('Người dùng không tồn tại')
    }




})


module.exports = { register, login, verification, forgotPassword };