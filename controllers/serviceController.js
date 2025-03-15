const Service = require('../models/serviceModel');
const Pack = require('../models/packModel');

// Créer un service (avec l'id du pack)
exports.createService = async(req, res) => {
    try {
        const { idPack, name, description, basePrice, estimatedTime } = req.body;

        // Vérifier si le pack existe
        const pack = await Pack.findById(idPack);
        if (!pack) {
            return res.status(404).json({ message: "Pack non trouvé" });
        }

        const service = new Service({
            idPack,
            name,
            description,
            basePrice,
            estimatedTime,
        });

        await service.save();
        res.status(201).json({ message: 'Service créé avec succès', service });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création du service", error });
    }
};

// Récupérer tous les services associés à un pack (idPack)
exports.getServicesByPack = async(req, res) => {
    try {
        const services = await Service.find({ idPack: req.params.idPack }).populate('idPack');
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des services", error });
    }
};

// Mettre à jour un service
exports.updateService = async(req, res) => {
    try {
        const { idPack, name, description, basePrice, estimatedTime } = req.body;

        // Vérifier si le pack existe
        const pack = await Pack.findById(idPack);
        if (!pack) {
            return res.status(404).json({ message: "Pack non trouvé" });
        }

        const service = await Service.findByIdAndUpdate(
            req.params.id, { idPack, name, description, basePrice, estimatedTime }, { new: true }
        );
        if (!service) {
            return res.status(404).json({ message: "Service non trouvé" });
        }

        res.status(200).json({ message: "Service mis à jour avec succès", service });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du service", error });
    }
};

// Supprimer un service
exports.deleteService = async(req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).json({ message: "Service non trouvé" });
        }
        res.status(200).json({ message: "Service supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du service", error });
    }
};