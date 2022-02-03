const bycryptjs = require("bcryptjs");

exports.encryptPassword=async(password)=>{
    return  bycryptjs.hash(password, 10);
}