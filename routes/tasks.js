
const express = require('express')
const router = express.Router()
const Task = require('../models/task')

router.use(express.json())

//get all tasks
router.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})

//get one task
router.get('/tasks/:id', getTask, (req, res) => {
    res.json(res.task)
})

//create a task
router.post('/tasks/', async (req, res) => {
    try {

        //taskAssignee validation
        const user = await User.findById(req.body.taskAssignee)
        if (!user) {
            return res.status(400).json({ message: 'Invalid task assignee' })
        }

        //priority validation
        const allowedPriority = ['low', 'neutral', 'high']
        if (!allowedPriority.includes(req.body.priority)) {
            return res.status(400).json({ message: 'Invalid priority value' })
        }

        //status validation
        const allowedStatus = ['ready', 'in-progress', 'needs-review', 'done']
        if (!allowedStatus.includes(req.body.status)) {
            return res.status(400).json({ message: 'Invalid status value' })
        }

        const task = new Task({
            name: req.body.name,
            description: req.body.description,
            taskAssignee: req.body.taskAssignee,
            priority: req.body.priority,
            startDate: req.body.startDate,
            dueDate: req.body.dueDate,
            status: req.body.status
        })

        const newTask = await task.save()
        res.status(201).json(newTask)
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

router.patch('/tasks/:id', getTask, async (req, res) => {
    try {

        //taskAssignee validation
        if (req.body.taskAssignee) {
            const user = await User.findById(req.body.taskAssignee)
            if (!user) {
                return res.status(400).json({ message: 'Invalid task assignee' })
            }
        }

        //priority validation
        const allowedPriority = ['low', 'neutral', 'high']
        if (req.body.priority && !allowedPriority.includes(req.body.priority)) {
            return res.status(400).json({ message: 'Invalid priority value' })
        }

        //status validation
        const allowedStatus = ['ready', 'in-progress', 'needs-review', 'done']
        if (req.body.status && !allowedStatus.includes(req.body.status)) {
            return res.status(400).json({ message: 'Invalid status value' })
        }

        if (req.body.name != null) {
            res.task.name = req.body.name
        }
        if (req.body.description != null) {
            res.task.description = req.body.description
        }
        if (req.body.taskAssignee != null) {
            res.task.taskAssignee = req.body.taskAssignee
        }
        if (req.body.priority != null) {
            res.task.priority = req.body.priority
        }
        if (req.body.startDate != null) {
            res.task.startDate = req.body.startDate
        }
        if (req.body.dueDate != null) {
            res.task.dueDate = req.body.dueDate
        }
        if (req.body.status != null) {
            res.task.status = req.body.status
        }

        const updatedTask = await res.task.save();
        res.json(updatedTask)

    } catch (err) {
        res.status(400).json({ message: err.message });

    }
})


//delete a task
router.delete('/tasks/:id', getTask, async (req, res) => {
    try {
        await res.task.deleteOne({ _id: req.params.id })
        res.json({ message: 'Deleted Task' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})






//middleware

async function getTask(req, res, next) {
    try {
        const task = await Task.findById(req.params.id)
        if (!task) {
            return res.status(404).json({ message: 'Cannot find task' })
        }
        res.task = task
        next()
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}


module.exports = router











