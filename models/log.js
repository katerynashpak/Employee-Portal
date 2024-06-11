
const mongoose = require('mongoose')

const logSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Log', logSchema)
