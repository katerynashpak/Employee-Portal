const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    taskAssignee: {
        type: String,
        required: true
    },
    priority: {
        type: Date,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        required: false
    }
})


module.exports = mongoose.model('Task', taskSchema)