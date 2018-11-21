const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	username: {
		type: String, 
		required: true, 
		unique: true, 
		match: /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/ },
	password: {type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);