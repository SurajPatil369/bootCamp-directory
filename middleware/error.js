const errorHandler=(err,req,res,next)=>{
    if(!err.statusCode){
        err.statusCode=500
    }
    res.status(err.statusCode).json({
        success:false,
        error:err.message || 'Server Error'
    })
    next();
}
module.exports=errorHandler;