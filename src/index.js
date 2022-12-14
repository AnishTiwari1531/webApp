const express = require("express");
const route = require("./routes/route.js");
const mongoose = require("mongoose");
const multer = require('multer');
const app = express();
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(multer().any());    //without it req.files = undefined , if file missing in req => req.files = []

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true })
    .then(() => console.log("mongoDb is connected "))
    .catch(err => console.log(err))

app.use("/", route);

app.listen(process.env.PORT, () =>
    console.log("Express App Running On Port 3000")
);

//=================================================================================================================================================