const mongoose = require('mongoose');

const collectionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    columns: { type: [String], required: true, }
}, { timestamps: true });

const User = mongoose.model('all_collections', collectionSchema);
module.exports = User;