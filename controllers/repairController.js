// controllers/repairController.js
const Repair = require('../models/Repair');

// Récupérer toutes les réparations
exports.getAllRepairs = async (req, res) => {
    try {
        const repairs = await Repair.find()
            .populate('idVoiture', 'plateNumber model')
        res.status(200).json(repairs);
    } catch (error) {
        console.error("Erreur lors de la récupération des réparations :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// Créer une réparation
exports.createRepair = async (req, res) => {
    try {
        const { idVoiture } = req.body;

        const newRepair = new Repair({
            idVoiture
        });

        await newRepair.save();

        res.status(201).json({ message: "Réparation créée avec succès !", repair: newRepair });
    } catch (error) {
        console.error("Erreur lors de la création de la réparation :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// Supprimer une réparation par ID
exports.deleteRepair = async (req, res) => {
    try {
        const repair = await Repair.findByIdAndDelete(req.params.id);

        if (!repair) {
            return res.status(404).json({ message: "Réparation non trouvée." });
        }

        res.status(200).json({ message: "Réparation supprimée avec succès !" });
    } catch (error) {
        console.error("Erreur lors de la suppression de la réparation :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// Fonction pour récupérer le dernier id enregistré
exports.getLastRepairId = async (req, res) => {
    try {
        // Trouver le dernier document enregistré en triant par _id (ordre décroissant)
        const lastRepair = await Repair.findOne().sort({ _id: -1 });

        if (!lastRepair) {
            return res.status(404).json({ message: "Aucune réparation trouvée." });
        }

        return res.status(200).json({
            message: "Dernier ID de réparation récupéré avec succès.",
            lastRepairId: lastRepair._id
        });

    } catch (error) {
        console.error("Erreur lors de la récupération du dernier ID de réparation :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};
