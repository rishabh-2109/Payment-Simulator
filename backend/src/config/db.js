const mongoose=require('mongoose');
async function connectDB(mongoUri) {
    await mongoose.connect(mongoUri,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    });
    console.log("MongoDB connnected successfully.")
}

module.exports=connectDB;