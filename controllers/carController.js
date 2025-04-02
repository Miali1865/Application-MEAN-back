const Car = require("../models/Car");


// 1. Récupérer toutes les voitures
exports.getAllCars = async (req, res) => {
    try {
        const cars = await Car.find()
            .populate('client', 'name email') // Remplacer par les informations de client que tu souhaites
            .populate('brand', 'name')
            .populate('typeOfCar', 'name');
        res.status(200).json(cars);
    } catch (error) {
        console.error("Erreur lors de la récupération des voitures :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// 2. Récupérer une voiture par ID
exports.getCarById = async (req, res) => {
    try {
        const car = await Car.find({ client: req.params.clientId })
            .populate('brand', 'name')
            .populate('typeOfCar', 'name');
        if (!car) {
            return res.status(404).json({ message: "Aucune voiture trouvée pour ce client." });
        }
        res.status(200).json(car);
    } catch (error) {
        console.error("Erreur lors de la récupération de la voiture :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// 3. Créer une nouvelle voiture
exports.createCar = async (req, res) => {
    try {
        const { client, brand, typeOfCar, model, year, plateNumber } = req.body;

        const existingCar = await Car.findOne({ plateNumber });
        if (existingCar) {
            return res.status(400).json({ message: "Ce numéro de plaque existe déjà." });
        }

        const newCar = new Car({
            client,
            brand,
            typeOfCar,
            model,
            year,
            plateNumber
        });

        await newCar.save();

        res.status(201).json({ message: "Voiture enregistrée avec succès !", car: newCar });

    } catch (error) {
        console.error("Erreur lors de l'ajout de la voiture :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// 4. Mettre à jour une voiture
exports.updateCar = async (req, res) => {
    try {
        const { client, brand, typeOfCar, model, year, plateNumber } = req.body;

        const car = await Car.findByIdAndUpdate(
            req.params.id,
            { client, brand, typeOfCar, model, year, plateNumber },
            { new: true, runValidators: true }
        );

        if (!car) {
            return res.status(404).json({ message: "Voiture non trouvée." });
        }

        res.status(200).json({ message: "Voiture mise à jour avec succès !", car });

    } catch (error) {
        console.error("Erreur lors de la mise à jour de la voiture :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

// 5. Supprimer une voiture
exports.deleteCar = async (req, res) => {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);
        if (!car) {
            return res.status(404).json({ message: "Voiture non trouvée." });
        }

        res.status(200).json({ message: "Voiture supprimée avec succès !" });

    } catch (error) {
        console.error("Erreur lors de la suppression de la voiture :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};


// fonction antsika maka isan'ny nombre voiture
exports.getTotalCars = async (req, res) => {
    try {
        const totalCars = await Car.countDocuments();
        
        res.status(200).json({
            message: "Nombre total de voitures enregistrées récupéré avec succès.",
            totalCars
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du nombre total de voitures :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};