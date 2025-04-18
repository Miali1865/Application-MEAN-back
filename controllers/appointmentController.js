const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const Repair = require('../models/Repair');
const RepairDetail = require('../models/RepairDetail');
const Car = require('../models/Car');
const Billing = require('../models/Billing');

const timeSlots = ['08:00', '10:00', '14:00', '16:00']; // Créneaux horaires autorisés

exports.createRepairAndDetails = async (req, res) => {
    try {
        const { idVoiture, idService, selectedDate, selectedSlot } = req.body;
        if (!mongoose.Types.ObjectId.isValid(idVoiture)) return res.status(400).json({ message: "ID de voiture invalide." });
        if (!timeSlots.includes(selectedSlot)) return res.status(400).json({ message: `Créneau horaire invalide.` });

        const car = await Car.findById(idVoiture);
        if (!car) return res.status(404).json({ message: "Voiture introuvable." });

        const date = new Date(selectedDate);
        date.setDate(date.getDate() + 1);
        date.setHours(0, 0, 0, 0);

        const existingAppointment = await Appointment.exists({ date, timeSlot: selectedSlot });
        if (existingAppointment) return res.status(400).json({ message: "Ce créneau est déjà réservé." });

        const repair = await new Repair({ idVoiture, dateOfRepair: date }).save();
        const repairDetail = await new RepairDetail({ idRepair: repair._id, idService }).save();
        await new Appointment({ idRepair: repair._id, date, timeSlot: selectedSlot }).save();

        // Vérifier si la facturation est possible
        await createBillingIfCompleted(repair._id);

        res.status(201).json({ message: "Réparation créée avec succès.", repair, repairDetail });
    } catch (error) {
        console.error("Erreur lors de la création :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};

const createBillingIfCompleted = async (idRepair) => {
    const repairDetails = await RepairDetail.find({ idRepair });
    if (!repairDetails.length) return;
    // Calcule le montant total en ignorant le statut des réparations
    const totalAmount = repairDetails.reduce((sum, detail) => sum + (detail.price || 0), 0);
    // Insère une nouvelle facture
    await new Billing({ idRepair, totalAmount, status: 'Pending' }).save();
};

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
        // Agréger les rendez-vous par date et par créneau horaire
        const appointmentsByDate = await Appointment.aggregate([
            {
                // Regrouper les rendez-vous par date (en format YYYY-MM-DD)
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, 
                    timeSlots: {
                        $push: "$timeSlot"
                    }
                }
            },
            {
                // On trie par date, la plus récente d'abord
                $sort: { _id: -1 }
            },
            {
                // On ajoute un champ count pour le nombre de créneaux réservés par date
                $project: {
                    _id: 1,
                    timeSlots: 1,
                    title: { $size: "$timeSlots" } 
                }
            }
        ]);

        // Pour chaque date, on récupère les créneaux horaires uniques
        const formattedAppointments = appointmentsByDate.map(appointment => {
            const timeSlotsUnique = [...new Set(appointment.timeSlots)]; 
            return {
                date: appointment._id,
                timeSlots: timeSlotsUnique,
                title: appointment.title
            };
        });

        return res.status(200).json({
            message: "Nombre de rendez-vous par date récupéré avec succès.",
            appointmentsByDate: formattedAppointments
        });

    } catch (error) {
        console.error("Erreur lors du comptage des rendez-vous par date :", error);
        res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
    }
};
// OG
// exports.getDetailBooked = async (req, res) => {

//     try {
//         // Agréger les rendez-vous par date et créneau horaire
//         const appointmentsByDate = await Appointment.aggregate([
//             {
//                 $group: {
//                     _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
//                     timeSlots: { $push: { slot: "$timeSlot", idRepair: "$idRepair" } }
//                 }
//             },
//             { $sort: { _id: -1 } }
//         ]);

//         // Récupérer les réparations associées
//         const formattedAppointments = await Promise.all(appointmentsByDate.map(async (appointment) => {
//             const timeSlots = appointment.timeSlots;

//             // Récupérer les détails des réparations pour ces réparations
//             const repairDetails = await RepairDetail.find({ idRepair: { $in: timeSlots.map(t => t.idRepair) } })
//                 .populate('idMecanicien', 'name')
//                 .populate('idService', 'name')
//                 .sort({ updatedAt: -1 })
//                 .exec();

//             // Organiser par `idRepair`
//             const latestRepairs = {};
//             repairDetails.forEach(repair => {
//                 latestRepairs[repair.idRepair.toString()] = repair;
//             });

//             // Associer chaque créneau au bon mécanicien/service/status
//             const timeSlotDetails = timeSlots.map(({ slot, idRepair }) => {
//                 const repairDetail = latestRepairs[idRepair.toString()];

//                 return {
//                     timeSlot: slot,
//                     mechanic: repairDetail?.idMecanicien?.name || "Aucun",
//                     status: repairDetail?.status || "Not started",
//                     service: repairDetail?.idService?.name || "Non spécifié"
//                 };
//             });

//             return {
//                 date: appointment._id,
//                 timeSlots: timeSlotDetails
//             };
//         }));

//         return res.status(200).json({
//             message: "Détails des rendez-vous récupérés avec succès.",
//             appointmentsByDate: formattedAppointments
//         });

//     } catch (error) {
//         console.error("Erreur lors de la récupération des rendez-vous :", error);
//         res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
//     }
// };

// balita : 

exports.getDetailBooked = async (req, res) => {
    try {
        // Agréger les rendez-vous par date et créneau horaire
        const appointmentsByDate = await Appointment.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    timeSlots: { $push: { slot: "$timeSlot", idRepair: "$idRepair" } }
                }
            },
            { $sort: { _id: -1 } }
        ]);

        // Récupérer les réparations associées
        const formattedAppointments = await Promise.all(appointmentsByDate.map(async (appointment) => {
            const timeSlots = appointment.timeSlots;

            // Récupérer les réparations complètes avec toutes les relations
            const repairs = await Repair.find({ 
                _id: { $in: timeSlots.map(t => t.idRepair) } 
            })
            .populate({
                path: 'idVoiture',
                populate: [{
                    path: 'client',
                    select: 'name'
                },{
                    path: 'brand',
                    select: 'name'
                }
            ],
                

            })
            .exec();

            // Récupérer les détails des réparations
            const repairDetails = await RepairDetail.find({ 
                idRepair: { $in: timeSlots.map(t => t.idRepair) } 
            })
            .populate('idMecanicien', 'name')
            .populate('idService', 'name')
            .sort({ updatedAt: -1 })
            .exec();

            // Organiser les données pour un accès facile
            const repairsMap = {};
            repairs.forEach(repair => {
                repairsMap[repair._id.toString()] = {
                    clientName: repair.idVoiture?.client?.name || "Inconnu",
                    carDetails: repair.idVoiture
                };
            });

            const repairDetailsMap = {};
            repairDetails.forEach(detail => {
                repairDetailsMap[detail.idRepair.toString()] = detail;
            });

            // Associer chaque créneau à toutes les informations
            const timeSlotDetails = timeSlots.map(({ slot, idRepair }) => {
                const repairId = idRepair.toString();
                const repairDetail = repairDetailsMap[repairId];
                const repairInfo = repairsMap[repairId];

                return {
                    timeSlot: slot,
                    mechanic: repairDetail?.idMecanicien?.name || "Aucun",
                    status: repairDetail?.status || "Not started",
                    service: repairDetail?.idService?.name || "Non spécifié",
                    clientName: repairInfo?.clientName || "Inconnu",
                    carModel: repairInfo?.carDetails?.model || "Modèle inconnu",
                    carBrand: repairInfo?.carDetails?.brand?.name || "Marque inconnu",
                    plateNumber: repairInfo?.carDetails?.plateNumber || "N/A"
                };
            });

            return {
                date: appointment._id,
                timeSlots: timeSlotDetails
            };
        }));

        return res.status(200).json({
            message: "Détails des rendez-vous récupérés avec succès.",
            appointmentsByDate: formattedAppointments
        });

    } catch (error) {
        console.error("Erreur lors de la récupération des rendez-vous :", error);
        res.status(500).json({ 
            message: "Erreur interne du serveur", 
            error: error.message 
        });
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
