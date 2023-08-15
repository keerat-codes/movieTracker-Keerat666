const mongoose = require('mongoose');

const movieNamesSchema = new mongoose.Schema({
movieName : { type:  String, description: "Required Field", required: false },
});

module.exports = mongoose.model('movieNames', movieNamesSchema);