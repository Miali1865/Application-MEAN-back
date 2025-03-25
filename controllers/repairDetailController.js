// controllers/repairDetailController.js
const Repair = require('../models/Repair');
const RepairDetail = require('../models/RepairDetail');
const mongoose = require('mongoose');

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

// Ceci permet de récupérer les réparations d'un mécanicien mbola tsy mety tsara
exports.getRepairsByMechanic = async (req, res) => {
    try {
        const { idMecanicien } = req.params;
        console.log("ID Mécanicien reçu :", idMecanicien);

        // Vérification si l'ID est valide
        if (!mongoose.Types.ObjectId.isValid(idMecanicien)) {
            return res.status(400).json({ message: "ID mécanicien invalide." });
        }

        // Étape 1 : Récupérer la dernière version de chaque idRepair pour ce mécanicien
        const latestRepairDetails = await RepairDetail.aggregate([
            { $match: { idMecanicien: new mongoose.Types.ObjectId(idMecanicien) } },
            { $sort: { createdAt: -1 } }, 
            {
                $group: {
                    _id: "$idRepair",
                    latestRepairDetail: { $first: "$$ROOT" }
                }
            }
        ]);

        console.log("Dernières réparations attribuées :", latestRepairDetails);

        // Extraire les IDs des réparations
        const repairIds = latestRepairDetails.map(detail => detail._id);
        if (repairIds.length === 0) {
            return res.status(200).json([]); // Retourner un tableau vide si aucune réparation trouvée
        }

        // Étape 2 : Récupérer les réparations avec les relations Voiture et Service
        const repairData = await Repair.find({ _id: { $in: repairIds } })
            .populate({
                path: 'idVoiture',
                select: 'model plateNumber' // Sélectionner les champs nécessaires
            })
            .populate({
                path: 'idService',
                select: 'name description' // Sélectionner les champs nécessaires
            })
            .lean();

        // Associer les détails récupérés avec les réparations
        const finalData = latestRepairDetails.map(detail => {
            const repair = repairData.find(r => r._id.toString() === detail._id.toString());
            return {
                ...repair,
                status: detail.latestRepairDetail.status,
                timestamp: detail.latestRepairDetail.timestamp
            };
        });

        console.log("Réparations finales :", finalData);
        res.status(200).json(finalData);

    } catch (error) {
        console.error("Erreur lors de la récupération des réparations :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};



