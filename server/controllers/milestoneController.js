const Milestone = require('../models/Milestone');
const Project = require('../models/Project');


// =========================================================
// CREATE MILESTONE
// =========================================================

const createMilestone = async (req, res) => {
    try {
        const {
            project,
            title,
            description,
            status,
            dueDate,
            price
        } = req.body;

        // -----------------------------------------------------
        // VALIDATION
        // -----------------------------------------------------

        if (
            !project ||
            !title ||
            price === undefined
        ) {
            return res.status(400).json({
                message:
                    'Project, title and price are required'
            });
        }

        // -----------------------------------------------------
        // CHECK PROJECT
        // -----------------------------------------------------

        const existingProject =
            await Project.findOne({
                _id: project,
                user: req.user.userId
            });

        if (!existingProject) {
            return res.status(404).json({
                message: 'Project not found'
            });
        }

        // -----------------------------------------------------
        // CREATE
        // -----------------------------------------------------

        const milestone =
            await Milestone.create({
                user: req.user.userId,
                project,
                title: title.trim(),
                description:
                    description
                        ? description.trim()
                        : '',
                status:
                    status || 'Pending',
                dueDate:
                    dueDate || null,
                price: Number(price)
            });

        // -----------------------------------------------------
        // RETURN POPULATED DATA
        // -----------------------------------------------------

        const populatedMilestone =
            await Milestone.findById(
                milestone._id
            ).populate({
                path: 'project',
                select:
                    'title status price client',
                populate: {
                    path: 'client',
                    select:
                        'name email company'
                }
            });

        res.status(201).json({
            message:
                'Milestone created successfully',
            milestone:
                populatedMilestone
        });

    } catch (error) {
        console.error(
            'CREATE MILESTONE ERROR:',
            error
        );

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// =========================================================
// GET ALL MILESTONES
// =========================================================

const getMilestones = async (req, res) => {
    try {

        const milestones =
            await Milestone.find({
                user: req.user.userId
            })
                .populate({
                    path: 'project',
                    select:
                        'title status price client',
                    populate: {
                        path: 'client',
                        select:
                            'name email company'
                    }
                })
                .sort({
                    dueDate: 1
                });

        res.json(milestones);

    } catch (error) {

        console.error(
            'GET MILESTONES ERROR:',
            error
        );

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// =========================================================
// GET ONE MILESTONE
// =========================================================

const getMilestone = async (req, res) => {
    try {

        const milestone =
            await Milestone.findOne({
                _id: req.params.id,
                user: req.user.userId
            })
                .populate({
                    path: 'project',
                    select:
                        'title status price client',
                    populate: {
                        path: 'client',
                        select:
                            'name email company'
                    }
                });

        if (!milestone) {
            return res.status(404).json({
                message:
                    'Milestone not found'
            });
        }

        res.json(milestone);

    } catch (error) {

        console.error(
            'GET MILESTONE ERROR:',
            error
        );

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// =========================================================
// UPDATE MILESTONE
// =========================================================

const updateMilestone = async (req, res) => {
    try {

        const {
            project,
            title,
            description,
            status,
            dueDate,
            price
        } = req.body;


        // -----------------------------------------------------
        // CHECK PROJECT IF PROVIDED
        // -----------------------------------------------------

        if (project) {

            const existingProject =
                await Project.findOne({
                    _id: project,
                    user: req.user.userId
                });

            if (!existingProject) {
                return res.status(404).json({
                    message:
                        'Project not found'
                });
            }
        }


        // -----------------------------------------------------
        // BUILD UPDATE OBJECT
        // -----------------------------------------------------

        const updateData = {};

        if (project !== undefined) {
            updateData.project = project;
        }

        if (title !== undefined) {
            updateData.title =
                title.trim();
        }

        if (description !== undefined) {
            updateData.description =
                description
                    ? description.trim()
                    : '';
        }

        if (status !== undefined) {
            updateData.status = status;
        }

        if (dueDate !== undefined) {
            updateData.dueDate =
                dueDate || null;
        }

        if (price !== undefined) {
            updateData.price =
                Number(price);
        }


        // -----------------------------------------------------
        // UPDATE
        // -----------------------------------------------------

        const milestone =
            await Milestone.findOneAndUpdate(
                {
                    _id: req.params.id,
                    user: req.user.userId
                },
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate({
                    path: 'project',
                    select:
                        'title status price client',
                    populate: {
                        path: 'client',
                        select:
                            'name email company'
                    }
                });


        if (!milestone) {
            return res.status(404).json({
                message:
                    'Milestone not found'
            });
        }


        res.json({
            message:
                'Milestone updated successfully',
            milestone
        });

    } catch (error) {

        console.error(
            'UPDATE MILESTONE ERROR:',
            error
        );

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// =========================================================
// DELETE MILESTONE
// =========================================================

const deleteMilestone = async (req, res) => {
    try {

        const milestone =
            await Milestone.findOneAndDelete({
                _id: req.params.id,
                user: req.user.userId
            });

        if (!milestone) {
            return res.status(404).json({
                message:
                    'Milestone not found'
            });
        }

        res.json({
            message:
                'Milestone deleted successfully'
        });

    } catch (error) {

        console.error(
            'DELETE MILESTONE ERROR:',
            error
        );

        res.status(500).json({
            message: 'Server error',
            error: error.message
        });
    }
};


// =========================================================
// EXPORTS
// =========================================================

module.exports = {
    createMilestone,
    getMilestones,
    getMilestone,
    updateMilestone,
    deleteMilestone
};