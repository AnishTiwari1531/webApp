const mongoose = require("mongoose")
const axios = require("axios");
const XLSX = require("xlsx");
const jsontoxml = require("jsontoxml");

//=================================Validator================================================================================================================

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}

//validate fname & lname & uName
function isName(x) {
    if (!x) return "mandatory fname is missing";
    if (typeof x !== "string") return "Data type Error : fname must be a string type";
    if (x.length > 64) return "fname exceeded maximum charaters limit which is 64";
    const regEx = /^[a-zA-Z]+\s?[a-zA-Z]+\s?[a-zA-Z]{1,20}$/;
    if (!regEx.test(x)) return "invalid format of fname"
    return true;
}

//email
function isEmail(x) {
    if (!x) return "mandatory email is missing";
    if (typeof x !== "string") return "Data type Error : email must be a string type";
    const regEx = /^[a-zA-Z]{1}[A-Za-z0-9._]{1,100}[@]{1}[a-z]{2,15}[.]{1}[a-z]{2,10}$/;
    if (!regEx.test(x)) return "invalid email format";
    x = x.split("@");
    if (x[0].length > 64) return "email exceeded the maximum characters in local part";
    if (x[1].length > 255) return "email exceeded the maximum characters in domain part";
    return true;
}

//phone
function isPhone(x) {
    if (!x) return "mandatory phone no. is missing";
    if (typeof x !== "string") return "Data type Error : phone no. must be a string type";
    const regEx = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
    if (!regEx.test(x)) return "invalid phone number";
    return true;
}

//password
function isPassword(x) {
    if (!x) return "mandatory password is missing";
    if (typeof x !== "string") return "Data type Error : password must be a string type";
    if (x.length < 8 || x.length > 15) {
        return res.status(400).send({ status: false, message: "Password should be 8 to 15 characters" });
    }
    return true;
}

//removeSpaces
function removeSpaces(x) {
    // return x.split(" ").filter((y)=> y).join(" ");
    return x.split(" ").join(" ");
}


//trimAndUpperCase
function trimAndUpperCase(x) {
    return x.split(" ").filter((y) => y).map((z) => z = z.charAt(0).toUpperCase() + z.slice(1)).join(" ");
}


//image
function isDocument(x) {
    if (x === undefined || x === null || x.length === 0) return "mandatory Image is missing"; //rectified after test
    const name = x[0].originalname;
    const regEx = /\.(apng|avif|gif|jpg|jpeg|jfif|pjpeg|pjp|png|svg|webp|pdf|excel|csv)$/;    //source:https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
    const checkImage = name.toLowerCase().match(regEx);
    if (checkImage === null) return "provided image is not an image file";
    return true;
}


async function testAxiosXlsx(url) {
    const options = {
        url,
        responseType: "arraybuffer",
    };
    let axiosResponse = await axios(options);
    const workbook = XLSX.read(axiosResponse.data);

    let worksheets = workbook.SheetNames.map((sheetName) => {
        return {
            sheetName,
            data: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]),
        };
    });

    let res = JSON.stringify(worksheets);

    console.log(res);

    return res;
}
// document
// function isDocument(x) {
//     if (x === undefined || x === null || x.length === 0) return "document is missing";
//     const name = x[0].originalname;
//     const regEx = /\.(pdf|excel|csv)$/;
//     const checkDocument= name.match(regEx);
//     if(checkDocument === null)  return "Document is not of the required type";
//     return true;
// }

//=================================================================================================================================================

module.exports = {
    isName, isEmail, isPhone, isPassword, trimAndUpperCase, removeSpaces, isValidObjectId, isDocument,testAxiosXlsx
};

//=================================================================================================================================================