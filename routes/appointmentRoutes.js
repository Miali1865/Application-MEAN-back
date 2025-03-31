const express = require('express');
const router = express.Router();
const {scheduleAppointment} = require('../controllers/appointmentController');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.post('/schedule', authMiddleware, scheduleAppointment);


module.exports = router;
