const router = require("express").Router();
const { register ,login,resetPassword,changePassword, logout, getUsers, updateUserDetails} = require("../controller/auth");
const { isAuth, isAuthorized } = require("../middleware/is-auth");



router.get('/logout',logout);
router.post("/register", register);
router.post("/login",login);
router.post('/resetpassword',resetPassword);
router.post('/resetpassword/:resetId',changePassword);
router.put('/me/updatepassword',isAuth ,changePassword);
router.get('/me',isAuth,getUsers);
router.put('/me',isAuth,updateUserDetails)
module.exports = router;
