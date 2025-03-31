const Pack = require('../models/packModel'); 
const Service = require('../models/serviceModel'); 
const RepairDetail = require('../models/RepairDetail');

const countDashboardData = async (req, res) => {
    try {
        // Compter les packs
        const packCount = await Pack.countDocuments();

        // Compter les services
        const serviceCount = await Service.countDocuments();

        // Récupérer les 3 services les plus demandés
        const topServices = await RepairDetail.aggregate([
            { 
                $group: {
                    _id: "$idService", // Regrouper par service
                    count: { $sum: 1 } // Compter le nombre d'occurrences
                }
            },
            { 
                $sort: { count: -1 } // Trier par nombre décroissant
            },
            { 
                $limit: 3 // Limiter les résultats aux 3 premiers
            },
            {
                $lookup: {
                    from: "services", // Assurez-vous que le nom de la collection est correct (en minuscule)
                    localField: "_id",
                    foreignField: "_id",
                    as: "service"
                }
            },
            {
                $unwind: "$service" // Déplier le tableau pour obtenir des objets de service
            },
            {
                $project: {
                    _id: 0,
                    serviceName: "$service.name",
                    serviceDescription: "$service.description",
                    serviceCount: "$count"
                }
            }
        ]);

        return res.status(200).json({
            message: "Données comptabilisées avec succès.",
            packCount,
            serviceCount,
            topServices // Ajouter les services les plus demandés à la réponse
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

module.exports = { countDashboardData };
