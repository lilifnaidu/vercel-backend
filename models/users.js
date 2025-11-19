const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    studentId: String,
    idcardImage: String, // store file name or full path
});

module.exports = mongoose.model('User', userSchema);
