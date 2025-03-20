const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    priceCoefficient: { type: Number, required: true, default: 1 },
    timeCoefficient: { type: Number, required: true, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Brand', brandSchema);