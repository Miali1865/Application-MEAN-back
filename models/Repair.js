const mongoose = require('mongoose');

const repairSchema = new mongoose.Schema({
    idVoiture: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Repair', repairSchema);
