const express = require('express');

const {
    getDashboardStats
} = require('../controllers/dashboardController');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getDashboardStats);

module.exports = router;