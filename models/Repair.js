const mongoose = require('mongoose');

const repairSchema = new mongoose.Schema({
    idVoiture: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    idService: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    price: { type: Number, required: false },
    duration: { type: Number, required: false }
}, { timestamps: true });


// Calcul du prix et de la durée avant de sauvegarder
repairSchema.pre('save', async function (next) {
    try {
        const car = await mongoose.model('Car').findById(this.idVoiture);
        const service = await mongoose.model('Service').findById(this.idService);
        const typeOfCar = await mongoose.model('TypeOfCar').findById(car.typeOfCar);

        // Calcul du prix (basePrice * priceCoefficient)
        this.price = service.basePrice * typeOfCar.priceCoefficient;
        // Calcul de la durée (estimatedTime * timeCoefficient)
        this.duration = service.estimatedTime * typeOfCar.timeCoefficient;

        next(); // Continuer l'exécution de la sauvegarde
    } catch (error) {
        console.error("Erreur lors du calcul du prix et de la durée :", error);
        next(error);
    }
});

module.exports = mongoose.model('Repair', repairSchema);
