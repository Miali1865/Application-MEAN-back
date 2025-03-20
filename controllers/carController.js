const Car = require("../models/Car");


exports.addCar = async(req, res) => {
    try {
        const { clientId, brandId, model, year, plateNumber } = req.body;

        const car = new Car({ client: clientId, brand: brandId, model, year, plateNumber });
        await car.save();

        res.status(201).json({ message: "Voiture ajoutée avec succès.", car });
    } catch (error) {
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

exports.getCarsByClient = async(req, res) => {
    try {
        const { clientId } = req.params;

        const cars = await Car.find({ owner: clientId }).populate('brand');
        res.status(200).json(cars);
    } catch (error) {
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};