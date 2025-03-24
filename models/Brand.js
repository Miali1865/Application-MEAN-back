const { type } = require('express/lib/response');
const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    logo: { type: String, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Brand', brandSchema);