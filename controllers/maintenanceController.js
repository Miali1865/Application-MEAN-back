const Car = require("../models/Car");
const MaintenanceRecord = require("../models/MaintenanceRecord");
const serviceModel = require("../models/serviceModel");
const Brand = require('../models/Brand');

exports.createMaintenanceRecord = async(req, res) => {
    try {
        const { carId, serviceId } = req.body;

        const car = await Car.findById(carId).populate('brand');

        if (!car) return res.status(404).json({ message: "Voiture introuvable." });

        const service = await serviceModel.findById(serviceId);

        if (!service) return res.status(404).json({ message: "Service introuvable." });

        const finalPrice = service.basePrice * car.brand.priceCoefficient;
        const estimatedTime = service.estimatedTime * car.brand.timeCoefficient;

        // Enregistrer le carnet d’entretien
        const maintenanceRecord = new MaintenanceRecord({
            car: carId,
            service: serviceId,
            finalPrice,
            estimatedTime
        });

        await maintenanceRecord.save();

        res.status(201).json({
            message: "Entretien enregistré avec succès.",
            maintenanceRecord
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

exports.getMaintenanceRecords = async(req, res) => {
    try {
        const { carId } = req.params;

        const records = await MaintenanceRecord.find({ car: carId })
            .populate('service')
            .sort({ date: -1 });

        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

exports.updateMaintenanceStatus = async(req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Vérifier si le statut est valide
        const validStatuses = ["pending", "in_progress", "completed"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Statut invalide." });
        }

        // Mettre à jour le statut de l’entretien
        const updatedRecord = await MaintenanceRecord.findByIdAndUpdate(
            id, { status }, { new: true }
        );

        if (!updatedRecord) {
            return res.status(404).json({ message: "Entretien non trouvé." });
        }

        res.status(200).json({ message: "Statut mis à jour avec succès.", updatedRecord });
    } catch (error) {
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};