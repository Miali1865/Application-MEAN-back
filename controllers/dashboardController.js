const mongoose = require('mongoose');
const Pack = require('../models/packModel'); 
const Service = require('../models/serviceModel'); 
const RepairDetail = require('../models/RepairDetail');

// Fonction pour compter le nombre de packs et services
exports.countDashboardData = async (req, res) => {
    try {
        // Compter les packs
        const packCount = await Pack.countDocuments();

        // Compter les services
        const serviceCount = await Service.countDocuments();

        return res.status(200).json({
            message: "Données comptabilisées avec succès.",
            packCount,
            serviceCount
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

exports.getTopRequestedService = async (req, res) => {
    try {
        // Récupérer le service le plus utilisé dans RepairDetail
        const topServiceUsage = await RepairDetail.aggregate([
            { $group: { _id: "$idService", count: { $sum: 1 } } },
            { $sort: { count: -1 } }, // Trier par ordre décroissant
            { $limit: 1 } // Ne récupérer que le plus utilisé
        ]);

        if (topServiceUsage.length === 0) {
            return res.status(404).json({ message: "Aucun service trouvé." });
        }

        // Récupérer les détails du service en base de données
        const topService = await Service.findById(topServiceUsage[0]._id);

        if (!topService) {
            return res.status(404).json({ message: "Service non trouvé en base de données." });
        }

        res.status(200).json({
            message: "Service le plus demandé récupéré avec succès.",
            topService: {
                name: topService.name,
                description: topService.description,
                totalRequests: topServiceUsage[0].count
            }
        });

    } catch (error) {
        console.error("Erreur lors de la récupération du service le plus demandé :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

exports.getMostRequestedServices = async (req, res) => {
    try {
        // Comptabiliser combien de fois chaque service est utilisé dans RepairDetail
        const serviceUsage = await RepairDetail.aggregate([
            { $group: { _id: "$idService", count: { $sum: 1 } } },
            { $sort: { count: -1 } }, // Trier par ordre décroissant
            { $limit: 5 } // Optionnel : récupérer les 5 services les plus demandés
        ]);

        if (serviceUsage.length === 0) {
            return res.status(404).json({ message: "Aucun service trouvé." });
        }

        // Récupérer les IDs des services les plus demandés
        const serviceIds = serviceUsage.map(s => s._id);

        // Récupérer les détails des services en base de données
        const services = await Service.find({ _id: { $in: serviceIds } });

        // Associer les services avec leur nombre d'utilisations
        const mostRequestedServices = services.map(service => {
            const usageData = serviceUsage.find(s => String(s._id) === String(service._id));
            return {
                name: service.name,
                description: service.description,
                totalRequests: usageData ? usageData.count : 0
            };
        });

        res.status(200).json({
            message: "Services les plus demandés récupérés avec succès.",
            mostRequestedServices
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des services les plus demandés :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};


