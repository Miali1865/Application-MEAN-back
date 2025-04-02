const express = require('express');
const router = express.Router();
const { countDashboardData,getMostRequestedServices } = require('../controllers/dashboardController'); // Importer le contrôleur

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Route pour compter les packs et services
router.get('/count', authMiddleware, roleMiddleware(["manager"]), countDashboardData);
router.get('/service-popular', authMiddleware, roleMiddleware(["manager"]), getMostRequestedServices);

module.exports = router;
