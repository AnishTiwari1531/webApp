const express = require('express');
const router = express.Router();
const { authentication, authorisation } = require("../middlewares/auth");
const { insertProfile, login, deleteUser, uploadDocument, UserById } = require("../controllers/profileController");

//=================================================================================================================================================

router.post("/insert", insertProfile);
router.post("/login", login);
router.post("/document", authentication, authorisation, uploadDocument);
router.get("/get", authentication, authorisation, UserById)
router.post("/delete", authentication, authorisation, deleteUser)

router.post("/uploadDocument", uploadDocument);
router.get("/getUSer", UserById)
router.post("/deleteUser", deleteUser)
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