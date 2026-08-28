const express = require('express');

const {
    createProject,
    getProjects,
    getProject,
    updateProject,
    deleteProject
} = require('../controllers/projectController');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All project routes require login
router.use(authMiddleware);

// Create project
router.post('/', createProject);

// Get all projects
router.get('/', getProjects);

// Get one project
router.get('/:id', getProject);

// Update project
router.put('/:id', updateProject);

// Delete project
router.delete('/:id', deleteProject);

module.exports = router;