const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    typeOfCar: { type: mongoose.Schema.Types.ObjectId, ref: 'TypeOfCar', required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    plateNumber: { type: String, unique: true, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);