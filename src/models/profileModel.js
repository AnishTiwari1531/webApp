const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        phone: {
            type: String,
            required: true,
            unique: true
        },
        image: {
            type: String,
            required: true
        },
        isDeleted: {
            type : Boolean,
            default: false
        }
    }, { timestamps: true });

module.exports = mongoose.model("profile", profileSchema);