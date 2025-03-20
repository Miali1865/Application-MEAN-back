const express = require('express');
const { createBrand } = require('../controllers/brandController');
const { addCar, getCarsByClient } = require('../controllers/carController');
const { createMaintenanceRecord, getMaintenanceRecords, updateMaintenanceStatus } = require('../controllers/maintenanceController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Routes
router.post('/brand', createBrand);

router.post('/', authMiddleware, roleMiddleware(["client"]), addCar);
router.get('/:clientId', authMiddleware, roleMiddleware(["client"]), getCarsByClient);

router.post('/maintenance', authMiddleware, roleMiddleware(["client"]), createMaintenanceRecord);
router.get('/maintenance/:carId', authMiddleware, roleMiddleware(["client"]), getMaintenanceRecords);
router.put('/maintenance/:id/status', authMiddleware, roleMiddleware(["client"]), updateMaintenanceStatus);

module.exports = router;