// models/repairDetail.js
const mongoose = require('mongoose');

const repairDetailSchema = new mongoose.Schema({
    idRepair: { type: mongoose.Schema.Types.ObjectId, ref: 'Repair', required: true },
    idMecanicien: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    status: { type: String, enum: ['Not started','In progress', 'Completed', 'Pending'], default: 'Not started', required: true },
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('RepairDetail', repairDetailSchema);
