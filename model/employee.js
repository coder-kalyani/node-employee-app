const mongoose = require('mongoose');
let usersSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    department: String,
    password: String

});
module.exports = mongoose.model('employees', usersSchema);