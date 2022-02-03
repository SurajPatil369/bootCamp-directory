exports.createError = (errorMessage, statuCode) => {
  const error = new Error(errorMessage);
  error.statusCode = statuCode;
  return error;
};
// module.exports=createError;