const mongoose = require('mongoose');

const repairDetailSchema = new mongoose.Schema({
    idRepair: { type: mongoose.Schema.Types.ObjectId, ref: 'Repair', required: true },
    idService: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    idMecanicien: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    status: { type: String, enum: ['Not started','In progress', 'Completed', 'Pending'], default: 'Not started', required: true },
    price: { type: Number, required: false },
    duration: { type: Number, required: false },
}, { timestamps: true });

// Assurez-vous que le prix et la durée sont bien calculés avant sauvegarde
repairDetailSchema.pre('save', async function (next) {
    try {
        const repair = await mongoose.model('Repair').findById(this.idRepair);
        if (!repair) {
            return next(new Error("Réparation introuvable."));
        }

        const service = await mongoose.model('Service').findById(this.idService);
        if (!service) {
            return next(new Error("Service introuvable."));
        }

        const car = await mongoose.model('Car').findById(repair.idVoiture);
        if (!car) {
            return next(new Error("Voiture introuvable."));
        }

        const typeOfCar = await mongoose.model('TypeOfCar').findById(car.typeOfCar);
        if (!typeOfCar) {
            return next(new Error("Type de voiture introuvable."));
        }

        // Calcul du prix et de la durée
        this.price = service.basePrice * typeOfCar.priceCoefficient;
        this.duration = service.estimatedTime * typeOfCar.timeCoefficient;

        next(); 
    } catch (error) {
        console.error("Erreur lors du calcul du prix et de la durée :", error);
        next(error);
    }
});

// Permettre la validation avant enregistrement
repairDetailSchema.set('validateBeforeSave', true);

module.exports = mongoose.model('RepairDetail', repairDetailSchema);
