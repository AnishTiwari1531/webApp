const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const documentSchema = new mongoose.Schema({
    userId : {
        type : ObjectId,
        required : true,
        ref : "profile"
    },
    document : {
        type : String,
        required : true
    },
    isDeleted : {
        type : Boolean,
        default : false
    }
}, {timestamps : true});

module.exports = mongoose.model("document", documentSchema)