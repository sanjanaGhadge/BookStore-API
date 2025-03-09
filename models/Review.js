const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    isbn: String,
    review: String,
    username: String
});

module.exports = mongoose.model('Review', ReviewSchema);
