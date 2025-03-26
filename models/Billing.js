const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
    idRepair: { type: mongoose.Schema.Types.ObjectId, ref: 'Repair', required: true, unique: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' }, 
}, { timestamps: true });

module.exports = mongoose.model('Billing', billingSchema);
