const mongoose = require('mongoose');
const Billing = require('../models/Billing');
const RepairDetail = require('../models/RepairDetail');
const Repair = require('../models/Repair');
const Car = require('../models/Car');

exports.createBilling = async (req, res) => {
    try {
        const { idRepair } = req.body;

        if (!mongoose.Types.ObjectId.isValid(idRepair)) {
            return res.status(400).json({ message: "ID de réparation invalide." });
        }

        // Vérifier si une facture existe déjà
        const existingBill = await Billing.findOne({ idRepair });
        if (existingBill) {
            return res.status(400).json({ message: "Une facture existe déjà pour cette réparation." });
        }

        // Vérifier si toutes les réparations associées sont "Completed"
        const repairDetails = await RepairDetail.find({ idRepair });

        if (repairDetails.length === 0) {
            return res.status(400).json({ message: "Aucun détail de réparation trouvé." });
        }

        const allCompleted = repairDetails.every(detail => detail.status === "Completed");

        if (!allCompleted) {
            return res.status(400).json({ message: "Toutes les réparations doivent être complétées avant de générer une facture." });
        }

        // Calcul du total
        const totalAmount = repairDetails.reduce((sum, detail) => sum + (detail.price || 0), 0);

        // Création de la facture avec statut "Pending"
        const newBilling = new Billing({ idRepair, totalAmount, status: 'Pending' });
        await newBilling.save();

        res.status(201).json({ message: "Facture créée avec succès", billing: newBilling });

    } catch (error) {
        console.error("Erreur lors de la création de la facture :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

exports.deleteBilling = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID de facture invalide." });
        }

        const deletedBilling = await Billing.findByIdAndDelete(id);

        if (!deletedBilling) {
            return res.status(404).json({ message: "Facture non trouvée." });
        }

        res.status(200).json({ message: "Facture supprimée avec succès." });

    } catch (error) {
        console.error("Erreur lors de la suppression de la facture :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// Mettre à jour le statut de paiement
exports.updateBillingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID de facture invalide." });
        }

        if (!['Pending', 'Paid'].includes(status)) {
            return res.status(400).json({ message: "Statut de paiement invalide." });
        }

        const updatedBilling = await Billing.findByIdAndUpdate(id, { status, updatedAt: new Date() }, { new: true });

        if (!updatedBilling) {
            return res.status(404).json({ message: "Facture non trouvée." });
        }

        res.status(200).json({ message: "Statut de la facture mis à jour avec succès.", billing: updatedBilling });

    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut de la facture :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

exports.getPaidBillsByClient = async (req, res) => {
    try {
        const { clientId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: "ID client invalide." });
        }

        const cars = await Car.find({ client: clientId }).select('_id');
        if (cars.length === 0) {
            return res.status(404).json({ message: "Aucune voiture trouvée pour ce client." });
        }

        const carIds = cars.map(car => car._id);
        const repairs = await Repair.find({ idVoiture: { $in: carIds } }).select('_id');

        if (repairs.length === 0) {
            return res.status(404).json({ message: "Aucune réparation trouvée pour les voitures de ce client." });
        }

        const repairIds = repairs.map(repair => repair._id);
        const paidBills = await Billing.find({ idRepair: { $in: repairIds }, status: 'Paid' });

        res.status(200).json({ message: "Factures payées trouvées.", paidBills });

    } catch (error) {
        console.error("Erreur lors de la récupération des factures payées :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

exports.getUnpaidBillsByClient = async (req, res) => {
    try {
        const { clientId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: "ID client invalide." });
        }

        const cars = await Car.find({ client: clientId }).select('_id');
        if (cars.length === 0) {
            return res.status(404).json({ message: "Aucune voiture trouvée pour ce client." });
        }

        const carIds = cars.map(car => car._id);
        const repairs = await Repair.find({ idVoiture: { $in: carIds } }).select('_id');

        if (repairs.length === 0) {
            return res.status(404).json({ message: "Aucune réparation trouvée pour les voitures de ce client." });
        }

        const repairIds = repairs.map(repair => repair._id);
        const unpaidBills = await Billing.find({ idRepair: { $in: repairIds }, status: 'Pending' });

        res.status(200).json({ message: "Factures impayées trouvées.", unpaidBills });

    } catch (error) {
        console.error("Erreur lors de la récupération des factures impayées :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};