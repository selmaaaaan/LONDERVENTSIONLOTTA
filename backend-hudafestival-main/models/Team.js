const mongoose = require('mongoose');
const logAction = require('../utils/logAction');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    totalPoints: { type: Number, default: 0 },
    color: { type: String, default: '#6B7280' },
    motto: { type: String, required: false },
    isTopicRegistrationOpen: { type: Boolean, default: true }
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

teamSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function(next) {
    checkPointsModification(this.getUpdate(), this.options, 'Team');
    next();
});

teamSchema.pre('save', function(next) {
    if (this.isModified('totalPoints') && !this.$isSystemScoreUpdate) {
        logAction({
            actor: null,
            actorRole: 'system',
            action: 'UNAUTHORIZED_POINTS_WRITE',
            entityType: 'Team',
            details: { message: 'Direct save of totalPoints outside normal flow', newPoints: this.totalPoints }
        }).catch(err => console.error('Failed to log unauthorized write:', err));
    }
    next();
});

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;
