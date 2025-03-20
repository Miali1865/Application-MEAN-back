const mongoose = require('mongoose');

const maintenanceRecordSchema = new mongoose.Schema({
    car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    date: { type: Date, default: Date.now },
    finalPrice: { type: Number, required: true },
    estimatedTime: { type: Number, required: true },
    status: {
        type: String,
        enum: ["pending", "in_progress", "completed"],
        default: "pending"
    }
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceRecord', maintenanceRecordSchema);