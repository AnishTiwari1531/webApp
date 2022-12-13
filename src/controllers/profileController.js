const profileModel = require("../models/profileModel");
const documentModel = require("../models/documentModel")
const { uploadFile } = require("../awsS3/aws");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { isName, isEmail, isPassword, isPhone, trimAndUpperCase, removeSpaces, isDocument, isValidObjectId } = require("../validators/validate");


//=============================Insert Api============================================================================================================

const insertProfile = async function (req, res) {
    try {
        let { name, email, password, phone } = req.body;
        let files = req.files;

        if (!Object.keys(req.body).length)
            return res.status(400).send({ status: false, message: "Bad Request, Please enter the details in the request body" });

        const error = {};

        if (isName(name) !== true) error.FnameError = isName(name);
        if (isEmail(email) !== true) error.emailError = isEmail(email);
        if (isPhone(phone) !== true) error.phoneError = isPhone(phone);
        if (isPassword(password) !== true) error.passwordError = isPassword(password);
        if (isDocument(files) !== true) error.filesError = isDocument(files);

        if (Object.keys(error).length > 0) return res.status(400).send({ status: false, message: { error } })
        name = trimAndUpperCase(name);
        email = removeSpaces(email);
        phone = removeSpaces(phone);

        let image = await uploadFile(files[0])

        const hash = bcrypt.hashSync(password, 10); // para1:password, para2:saltRound

        //======DB calls For Uniqueness===//
        let checkName = await profileModel.findOne({ name: name });
        if (checkName) return res.status(400).send({ status: false, message: " This Name is already used." });

        let checkEmail = await profileModel.findOne({ email: email });
        if (checkEmail) return res.status(400).send({ status: false, message: " This Email is already used." });

        const lastTenNum = phone.slice(phone.length - 10);
        let CheckPhone = await profileModel.findOne({ phone: new RegExp(lastTenNum + '$') });
        if (CheckPhone) return res.status(400).send({ status: false, message: "phone Number should be Unique " });

        //============creation==============//
        let registerUser = { name, email, password: hash, phone, image }
        let registerData = await profileModel.create(registerUser);
        return res.status(201).send({ status: true, message: "User created successfully", data: { registerData } });       //"User created successfully"
    }
    catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message });
    }
};

//=======================================Login Api==========================================================================================================

const login = async (req, res) => {
    try {
        const body = req.body;
        let { email, password } = body;

        if (!Object.keys(req.body).length)
            return res.status(400).send({ status: false, message: "Bad Request, Please enter the details in the request body" });

        const error = {};
        if (isEmail(email) !== true) error.emailError = isEmail(email);
        if (isPassword(password) !== true) error.passwordError = isPassword(password);

        if (Object.keys(error).length > 0) return res.status(400).send({ status: false, message: { error } });
        email = removeSpaces(email);

        let user = await profileModel.findOne({ email: email });
        if (user) {
            const Passwordmatch = bcrypt.compareSync(body.password, user.password);
            if (Passwordmatch) {
                const generatedToken = jwt.sign({
                    userId: user._id,
                    iat: Math.floor(Date.now() / 1000),
                    exp: Math.floor(Date.now() / 1000) + 3600 * 24 * 15
                }, 'CustomerWebApp')
                res.setHeader('Authorization', 'Bearer ' + generatedToken);

                return res.status(200).send({ "status": true, message: "customer login successfull", data: { userId: user._id, token: generatedToken, } });
            }
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: false, message: error.message });
    }
};

//=================================================================================================================================================

const uploadDocument = async function (req, res) {
    try {
        let userId = req.body.userId
        let files = req.files;
        if (userId === req.userId) return res.status(400).send({ status: false, message: "invalid user" })

        const error = {};
        if (isDocument(files) !== true) error.filesError = isDocument(files);

        let document = await uploadFile(files[0])
        let documentData = await documentModel.create({ userId, document })
        return res.status(201).send({ status: true, message: "Document uploaded successfully", data: { documentData } })
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: false, message: error.message });
    }
}


//=================================================================================================================================================

const UserById = async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({ status: false, message: "Request Body is empty" });
        }
        let userId = req.body.userId;
        if (userId === "") return res.status(400).send({ status: false, message: "Please provide data" });
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please Provide a valid customerId" });
        }

        let user = await documentModel.findOne({ userId }).populate({
            path: 'userId',
            select: { 'name': 1, 'email': 1, 'phone': 1, '_id': 0 },
        });


        if (!user || user.isDeleted == true) {
            return res.status(404).send({ status: false, msg: "No user Found" });
        }
        return res.status(200).send({ status: true, message: 'user found successfully', data: user });
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message });
    }
}

//=================================================================================================================================================

const deleteUser = async (req, res) => {
    try {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).send({ status: false, message: "Request Body is empty" });
        }
        let userId = req.body.userId;
        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please Provide a valid userId" });
        }

        let user = await documentModel.findOne({ userId });
        console.log(user)
        if (!user || user.isDeleted == true) {
            return res.status(404).send({ status: false, msg: "No user Found" });
        }
        await documentModel.findOneAndUpdate({ userId }, { $set: { isDeleted: true } }, { new: true });
        await profileModel.findOneAndUpdate({ _id: userId }, { $set: { isDeleted: true } }, { new: true });
        return res.status(204).send({ status: true, message: "User Deleted Succesfully" });
    } catch (error) {
        return res.status(500).send({ status: false, message: error.message });
    }
}

//=================================================================================================================================================

module.exports = { insertProfile, login, uploadDocument, deleteUser, UserById };

//=================================================================================================================================================