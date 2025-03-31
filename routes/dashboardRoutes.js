const express = require('express');
const router = express.Router();
const { countDashboardData } = require('../controllers/dashboardController'); // Importer le contrôleur

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Route pour compter les packs et services
router.get('/count', authMiddleware, roleMiddleware(["manager"]), countDashboardData);

module.exports = router;
