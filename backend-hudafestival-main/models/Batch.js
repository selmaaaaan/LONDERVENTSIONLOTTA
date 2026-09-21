const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    programmes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Programme' 
    }],
    status: { 
        type: String, 
        enum: ['draft', 'submitted', 'published'], 
        default: 'draft' 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
