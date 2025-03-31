const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Repair = require('../models/Repair');

exports.scheduleAppointment = async (req, res) => {
    try {
        const { idRepair } = req.body;

        if (!mongoose.Types.ObjectId.isValid(idRepair)) {
            return res.status(400).json({ message: "ID réparation invalide." });
        }

        // Vérifier si la réparation existe
        const repair = await Repair.findById(idRepair);
        if (!repair) {
            return res.status(404).json({ message: "Réparation non trouvée." });
        }

        let date = new Date();
        date.setHours(0, 0, 0, 0); // Réinitialiser à minuit

        const timeSlots = ['08:00', '10:00', '14:00', '16:00']; // Créneaux horaires

        let selectedSlot = null;

        while (!selectedSlot) {
            // Sauter le dimanche
            if (date.getDay() === 0) {
                date.setDate(date.getDate() + 1);
                continue;
            }

            for (const slot of timeSlots) {
                const count = await Appointment.countDocuments({ date, timeSlot: slot });

                if (count === 0) {  // Créneau libre
                    selectedSlot = slot;
                    break;
                }
            }

            // Si aucun créneau dispo, on passe au jour suivant
            if (!selectedSlot) date.setDate(date.getDate() + 1);
        }

        console.log(`📅 Prochain rendez-vous disponible : ${date.toISOString()} à ${selectedSlot}`);

        // Créer le rendez-vous
        const appointment = new Appointment({ idRepair, date, timeSlot: selectedSlot });
        await appointment.save();

        return res.status(201).json({ 
            message: "Rendez-vous programmé avec succès.",
            appointment 
        });

    } catch (error) {
        console.error("Erreur lors de la programmation du rendez-vous :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};
