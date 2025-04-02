// controllers/repairDetailController.js
const Car = require('../models/Car');
const Repair = require('../models/Repair');
const RepairDetail = require('../models/RepairDetail');
const Service = require('../models/serviceModel');
const mongoose = require('mongoose');

// Récupérer tous les détails des réparations
exports.getAllRepairDetails = async (req, res) => {
    try {
        const repairDetails = await RepairDetail.find()
            .populate({
                path: 'idRepair',
                select: 'idVoiture',
                populate: {
                    path: 'idVoiture',
                    model: 'Car',
                    select: 'make model licensePlate'
                }
            })
            .populate('idService', 'name basePrice estimatedTime') 
            .populate('idMecanicien', 'name') 
            .exec(); 

        res.status(200).json(repairDetails);
    } catch (error) {
        console.error("Erreur lors de la récupération des détails de réparation :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};


// Créer un détail de réparation
exports.createRepairDetail = async (req, res) => {
    try {
        const { idRepair, idService, idMecanicien, status } = req.body;

        const existingDetail = await RepairDetail.findOne({ idRepair, idService, idMecanicien, status });

        if (existingDetail) {
            return res.status(400).json({ message: "Ce détail de réparation existe déjà." });
        }

        const newRepairDetail = new RepairDetail({
            idRepair,
            idService,
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

// Ceci permet de récupérer les réparations d'un mécanicien 
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
            return res.status(200).json([]); 
        }

        // Étape 2 : Récupérer les réparations avec la voiture associée
        const repairData = await Repair.find({ _id: { $in: repairIds } })
            .populate({
                path: 'idVoiture',
                select: 'model plateNumber' 
            })
            .lean();

        // Étape 3 : Récupérer les services associés aux réparations depuis RepairDetail
        const serviceIds = latestRepairDetails
            .map(detail => detail.latestRepairDetail?.idService) 
            .filter(id => id); 

        const serviceData = await Service.find({ _id: { $in: serviceIds } })
            .select('name description')
            .lean();

        const finalData = latestRepairDetails.map(detail => {
            const repair = repairData.find(r => r._id.toString() === detail._id.toString());
            const service = serviceData.find(s => s._id.toString() === detail.latestRepairDetail?.idService?.toString());

            return {
                ...repair,
                service: service || null, 
                // status: detail.latestRepairDetail.status,
                // timestamp: detail.latestRepairDetail.timestamp
            };
        });

        console.log("Réparations finales :", finalData);
        res.status(200).json(finalData);

    } catch (error) {
        console.error("Erreur lors de la récupération des réparations :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// fonction pour récupérer les réparations terminés d'une voiture d'un client
exports.getLatestRepairByCar = async (req, res) => {
    try {
        const { carId } = req.params; 

        const latestRepairDetail = await RepairDetail.findOne({
            idRepair: { $in: await Repair.find({ idVoiture: carId }).distinct('_id') } 
        })
        .populate('idRepair')
        .populate('idMecanicien') 
        .sort({ timestamp: -1 }) 
        .limit(1);

        if (!latestRepairDetail) {
            return res.status(404).json({ message: "Aucune réparation trouvée pour cette voiture." });
        }

        res.status(200).json({ repairDetail: latestRepairDetail });
    } catch (error) {
        console.error("Erreur lors de la récupération de la dernière réparation :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// fonction pour récupérer les réparations terminés d'une voiture d'un client
exports.getCompletedRepairsByCar = async (req, res) => {
    try {
        const { carId } = req.params; 
        const car = await Car.findById(carId);
        if (!car) {
            return res.status(404).json({ message: "Voiture non trouvée" });
        }

        const repairs = await Repair.find({ idVoiture: carId });

        if (repairs.length === 0) {
            return res.status(404).json({ message: "Aucune réparation trouvée pour cette voiture" });
        }

        const completedRepairDetails = await RepairDetail.find({
            idRepair: { $in: repairs.map(repair => repair._id) },
            status: "Completed" 
        }).populate('idRepair').populate('idMecanicien'); 

        if (completedRepairDetails.length === 0) {
            return res.status(404).json({ message: "Aucune réparation terminée pour cette voiture" });
        }

        res.status(200).json({ message: "Réparations terminées trouvées", repairs: completedRepairDetails });

    } catch (error) {
        console.error("Erreur lors de la récupération des réparations terminées :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};
