const mongoose = require('mongoose');

const shipSchema = new mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: {type: String, required: true },
	type: {type: String, required: true },
	length: {type: String, required: true },
	owner: {type: String, required: true }
});

module.exports = mongoose.model('Ship', shipSchema);