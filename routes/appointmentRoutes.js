const express = require('express');
const router = express.Router();
const {scheduleAppointment,getPastAppointmentsCount} = require('../controllers/appointmentController');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.post('/schedule', authMiddleware, scheduleAppointment);
router.get('/count', authMiddleware, getPastAppointmentsCount);


module.exports = router;
