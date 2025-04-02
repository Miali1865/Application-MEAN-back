const express = require('express');
const { getAllTypesOfCar, createTypeOfCar, getTypeOfCarById,updateTypeOfCar,deleteTypeOfCar } = require('../controllers/TypeOfCarController');
const { getAllCars,getCarById,createCar,updateCar,deleteCar } = require('../controllers/carController');
const { getAllBrands,getBrandById,createBrand,updateBrand,deleteBrand,getBrandCount } = require('../controllers/brandController');
const { getAllRepairs,createRepair,deleteRepair,getLastRepairId } = require('../controllers/repairController');
const { getAllRepairDetails,createRepairDetail,getRepairsByMechanic,getCompletedRepairsByCar,getLatestRepairByCar } = require('../controllers/repairDetailController');

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
router.get('/count/brand', authMiddleware, roleMiddleware(["manager"]), getBrandCount); 

router.get('/client', authMiddleware, getAllCars); 
router.get('/client/:clientId', authMiddleware, getCarById);
router.post('/client', authMiddleware, roleMiddleware(["client"]), createCar);
router.put('/client/:id', authMiddleware, roleMiddleware(["client"]), updateCar); 
router.delete('/client/:id', authMiddleware, roleMiddleware(["client"]), deleteCar); 

router.get('/repair', authMiddleware, getAllRepairs); 
router.post('/repair', authMiddleware, roleMiddleware(["client"]), createRepair); 
router.delete('/repair/:id', authMiddleware, roleMiddleware(["client"]), deleteRepair); 
router.get('/last-repair', authMiddleware, getLastRepairId); 

router.get('/repairdetail', authMiddleware, getAllRepairDetails); 
router.post('/repairdetail', authMiddleware, createRepairDetail);
router.get('/repairMecanic/:idMecanicien', authMiddleware, roleMiddleware(["mecanicien"]), getRepairsByMechanic);
router.get('/repairs-list/:carId', authMiddleware, getLatestRepairByCar);
router.get('/completed-repairs/:carId', authMiddleware, getCompletedRepairsByCar);

module.exports = router;