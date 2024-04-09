const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        /*validate: {
            validator: (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                return emailRegex.test(value)
            },
            message: 'Invalid email format'
        }*/
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
        required: false
    }

})


module.exports = mongoose.model('User', userSchema)
