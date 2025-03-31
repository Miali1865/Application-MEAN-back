const Pack = require('../models/packModel'); 
const Service = require('../models/serviceModel'); 

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
