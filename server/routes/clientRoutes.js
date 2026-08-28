const express = require('express');

const {
    createClient,
    getClients,
    getClient,
    updateClient,
    deleteClient
} = require('../controllers/clientController');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createClient);
router.get('/', getClients);
router.get('/:id', getClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

module.exports = router;