const express = require('express');
const router = express.Router();
const {createBilling,deleteBilling,updateBillingStatus,getPaidBillsByClient,getUnpaidBillsByClient} = require('../controllers/billingController');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.post('/create', authMiddleware, roleMiddleware(["manager"]), createBilling);
router.delete('/delete/:id', authMiddleware, roleMiddleware(["manager"]), deleteBilling);
router.put('/update-status/:id', authMiddleware, roleMiddleware(["client"]), updateBillingStatus);
router.get('/paid/:clientId', authMiddleware, roleMiddleware(["client"]), getPaidBillsByClient);
router.get('/unpaid/:clientId', authMiddleware, roleMiddleware(["client"]), getUnpaidBillsByClient);


module.exports = router;
