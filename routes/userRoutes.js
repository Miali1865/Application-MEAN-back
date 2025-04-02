const express = require('express');
const { getAllUsers, getUserById,getAllMechanics } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Routes protégées
router.get('/', authMiddleware, roleMiddleware(["manager"]), getAllUsers);
router.get('/mechanics', authMiddleware, roleMiddleware(["manager"]), getAllMechanics);
router.get('/:id', authMiddleware, getUserById);

module.exports = router;