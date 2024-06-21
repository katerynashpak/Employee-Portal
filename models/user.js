const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        /*
        validate: {
            validator: (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                return emailRegex.test(value)
            },
            message: 'Invalid email format'
        }
            */
    },

    password: {
        type: String,
        required: true,
        /*validate: {
            validator: (value) => {
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
                return passwordRegex.test(value)
            },
            message: 'Invalid password format'
        }*/ 
    },

    resetPasswordToken: {
        type: String
    },

    resetPasswordExpires: {
        type: Date
    },

    birthday: {
        type: Date,
        required: false
    },
    jobTitle: {
        type: String,
        required: false
    },
    department: {
        type: String,
        required: false
    },
    avatar: {
        type: String,
        default: 'data:image/png;base64,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',
        required: false
    }


})


module.exports = mongoose.model('User', userSchema)
