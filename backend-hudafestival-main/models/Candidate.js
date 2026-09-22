const mongoose = require('mongoose');
const logAction = require('../utils/logAction');

const candidateSchema = new mongoose.Schema({
    admissionNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: { url: { type: String }, public_id: { type: String } },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
    classLevel: { type: String },
    category: { type: String, required: true },
    totalPoints: { type: Number, default: 0 },
    minusPoints: { type: Number, default: 0 }
}, { timestamps: true });

function checkPointsModification(update, options, modelName) {
    if (!update) return;
    const isModified = (update.$inc && update.$inc.totalPoints !== undefined) || 
                       (update.$set && update.$set.totalPoints !== undefined);
    
    if (isModified && !options.isSystemScoreUpdate) {
        logAction({
            actor: null,
            actorRole: 'system',
            action: 'UNAUTHORIZED_POINTS_WRITE',
            entityType: modelName,
            details: { message: 'Direct write to totalPoints outside normal flow', update }
        }).catch(err => console.error('Failed to log unauthorized write:', err));
    }
}

candidateSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function(next) {
    checkPointsModification(this.getUpdate(), this.options, 'Candidate');
    next();
});

candidateSchema.pre('save', function(next) {
    if (this.isModified('totalPoints') && !this.$isSystemScoreUpdate) {
        logAction({
            actor: null,
            actorRole: 'system',
            action: 'UNAUTHORIZED_POINTS_WRITE',
            entityType: 'Candidate',
            details: { message: 'Direct save of totalPoints outside normal flow', newPoints: this.totalPoints }
        }).catch(err => console.error('Failed to log unauthorized write:', err));
    }
    next();
});

const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate;
