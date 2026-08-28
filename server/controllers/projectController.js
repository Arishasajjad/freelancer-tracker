const Project = require('../models/Project');
const Client = require('../models/Client');

// Create a project
const createProject = async (req, res) => {
    try {
        const {
            client,
            title,
            description,
            status,
            deadline,
            price
        } = req.body;

        if (!client || !title || price === undefined) {
            return res.status(400).json({
                message: 'Client, title and price are required'
            });
        }

        // Make sure the client belongs to the logged-in user
        const existingClient = await Client.findOne({
            _id: client,
            user: req.user.userId
        });

        if (!existingClient) {
            return res.status(404).json({
                message: 'Client not found'
            });
        }

        const project = await Project.create({
            user: req.user.userId,
            client,
            title,
            description,
            status,
            deadline,
            price
        });

        res.status(201).json({
            message: 'Project created successfully',
            project
        });

    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// Get all projects for logged-in user
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            user: req.user.userId
        })
            .populate('client', 'name email company')
            .sort({ deadline: 1 });

        res.json(projects);

    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// Get one project
const getProject = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            user: req.user.userId
        }).populate('client', 'name email company');

        if (!project) {
            return res.status(404).json({
                message: 'Project not found'
            });
        }

        res.json(project);

    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// Update project
const updateProject = async (req, res) => {
    try {
        const {
            client,
            title,
            description,
            status,
            deadline,
            price
        } = req.body;

        if (client) {
            const existingClient = await Client.findOne({
                _id: client,
                user: req.user.userId
            });

            if (!existingClient) {
                return res.status(404).json({
                    message: 'Client not found'
                });
            }
        }

        const project = await Project.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.userId
            },
            {
                client,
                title,
                description,
                status,
                deadline,
                price
            },
            {
                new: true,
                runValidators: true
            }
        ).populate('client', 'name email company');

        if (!project) {
            return res.status(404).json({
                message: 'Project not found'
            });
        }

        res.json({
            message: 'Project updated successfully',
            project
        });

    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// Delete project
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!project) {
            return res.status(404).json({
                message: 'Project not found'
            });
        }

        res.json({
            message: 'Project deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


module.exports = {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject
};