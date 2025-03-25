const express = require('express');
const { getAllTypesOfCar, createTypeOfCar, getTypeOfCarById,updateTypeOfCar,deleteTypeOfCar } = require('../controllers/TypeOfCarController');
const { getAllCars,getCarById,createCar,updateCar,deleteCar } = require('../controllers/carController');
const { getAllBrands,getBrandById,createBrand,updateBrand,deleteBrand } = require('../controllers/brandController');
const { createMaintenanceRecord, getMaintenanceRecords, updateMaintenanceStatus } = require('../controllers/maintenanceController');
const { getAllRepairs,createRepair,deleteRepair } = require('../controllers/repairController');
const { getAllRepairDetails,createRepairDetail,getRepairsByMechanic } = require('../controllers/repairDetailController');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Routes
router.get('/type', authMiddleware, getAllTypesOfCar);
router.get('/type/:id', authMiddleware, getTypeOfCarById);
router.post('/type', authMiddleware, roleMiddleware(["manager"]), createTypeOfCar);
router.put('/type/:id', authMiddleware, roleMiddleware(["manager"]), updateTypeOfCar); 
router.delete('/type/:id', authMiddleware, roleMiddleware(["manager"]), deleteTypeOfCar);

router.get('/brand', authMiddleware, getAllBrands);
router.get('/brand/:id', authMiddleware, getBrandById); 
router.post('/brand', authMiddleware, roleMiddleware(["manager"]), createBrand); 
router.put('/brand/:id', authMiddleware, roleMiddleware(["manager"]), updateBrand); 
router.delete('/brand/:id', authMiddleware, roleMiddleware(["manager"]), deleteBrand); 

router.get('/client', authMiddleware, getAllCars); 
router.get('/client/:clientId', authMiddleware, getCarById);
router.post('/client', authMiddleware, roleMiddleware(["client"]), createCar);
router.put('/client/:id', authMiddleware, roleMiddleware(["client"]), updateCar); 
router.delete('/client/:id', authMiddleware, roleMiddleware(["client"]), deleteCar); 

router.get('/repair', authMiddleware, roleMiddleware(["client"]), getAllRepairs); 
router.post('/repair', authMiddleware, roleMiddleware(["client"]), createRepair); 
router.delete('/repair/:id', authMiddleware, roleMiddleware(["client"]), deleteRepair); 

router.get('/repairdetail', authMiddleware, getAllRepairDetails); 
router.post('/repairdetail', authMiddleware, roleMiddleware(["client"]), createRepairDetail);
router.put('/repairdetail/:id', authMiddleware, createRepairDetail);
router.get('/repairMecanic/:idMecanicien', authMiddleware, roleMiddleware(["mecanicien"]), getRepairsByMechanic);

router.post('/maintenance', authMiddleware, roleMiddleware(["client"]), createMaintenanceRecord);
router.get('/maintenance/:carId', authMiddleware, roleMiddleware(["client"]), getMaintenanceRecords);
router.put('/maintenance/:id/status', authMiddleware, roleMiddleware(["client"]), updateMaintenanceStatus);

module.exports = router;