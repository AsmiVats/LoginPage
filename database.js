const mongoose = require('mongoose');

exports.connectMongoose = async() =>{
    await mongoose.connect('mongodb://127.0.0.1:27017/webUsersDB')
    .then((e)=> console.log(`Connected to MongoDB: ${e.connection.host}`))
    .catch((err)=> console.log(err));
};

const webUserSchema = new mongoose.Schema({
    username:String,
    email: String,
    password:String ,
    googleId: String,
});

exports.user = mongoose.model('user', webUserSchema);