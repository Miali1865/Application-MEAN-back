const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Repair = require('../models/Repair');

const timeSlots = ['08:00', '10:00', '14:00', '16:00']; // Créneaux horaires autorisés

exports.scheduleAppointment = async (req, res) => {
    try {
        const { idRepair, selectedDate, selectedSlot } = req.body;

        // Vérification de l'ID de réparation
        if (!mongoose.Types.ObjectId.isValid(idRepair)) {
            return res.status(400).json({ message: "ID réparation invalide." });
        }

        // Vérifier si la réparation existe
        const repair = await Repair.findById(idRepair);
        if (!repair) {
            return res.status(404).json({ message: "Réparation non trouvée." });
        }

        // Vérifier si la date fournie est valide
        let date = new Date(selectedDate);
        date.setHours(0, 0, 0, 0); // Mettre l'heure à minuit

        if (isNaN(date.getTime())) {
            return res.status(400).json({ message: "Date invalide." });
        }

        // Ne pas permettre la réservation le dimanche
        if (date.getDay() === 0) {
            return res.status(400).json({ message: "Les rendez-vous ne sont pas disponibles le dimanche." });
        }

        // Vérifier si l'heure sélectionnée est valide
        if (!timeSlots.includes(selectedSlot)) {
            return res.status(400).json({ message: "Créneau horaire invalide. Les horaires disponibles sont 08:00, 10:00, 14:00 et 16:00." });
        }

        // Vérifier si le créneau est déjà réservé
        const count = await Appointment.countDocuments({ date, timeSlot: selectedSlot });
        if (count > 0) {
            return res.status(400).json({ message: "Ce créneau est déjà réservé. Veuillez en choisir un autre." });
        }

        // Créer et enregistrer le rendez-vous
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

exports.getTotalBookedAppointmentsByDate = async (req, res) => {
    try {
        // Agréger les rendez-vous par date
        const appointmentsByDate = await Appointment.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    title: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } }
        ]);

        return res.status(200).json({
            message: "Nombre de rendez-vous par date récupéré avec succès.",
            appointmentsByDate
        });

    } catch (error) {
        console.error("Erreur lors du comptage des rendez-vous par date :", error);
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

// Fonction pour obtenir les rendez-vous passés
exports.getPastAppointments = async (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ message: "La date est requise." });
    }

    try {
        // Convertir la date donnée en objet Date
        const parsedDate = new Date(date);

        // Calculer l'heure de début et de fin de la journée
        const startOfDay = new Date(parsedDate);
        startOfDay.setUTCHours(0, 0, 0, 0); // Réinitialiser à minuit UTC

        const endOfDay = new Date(parsedDate);
        endOfDay.setUTCHours(23, 59, 59, 999); // Réinitialiser à 23h59 UTC

        // Sélectionner les rendez-vous passés (date < aujourd'hui)
        const pastAppointments = await Appointment.find({
            date: { $lt: startOfDay }
        });

        return res.status(200).json({
            message: `Il y a ${pastAppointments.length} rendez-vous passés avant la date ${date}.`,
            count: pastAppointments.length,
            appointments: pastAppointments
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

// Fonction pour obtenir les rendez-vous futurs
exports.getFutureAppointments = async (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ message: "La date est requise." });
    }

    try {
        // Convertir la date donnée en objet Date
        const parsedDate = new Date(date);

        // Calculer l'heure de début et de fin de la journée
        const startOfDay = new Date(parsedDate);
        startOfDay.setUTCHours(0, 0, 0, 0); // Réinitialiser à minuit UTC

        const endOfDay = new Date(parsedDate);
        endOfDay.setUTCHours(23, 59, 59, 999); // Réinitialiser à 23h59 UTC

        // Sélectionner les rendez-vous futurs (date > aujourd'hui)
        const futureAppointments = await Appointment.find({
            date: { $gt: endOfDay }
        });

        return res.status(200).json({
            message: `Il y a ${futureAppointments.length} rendez-vous futurs après la date ${date}.`,
            count: futureAppointments.length,
            appointments: futureAppointments
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
};
