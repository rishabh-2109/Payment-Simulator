const mongoose=require('mongoose');
async function connectDB(mongoUri) {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connnected successfully.")
}

module.exports=connectDB;