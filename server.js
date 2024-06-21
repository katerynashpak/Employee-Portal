


//import libraries

//will load in all the env vars and set then inside the process env
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const app = express()
const mongoose = require('mongoose')

const User = require('./models/user')
const Task = require('./models/task')
const Log = require('./models/log')

const bcrypt = require('bcrypt')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const { formatDueDate } = require('./public/scripts/format-task-data')

const http = require('http')
const { handleWebSocket } = require('./config/websocket')




const initializePassport = require('./config/passport-config')
initializePassport(
    passport,
    async email => await User.findOne({ email: email }),
    async id => await User.findById(id)
)


const users = [] //use array instead of database for now


mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

//import routes
const usersRouter = require('./routes/users')
app.use('/users', usersRouter)

const tasksRouter = require('./routes/tasks')
app.use('/tasks', tasksRouter)


app.use(express.static('public')) //for css styles


app.set('view engine', 'ejs')
app.use(express.json()) 
app.use(express.urlencoded({ extended: true })) 

app.use(flash())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false //do you want to save an empty value in the session? no
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))




//--------------requests------------------

//dashboard
app.get('/dashboard', checkAuthenticated, async (req, res) => {    //check if authenticated before getting
    try {
        const users = await User.find() // Fetch all registered users from MongoDB
        const tasks = await Task.find().populate('taskAssignee', 'name') // Fetch all tasks from MongoDB
        const logs = await Log.find().populate('user task').sort({ timestamp: -1 }).limit(6)

        const formattedDueDate = tasks.map(task => formatDueDate(task))

        console.log(logs)
        res.render('dashboard', { users, avatar: req.user.avatar, tasks: formattedDueDate, logs, apiKey: process.env.WEATHER_API_KEY }) // Pass users to the dashboard template

    } catch (error) {
        console.error(error)
        res.status(500).send('Error rendering dashboard page')
    }

})

/*
//dashboard add-task
app.get('/dashboard/add-task', checkAuthenticated, (req, res) => {    //check if authenticated before getting
    try {
        const { _id, name, description, taskAssignee, priority, startDate, dueDate, status } = req.task
        res.render('add-task.ejs', { id: _id, name, description, taskAssignee, priority, startDate, dueDate, status })
    } catch (err) {
        res.status(500).send('Error rendering dashboard add task page')
    }

})
*/

//index
app.get('/', checkAuthenticated, (req, res) => {    //check if authenticated before getting
    res.render('login.ejs', { name: req.user.name, avatar: req.user.avatar })

})

app.get('/index', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name, avatar: req.user.avatar })
})

//profile

app.get('/profile', checkAuthenticated, (req, res) => {    //check if authenticated before getting
    try {
        const { _id, name, email, birthday, jobTitle, department, avatar } = req.user
        res.render('profile.ejs', { id: _id, name, email, birthday, jobTitle, department, avatar: req.user.avatar })
    } catch (err) {
        res.status(500).send('Error rendering profile page')
    }

})

app.get('/profile/update', checkAuthenticated, (req, res) => {    //check if authenticated before getting
    try {
        const { _id, name, email, birthday, jobTitle, department, avatar } = req.user
        res.json({ id: _id, name, email, birthday, jobTitle, department, avatar: req.user.avatar })
    } catch (err) {
        res.status(500).json({ message: 'Error rendering profile update page' })
    }

})


app.post('/profile', checkAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: 'Cannot find user' })
        }

        user.name = req.body.name || user.name
        user.email = req.body.email || user.email
        user.birthday = req.body.birthday || user.birthday
        user.jobTitle = req.body.jobTitle || user.jobTitle
        user.department = req.body.department || user.department
        user.avatar = req.body.avatar || user.avatar


        const updatedUser = await user.save()

        if (!updatedUser) {
            return res.status(500).json({ message: 'Failed to update user profile' })
        }

        console.log('User updated successfully:', updatedUser)

        // Redirect to the updated profile page
        res.redirect('/profile')
    } catch (err) {
        console.error('Error updating user:', err.message)
        res.status(500).json({ message: err.message })
    }
})

app.patch('/profile', checkAuthenticated, async (req, res) => {

    console.log(req.body)
    try {
        const userId = req.user.id
        const user = await User.findById(userId)
        if (!user)
            return res.status(404).json({ message: 'Cannot find user' })


        user.name = req.body.profileName || user.name
        user.email = req.body.profileEmail || user.email
        user.birthday = req.body.profileBirthday || user.birthday
        user.jobTitle = req.body.profileJobTitle || user.jobTitle
        user.department = req.body.profileDepartment || user.department
        user.avatar = req.body.avatar || user.avatar

        const updatedUser = await user.save()

        if (!updatedUser) {
            return res.status(500).json({ message: 'Failed to update user profile' })
        }

        console.log('User updated successfully:', updatedUser)
        return res.json({ message: 'Profile updated successfully', user: updatedUser })

    } catch (err) {
        console.error('Error updating user:', err.message)
        return res.status(500).json({ message: err.message })
    }

})



//profile avatar
app.patch('/profile/avatar', checkAuthenticated, async (req, res) => {
    try {
        //console.log('Received avatar data: ', req.body.avatarData)
        const userId = req.user.id
        const user = await User.findById(userId)
        if (!user)
            return res.status(404).json({ message: 'Cannot find user' })

        user.avatar = req.body.avatarData
        const updatedUser = await user.save()
        if (!updatedUser)
            return res.status(500).json({ message: 'Failed to update user avatar' })

        console.log('Avatar saved successfully: ', updatedUser)
        res.sendStatus(200)
    } catch (err) {
        console.error('Error saving avatar: ', err.message)
        res.status(500).json({ message: err.message })
    }

})

app.get('/profile/avatar', checkAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User.findById(userId)
        if (!user)
            return res.status(404).json({ message: 'Cannot find user' })

        res.json({ avatar: user.avatar })
    } catch (err) {
        console.error('Error fetching avatar: ', err.message)
        res.status(500).json({ message: err.message })
    }
})



//messages

app.get('/messages', checkAuthenticated, (req, res) => {    //check if authenticated before getting
    try {
        const { _id, name } = req.user
        console.log("User name:", name)
        res.render('messages.ejs', { id: _id, name: name, avatar: req.user.avatar })
    } catch (err) {
        res.status(500).send('Error rendering profile page')
    }

})

//message count
/*
app.get('/:page', async (req, res) => {
    try {
        const unreadCount = await getMessageCount() //implement
        res.json({ unreadCount: unreadCount })
    } catch (error) {
        console.error('Error retrieving unread message count:', error)
        res.status(500).json({ error: 'Failed to retrieve unread message count' })
    }
})
*/

//tasks


app.use('/tasks', async (req, res, next) => {
    try {
        const tasks = await Task.find().populate('taskAssignee', 'name')
        req.tasks = tasks.map(task => formatDueDate(task))
        next()
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

// Route to render tasks page with all tasks
app.get('/tasks', checkAuthenticated, async (req, res) => {
    try {
        const tasks = await Task.find().populate('taskAssignee', 'name')

        const formattedDueDate = tasks.map(task => formatDueDate(task))
        res.render('tasks.ejs', { tasks: req.tasks, formattedDueDate, avatar: req.user.avatar })
    } catch (err) {
        res.status(500).send('Error rendering tasks page')
    }
})

app.get('/tasks/:id', checkAuthenticated, async (req, res) => {
    try {
        const taskId = req.params.id
        const task = await Task.findById(taskId)
        if (!task) {
            return res.status(404).json({ message: 'Task not found' })
        }
        res.json(task)
    } catch (err) {
        res.status(500).json({ message: 'Error rendering task' })
    }
})


//create a task
app.post('/tasks', checkAuthenticated, async (req, res) => {
    try {

        //taskAssignee validation
        const user = await User.findOne({ name: req.body.taskAssignee })
        if (!user) {
            return res.status(400).json({ message: 'Invalid task assignee' })
        }


        //priority validation
        const allowedPriority = ['low', 'neutral', 'high']
        if (!allowedPriority.includes(req.body.taskPriority)) {
            return res.status(400).json({ message: 'Invalid priority value' })
        }


        //status validation
        const allowedStatus = ['ready', 'in-progress', 'needs-review', 'done']
        if (!allowedStatus.includes(req.body.taskStatus)) {
            return res.status(400).json({ message: 'Invalid status value' })
        }

        const formattedStartDate = new Date(req.body.startDate).toISOString().split('T')[0]
        const formattedDueDate = new Date(req.body.dueDate).toISOString().split('T')[0]

        const task = new Task({
            name: req.body.taskName,
            description: req.body.taskDescription,
            taskAssignee: user._id, //assign ObjectId to user
            priority: req.body.taskPriority,
            startDate: formattedStartDate,
            dueDate: formattedDueDate,
            status: req.body.taskStatus
        })

        const newTask = await task.save()
        //res.status(201).json(newTask)

        await logAction(req.user.id, 'created', newTask._id) //log the action (user created task)

        res.redirect('/tasks') //reload the tasks page
    } catch (err) {
        res.status(400).json({ message: err.message })
    }
})

app.patch('/tasks/:id', checkAuthenticated, async (req, res) => {
    try {
        const taskId = req.params.id
        //console.log(`Updating task with ID: ${taskId}`)
        //console.log('Request body:', req.body)

        const task = await Task.findById(taskId)
        if (!task) {
            return res.status(400).json({ message: 'Task not found' })
        }

        if (req.body.taskAssignee) {
            //console.log(`Validating task assignee: ${req.body.taskAssignee}`)
            const user = await User.findById(req.body.taskAssignee)
            if (!user) {
                return res.status(400).json({ message: 'Invalid task assignee' })
            }
        }

        // Priority validation
        const allowedPriority = ['low', 'neutral', 'high']
        if (req.body.priority && !allowedPriority.includes(req.body.priority)) {
            return res.status(400).json({ message: 'Invalid priority value' })
        }

        // Status validation
        const allowedStatus = ['ready', 'in-progress', 'needs-review', 'done']
        if (req.body.status && !allowedStatus.includes(req.body.status)) {
            return res.status(400).json({ message: 'Invalid status value' })
        }

        // Update task fields
        if (req.body.name)
            task.name = req.body.name
        if (req.body.description)
            task.description = req.body.description
        if (req.body.taskAssignee)
            task.taskAssignee = req.body.taskAssignee
        if (req.body.priority)
            task.priority = req.body.priority
        if (req.body.startDate)
            task.startDate = req.body.startDate
        if (req.body.dueDate)
            task.dueDate = req.body.dueDate
        if (req.body.status)
            task.status = req.body.status

        const updatedTask = await task.save()
        await logAction(req.user.id, 'updated', taskId)
        res.json(updatedTask)
        //console.log(`Task updated successfully: ${updatedTask}`)
    } catch (err) {
        //console.error('Error updating task:', err)
        res.status(400).json({ message: err.message })
    }
})


//delete a task
app.delete('/tasks/:id', checkAuthenticated, async (req, res) => {
    try {
        //const taskId = req.params.id
        await Task.deleteOne({ _id: req.params.id })
        await logAction(req.user.id, 'deleted', req.params.id)
        res.json({ message: 'Deleted Task' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})





//team

app.get('/team', checkAuthenticated, async (req, res) => {
    try {
        const users = await User.find()

        users.sort((a, b) => a.name.localeCompare(b.name))

        res.render('team.ejs', { users: users, avatar: req.user.avatar })
    } catch (err) {
        res.status(500).send('Error rendering team page')
    }
})






//login

app.get('/login', checkNotAuthenticated, (req, res) => {
    const resetPasswordSuccess = req.session.resetPasswordSuccess
    if(resetPasswordSuccess)
        req.session.resetPasswordSuccess = false
    res.render('login', {resetPasswordSuccess})
})


app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    //successRedirect: '/',
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}))




//register

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {

    try {

        
        const {name, email, password} = req.body

        if(!validatePassword(password)){
            return res.render('register', 
                {error: 
                    'Invalid password format.\n Password must have: \n- a minimum length of 8 characters \n- at least one lowercase letter \n- at least one uppercase letter \n- at least one digit \n- at least one special character (@$!%*?&)'
                })
        }


        const existingUser = await User.findOne({ email: req.body.email })
        if (existingUser)
            return res.render('register', { error: 'Email is already in use. Try to log in' })

        const hashedPassword = await bcrypt.hash(req.body.password, 10) //hash password 10 times

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })

        await newUser.save()

        console.log('Resistered user: ', newUser)
        res.redirect('/login')

    } catch (error) {

        console.error(error)
        res.redirect('/register')

    }
    console.log(users)

})



//log out

app.delete('/logout', function (req, res, next) { //logout is an async function
    req.logout(function (err) {
        if (err) {
            return next(err)
        }
        res.redirect('/login')
    })
})


//forgot password
app.get('/forgot-password', checkNotAuthenticated, (req, res) => {
    res.render('forgot-password.ejs')
})

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body
    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).send('User with this email not found')
        }

        const token = crypto.randomBytes(20).toString('hex');

        user.resetPasswordToken = token
        user.resetPasswordExpires = Date.now() + 3600000 //1 hour

        await user.save()



        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'Password Reset',
            text: `We’ve received your request to reset your Employee Portal account password.\n\n 
                    Just click on the link below and follow the simple instructions:\n\n
                    http://localhost:7000/reset-password/${token}\n\n `
        }

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.error('Error sending email:', err)
                return res.status(500).send('Error sending email')
            }
            res.status(200).send('Recovery email sent')
        })



    } catch (err) {
        console.error('Error processing forgot password request:', err)
        res.status(500).send('Error processing forgot password request')
    }
})


app.get('/reset-password/:token', checkNotAuthenticated, (req, res) => {
    const token = req.params.token
    try {
        res.render('reset-password', {token})
    } catch(err){
        res.status(500).send('Error rendering reset password page')
    }
})
    



app.post('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: req.params.token,
            resetPasswordExpires: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).send('Password reset token is invalid or expired')
        }

        const { password } = req.body
        user.password = await bcrypt.hash(password, 10)
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined

        await user.save()
        
        req.session.resetPasswordSuccess = true

        res.redirect('/login')

        
    } catch (err) {
        res.status(500).send('Error processing request')
    }
})






//----------------------------------------



//middleware

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}


function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

function validatePassword(password){
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
        return passwordRegex.test(password)
}

const logAction = async (userId, action, taskId) => {
    const log = new Log({
        user: userId,
        action: action,
        task: taskId
    })

    await log.save()
}



const server = http.createServer(app)
//const wss = new WebSocket.Server({server})

handleWebSocket(server)

const port = process.env.PORT || 7000
server.listen(port, '0.0.0.0', () => console.log(`Portal app listening to port ${port}!`))


