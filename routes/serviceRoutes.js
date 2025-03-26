const express = require('express');
const {
    createService,
    getServicesByPack,
    updateService,
    deleteService,
    getServices,
    getMinPriceByPack,
    getPacksWithServices
} = require('../controllers/serviceController');
const {
    createPack,
    getAllPacks,
    getPackById
} = require('../controllers/packController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Routes pour les packs
router.post('/pack', authMiddleware, roleMiddleware(["manager"]), createPack);
router.get('/pack', getAllPacks);
router.get('/pack/:id', getPackById);
router.get('/packs-service', getPacksWithServices);

// Routes pour les services
router.get('/', getServices);
router.get('/pack-services/:idPack', getServicesByPack);
router.get('/min-price/:idPack', getMinPriceByPack);
router.post('/service', authMiddleware, roleMiddleware(["manager"]), createService);
router.put('/service/:id', authMiddleware, roleMiddleware(["manager"]), updateService);
router.delete('/service/:id', authMiddleware, roleMiddleware(["manager"]), deleteService);

module.exports = router;