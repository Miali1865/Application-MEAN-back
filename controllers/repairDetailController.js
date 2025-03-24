// controllers/repairDetailController.js
const RepairDetail = require('../models/RepairDetail');

// Récupérer tous les détails des réparations
exports.getAllRepairDetails = async (req, res) => {
    try {
        const repairDetails = await RepairDetail.find()
            .populate('idRepair', 'idVoiture idService timestamp')
            .populate('idMecanicien', 'name');
        res.status(200).json(repairDetails);
    } catch (error) {
        console.error("Erreur lors de la récupération des détails de réparation :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// Créer un détail de réparation
exports.createRepairDetail = async (req, res) => {
    try {
        const { idRepair, idMecanicien, status } = req.body;

        const newRepairDetail = new RepairDetail({
            idRepair,
            idMecanicien,
            status
        });

        await newRepairDetail.save();

        res.status(201).json({ message: "Détail de réparation créé avec succès !", repairDetail: newRepairDetail });
    } catch (error) {
        console.error("Erreur lors de la création du détail de réparation :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// Mettre à jour un détail de réparation
exports.updateRepairDetail = async (req, res) => {
    try {
        const { idRepair, idMecanicien, status } = req.body;
        const repairDetailId = req.params.id; 

        const updatedRepairDetail = await RepairDetail.findByIdAndUpdate(
            repairDetailId,
            {
                idRepair,
                idMecanicien,
                status
            },
            { new: true } 
        );

        if (!updatedRepairDetail) {
            return res.status(404).json({ message: "Détail de réparation non trouvé." });
        }

        res.status(200).json({ message: "Détail de réparation mis à jour avec succès !", repairDetail: updatedRepairDetail });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du détail de réparation :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};