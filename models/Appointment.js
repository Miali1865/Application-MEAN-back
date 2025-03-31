const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    idRepair: { type: mongoose.Schema.Types.ObjectId, ref: 'Repair', required: true, unique: true },
    date: { type: Date, required: true }, 
    timeSlot: { 
        type: String, 
        enum: ['08:00', '10:00', '14:00', '16:00'], 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
