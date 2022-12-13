const express = require('express');
const router = express.Router();
const { authentication, authorisation } = require("../middlewares/auth");
const { insertProfile, login, uploadDocument, deleteUser, UserById } = require("../controllers/profileController");

//=================================================================================================================================================

router.post("/insert", insertProfile);
router.post("/login", login);
router.post("/document", uploadDocument);
router.get("/get", UserById)
router.delete("/delete", deleteUser)
// if api is invalid OR wrong URL
router.all("/**", function (req, res) {
    res.status(404).send({
        status: false,
        message: "The api you request is not available"
    });
})

//=================================================================================================================================================

module.exports = router;

//=================================================================================================================================================