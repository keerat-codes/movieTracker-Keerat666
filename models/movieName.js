const mongoose = require('mongoose');

const movieNameSchema = new mongoose.Schema({
movieName : { type:  String, description: "Required Field", required: false },
});

module.exports = mongoose.model('movieName', movieNameSchema);