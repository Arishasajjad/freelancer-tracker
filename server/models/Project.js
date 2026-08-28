const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
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
            enum: ['Planning', 'In Progress', 'Completed', 'On Hold'],
            default: 'Planning'
        },

        deadline: {
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

module.exports = mongoose.model('Project', projectSchema);