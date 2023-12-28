const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

router.use(express.json())

//get all
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users)

    } catch (err) {
        res.status(500).json({message: err.message});
    }
})

//get one
router.get('/:id', getUser, (req, res) => {
    res.json(res.user)
})


//create one
router.post('/', async (req, res) => {

    try {
        const existingUser = await User.findOne({ email: req.body.email })
        if (existingUser)
            return res.status(400).json({ message: 'Email is already in use. Try to log in' })

        const hashedPassword = await bcrypt.hash(req.body.password, 10) //hash password 10 times

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })

        const newUser = await user.save();
        res.status(201).json(newUser);

    } catch (err) {
        res.status(400).json({ message: err.message });

    }

})

//update one
router.patch('/:id', getUser, async (req, res) => {
    try {
        if (req.body.name != null) {
            res.user.name = req.body.name
        }
        if (req.body.email != null) {
            res.user.email = req.body.email
        }
        if (req.body.password != null) {
            res.user.password = req.body.password
        }
    
        const updatedUser = await res.user.save();
        res.json(updatedUser)

    } catch (err) {
        res.status(400).json({ message: err.message });

    }
})


//delete one
router.delete('/:id', getUser, async (req, res) => {
    try {
        await res.user.deleteOne({ _id: req.params.id });
        res.json({ message: 'Deleted User' });
    } catch (err) {
        res.status(500).json({message: err.message});
    }
})



//middleware


async function getUser(req, res, next) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Cannot find user' });
        }
        res.user = user;
        next();

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

   
}


module.exports = router;



