const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    idPack: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pack', // Référence au modèle Pack
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    basePrice: {
        type: Number,
        required: true,
    },
    estimatedTime: {
        type: Number, // en minutes
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);