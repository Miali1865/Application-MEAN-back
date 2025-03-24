const TypeOfCar = require('../models/TypeOfCar');

// 1. Récupérer tous les types de voiture
exports.getAllTypesOfCar = async (req, res) => {
    try {
        const typesOfCar = await TypeOfCar.find();
        res.status(200).json(typesOfCar);
    } catch (error) {
        console.error("Erreur lors de la récupération des types d'automobiles :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// 2. Récupérer un type de voiture par ID
exports.getTypeOfCarById = async (req, res) => {
    try {
        const typeOfCar = await TypeOfCar.findById(req.params.id);
        if (!typeOfCar) {
            return res.status(404).json({ message: "Type d'automobile non trouvé." });
        }
        res.status(200).json(typeOfCar);
    } catch (error) {
        console.error("Erreur lors de la récupération du type d'automobile :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// 3. Créer un type de voiture
exports.createTypeOfCar = async(req, res) => {
    try {
        const { name, priceCoefficient, timeCoefficient } = req.body;

        const existingTypeOfCar = await TypeOfCar.findOne({ name });
        if (existingTypeOfCar) {
            return res.status(400).json({ message: "Cette type d'automobile existe déjà." });
        }

        const newTypeOfCar = new TypeOfCar({
            name,
            priceCoefficient: priceCoefficient || 1,
            timeCoefficient: timeCoefficient || 1
        });

        await newTypeOfCar.save();

        res.status(201).json({ message: "Type d'automobile enregistrée avec succès !", TypeOfCar: newTypeOfCar });

    } catch (error) {
        console.error("Erreur lors de l'ajout de la marque :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// 4. Mettre à jour un type de voiture
exports.updateTypeOfCar = async (req, res) => {
    try {
        const { name, priceCoefficient, timeCoefficient } = req.body;
        const typeOfCar = await TypeOfCar.findByIdAndUpdate(
            req.params.id,
            { name, priceCoefficient, timeCoefficient },
            { new: true, runValidators: true }
        );

        if (!typeOfCar) {
            return res.status(404).json({ message: "Type d'automobile non trouvé." });
        }

        res.status(200).json({ message: "Type d'automobile mis à jour avec succès !", TypeOfCar: typeOfCar });

    } catch (error) {
        console.error("Erreur lors de la mise à jour du type d'automobile :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// 5. Supprimer un type de voiture
exports.deleteTypeOfCar = async (req, res) => {
    try {
        const typeOfCar = await TypeOfCar.findByIdAndDelete(req.params.id);
        if (!typeOfCar) {
            return res.status(404).json({ message: "Type d'automobile non trouvé." });
        }

        res.status(200).json({ message: "Type d'automobile supprimé avec succès !" });

    } catch (error) {
        console.error("Erreur lors de la suppression du type d'automobile :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};