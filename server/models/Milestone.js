const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        status: {
            type: String,
            enum: [
                'Pending',
                'In Progress',
                'Completed',
                'On Hold'
            ],
            default: 'Pending'
        },

        dueDate: {
            type: Date
        },

        price: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    'Milestone',
    milestoneSchema
);