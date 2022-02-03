const jwt = require("jsonwebtoken");
const colors = require("colors");
const asyncHandler = require("./async");
const Auth =require('../models/Auth');

//authentication middleware

 exports.isAuth = asyncHandler(async (req, res, next) => {
  console.log("user authorized succesfull".green);
  const token = req.cookies.token || req.get("Authorization");
console.log('token',token)
  if (!token) {
    const error = new Error("Not authorized");
    error.statusCode = 401;
    throw error;
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decodedToken.userId;
    const user=await Auth.findById(userId);
    req.user=user
    next();
  } catch (error) {
     error=new Error('Not authorized');
    error.statusCode=401;
    throw error
  }
});


exports.isAuthorized =(...roles)=>
{
    return (req,res,next)=>{
     
        if (!roles.includes(req.user.role)){
            const error=new Error(`the ${req.user.role} has no access to this route`)
            error.statusCode=401;
            return next(error);
        }
        next();
    }
}
