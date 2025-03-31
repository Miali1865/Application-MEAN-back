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

exports.getPastAppointmentsCount = async (req, res) => {
    try {
        const { date } = req.query; // La date doit être passée en tant que query param

        // Vérifier que la date est valide
        const parsedDate = new Date(date);
        if (isNaN(parsedDate)) {
            return res.status(400).json({ message: "Date invalide." });
        }

        const startOfDay = new Date(parsedDate);
        startOfDay.setUTCHours(0, 0, 0, 0); // Réinitialiser à minuit en UTC

        // Obtenir la date de fin de la journée en UTC (23h59)
        const endOfDay = new Date(parsedDate);
        endOfDay.setUTCHours(23, 59, 59, 999); // Réinitialiser à 23h59 en UTC

        // Log pour voir les dates
        console.log("Start of day:", startOfDay);
        console.log("End of day:", endOfDay);

        // Trouver le nombre de rendez-vous pour cette journée
        const appointmentsCount = await Appointment.countDocuments({
            date: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });

        // Si on obtient un compte de rendez-vous > 0
        if (appointmentsCount > 0) {
            res.status(200).json({
                message: `Il y a ${appointmentsCount} rendez-vous passés pour la date ${date}.`,
                count: appointmentsCount
            });
        } else {
            res.status(200).json({
                message: `Il n'y a aucun rendez-vous passés pour la date ${date}.`,
                count: appointmentsCount
            });
        }

    } catch (error) {
        console.error("Erreur lors du comptage des rendez-vous passés :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};