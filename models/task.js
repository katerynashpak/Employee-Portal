const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    priority: {
        type: Date,
        required: false
    },
    duration: {
        type: String,
        required: false
    },
    dueDate: {
        type: String,
        required: false
    },
    status: {
        type: String,
        required: false
    }
});


module.exports = mongoose.model('Task', taskSchema);