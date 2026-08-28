const Client = require('../models/Client');

// Create a client
const createClient = async (req, res) => {
    try {
        const { name, email, phone, company, notes } = req.body;

        if (!name) {
            return res.status(400).json({
                message: 'Client name is required'
            });
        }

        const client = await Client.create({
            user: req.user.userId,
            name,
            email,
            phone,
            company,
            notes
        });

        res.status(201).json({
            message: 'Client created successfully',
            client
        });

    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// Get all clients for logged-in user
const getClients = async (req, res) => {
    try {
        const clients = await Client.find({
            user: req.user.userId
        }).sort({ createdAt: -1 });

        res.json(clients);

    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// Get one client
const getClient = async (req, res) => {
    try {
        const client = await Client.findOne({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!client) {
            return res.status(404).json({
                message: 'Client not found'
            });
        }

        res.json(client);

    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// Update client
const updateClient = async (req, res) => {
    try {
        const { name, email, phone, company, notes } = req.body;

        const client = await Client.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.userId
            },
            {
                name,
                email,
                phone,
                company,
                notes
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!client) {
            return res.status(404).json({
                message: 'Client not found'
            });
        }

        res.json({
            message: 'Client updated successfully',
            client
        });

    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// Delete client
const deleteClient = async (req, res) => {
    try {
        const client = await Client.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!client) {
            return res.status(404).json({
                message: 'Client not found'
            });
        }

        res.json({
            message: 'Client deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


module.exports = {
    createClient,
    getClients,
    getClient,
    updateClient,
    deleteClient
};