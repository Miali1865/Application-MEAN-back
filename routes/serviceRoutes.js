const express = require('express');
const {
    createService,
    getServicesByPack,
    updateService,
    deleteService
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

// Routes pour les services
router.get('/services/pack/:idPack', getServicesByPack); // Liste des services par pack
router.post('/service', authMiddleware, roleMiddleware(["manager"]), createService); // Ajouter un service
router.put('/service/:id', authMiddleware, roleMiddleware(["manager"]), updateService); // Mettre à jour un service
router.delete('/service/:id', authMiddleware, roleMiddleware(["manager"]), deleteService); // Supprimer un service

module.exports = router;