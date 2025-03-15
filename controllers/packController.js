const Pack = require('../models/packModel');

// Créer un pack
exports.createPack = async(req, res) => {
    try {
        const { name, description } = req.body;
        const pack = new Pack({ name, description });
        await pack.save();
        res.status(201).json({ message: 'Pack créé avec succès', pack });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la création du pack", error });
    }
};

// Récupérer tous les packs
exports.getAllPacks = async(req, res) => {
    try {
        const packs = await Pack.find();
        res.status(200).json(packs);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des packs", error });
    }
};

// Récupérer un pack par ID
exports.getPackById = async(req, res) => {
    try {
        const pack = await Pack.findById(req.params.id);
        if (!pack) {
            return res.status(404).json({ message: "Pack non trouvé" });
        }
        res.status(200).json(pack);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération du pack", error });
    }
};