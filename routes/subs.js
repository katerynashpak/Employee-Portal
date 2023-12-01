const express = require('express');
const router = express.Router();
const Sub = require('../models/sub');

//get all
router.get('/', async (req, res) => {
    try {
        const subs = await Sub.find();

    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

//get one
router.get('/:id', getSub, (req, res) => {
    res.json(res.sub)
});


//create one
router.post('/', async (req, res) => {
    const sub = new Sub({
        name: req.body.name,
        subToChannel: req.body.subToChannel
    });

    try {
        const newSub = await sub.save();
        res.status(201).json(newSub);
    } catch (err) {
        res.status(400).json({ message: err.message });

    }

});

//update one
router.patch('/:id', getSub, async (req, res) => {
    if (req.body.name != null) {
        res.sub.name = req.body.name;
    }
    if (req.body.subToChannel != null) {
        res.sub.subToChannel = req.body.subToChannel;
    }
    try {
        const updatedSub = await res.sub.save();
        res.json(updatedSub)
    } catch (err) {
        res.status(400).json({ message: err.message });

    }
});


//delete one
router.delete('/:id', getSub, async (req, res) => {
    try {
        await res.sub.deleteOne({ _id: req.params.id });
        res.json({ message: 'Deleted Sub' });
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});



//middleware


async function getSub(req, res, next) {
    try {
        sub = await Sub.findById(req.params.id);
        if (sub == null) {
            return res.status(404).json({ message: 'Cannot find sub' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.sub = sub;
    next();
}


module.exports = router;



