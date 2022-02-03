const mongoose=require('mongoose');
const colors = require('colors');

const connectMongo=async()=>{
await mongoose.connect(process.env.MONGO_URI);
console.log('connected to database'.blue.bold)
}

module.exports=connectMongo;