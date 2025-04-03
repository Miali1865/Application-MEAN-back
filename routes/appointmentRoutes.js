const express = require('express');
const router = express.Router();
const {scheduleAppointment,getPastAppointmentsCount,getPastAppointments,getFutureAppointments,getTotalBookedAppointmentsByDate} = require('../controllers/appointmentController');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.post('/schedule', authMiddleware, scheduleAppointment);
router.get('/booked', authMiddleware, getTotalBookedAppointmentsByDate);
router.get('/count', authMiddleware, getPastAppointmentsCount);
router.get('/past', getPastAppointments);
router.get('/future', getFutureAppointments);


module.exports = router;
