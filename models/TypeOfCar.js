const mongoose = require('mongoose');

const typeOfCar = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    priceCoefficient: { type: Number, required: true, default: 1 },
    timeCoefficient: { type: Number, required: true, default: 1 }
}, { timestamps: true });

module.exports = mongoose.model('TypeOfCar', typeOfCar);