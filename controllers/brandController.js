const Brand = require('../models/Brand');

// 1. Récupérer toutes les marques
exports.getAllBrands = async (req, res) => {
    try {
        const brands = await Brand.find();
        res.status(200).json(brands);
    } catch (error) {
        console.error("Erreur lors de la récupération des marques :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// 2. Récupérer une marque par ID
exports.getBrandById = async (req, res) => {
    try {
        const brand = await Brand.findById(req.params.id);
        if (!brand) {
            return res.status(404).json({ message: "Marque non trouvée." });
        }
        res.status(200).json(brand);
    } catch (error) {
        console.error("Erreur lors de la récupération de la marque :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// 3. Créer une nouvelle marque
exports.createBrand = async (req, res) => {
    try {
        const { name, logo } = req.body;

        const existingBrand = await Brand.findOne({ name });
        if (existingBrand) {
            return res.status(400).json({ message: "Cette marque existe déjà." });
        }

        const newBrand = new Brand({
            name,
            logo: logo ?? null
        });

        await newBrand.save();

        res.status(201).json({ message: "Marque enregistrée avec succès !", brand: newBrand });

    } catch (error) {
        console.error("Erreur lors de l'ajout de la marque :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// 4. Mettre à jour une marque
exports.updateBrand = async (req, res) => {
    try {
        const { name, logo } = req.body;

        const brand = await Brand.findByIdAndUpdate(
            req.params.id,
            { name, logo: logo ?? null },
            { new: true, runValidators: true }
        );

        if (!brand) {
            return res.status(404).json({ message: "Marque non trouvée." });
        }

        res.status(200).json({ message: "Marque mise à jour avec succès !", brand });

    } catch (error) {
        console.error("Erreur lors de la mise à jour de la marque :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// 5. Supprimer une marque
exports.deleteBrand = async (req, res) => {
    try {
        const brand = await Brand.findByIdAndDelete(req.params.id);
        if (!brand) {
            return res.status(404).json({ message: "Marque non trouvée." });
        }

        res.status(200).json({ message: "Marque supprimée avec succès !" });

    } catch (error) {
        console.error("Erreur lors de la suppression de la marque :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};