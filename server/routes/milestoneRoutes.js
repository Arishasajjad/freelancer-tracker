const express = require('express');

const {
    createMilestone,
    getMilestones,
    getMilestone,
    updateMilestone,
    deleteMilestone
} = require('../controllers/milestoneController');

const authMiddleware =
    require('../middleware/authMiddleware');

const router = express.Router();


// =========================================================
// AUTHENTICATION
// =========================================================

router.use(authMiddleware);


// =========================================================
// ROUTES
// =========================================================

router.post(
    '/',
    createMilestone
);

router.get(
    '/',
    getMilestones
);

router.get(
    '/:id',
    getMilestone
);

router.put(
    '/:id',
    updateMilestone
);

router.delete(
    '/:id',
    deleteMilestone
);


module.exports = router;