const Brand = require('../models/Brand');

exports.createBrand = async(req, res) => {
    try {
        const { name, priceCoefficient, timeCoefficient } = req.body;

        const existingBrand = await Brand.findOne({ name });
        if (existingBrand) {
            return res.status(400).json({ message: "Cette marque existe déjà." });
        }

        const newBrand = new Brand({
            name,
            priceCoefficient: priceCoefficient || 1,
            timeCoefficient: timeCoefficient || 1
        });

        await newBrand.save();

        res.status(201).json({ message: "Marque enregistrée avec succès !", brand: newBrand });

    } catch (error) {
        console.error("Erreur lors de l'ajout de la marque :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};