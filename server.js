


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
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const http = require('http')
const WebSocket = require('ws')



const initializePassport = require('./config/passport-config')
initializePassport(
    passport,
    async email => await User.findOne({ email: email }),
    async id => await User.findById(id)
)


const users = []; //use array instead of database for now;


mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

//import routes
const usersRouter = require('./routes/users')
app.use('/users', usersRouter)

const tasksRouter = require('./routes/tasks')
app.use('/tasks', tasksRouter)


app.use(express.static('public')); //for css styles


app.set('view engine', 'ejs')
//app.use(express.json()) //wrong, getting undefined values for user fields
app.use(express.urlencoded({extended: true})) //works

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
        const users = await User.find(); // Fetch all registered users from MongoDB
        res.render('dashboard', { users }); // Pass users to the dashboard template
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }

})


//dashboard add-task
app.get('/dashboard/add-task', checkAuthenticated, (req, res) => {    //check if authenticated before getting
    try {
        const { _id, description, taskAssignee, priority, startDate, dueDate, status } = req.task
        res.render('add-task.ejs', { id: _id, description, taskAssignee, priority, startDate, dueDate, status })
    } catch (err) {
        res.status(500).send('Error rendering dashboard add task page')
    }

})


//index
app.get('/', checkAuthenticated, (req, res) => {    //check if authenticated before getting
    res.render('index.ejs', { name: req.user.name })
    
})

//profile

app.get('/profile', checkAuthenticated, (req, res) => {    //check if authenticated before getting
    try {
        const { _id, name, email, birthday, jobTitle, department } = req.user
        res.render('profile.ejs', { id: _id, name, email, birthday, jobTitle, department })
    } catch (err) {
        res.status(500).send('Error rendering profile page')
    }

})

app.get('/profile/update', checkAuthenticated, (req, res) => {    //check if authenticated before getting
    try {
        const { _id, name, email, birthday, jobTitle, department } = req.user
        res.render('update-profile.ejs', { id: _id, name, email, birthday, jobTitle, department })
    } catch (err) {
        res.status(500).send('Error rendering profile update page')
    }

})

app.post('/profile', checkAuthenticated, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Cannot find user' });
        }

        user.name = req.body.name || user.name
        user.email = req.body.email || user.email
        user.birthday = req.body.birthday || user.birthday
        user.jobTitle = req.body.jobTitle || user.jobTitle
        user.department = req.body.department || user.department

        const updatedUser = await user.save();

        if (!updatedUser) {
            return res.status(500).json({ message: 'Failed to update user profile' });
        }

        console.log('User updated successfully:', updatedUser);

        // Redirect to the updated profile page
        res.redirect('/profile');
    } catch (err) {
        console.error('Error updating user:', err.message);
        res.status(500).json({ message: err.message });
    }
})

app.patch('/profile', checkAuthenticated, async (req, res) => {

    console.log(req.body)
    try {
        const userId = req.user.id
        const user = await User.findById(userId)
        if (!user)
            return res.status(404).json({ message: 'Cannot find user' })


        user.name = req.body.name || user.name
        user.email = req.body.email || user.email
        user.birthday = req.body.birthday || user.birthday
        user.jobTitle = req.body.jobTitle || user.jobTitle
        user.department = req.body.department || user.department

        const updatedUser = await user.save();

        if (!updatedUser) {
            return res.status(500).json({message: 'Failed to update user profile'})
        }

        console.log('User updated successfully:', updatedUser)
        res.redirect('/profile')

    } catch (err) {
        console.error('Error updating user:', err.message)
        res.status(500).json({ message: err.message })
    }

})


//messages

app.get('/messages', checkAuthenticated, (req, res) => {    //check if authenticated before getting
    try {
        const { _id, name } = req.user
        res.render('messages.ejs', { id: _id, name })
    } catch (err) {
        res.status(500).send('Error rendering profile page')
    }

})


//tasks

app.use('/tasks', async (req, res, next) => {
    try {
        const tasks = await Task.find();
        req.tasks = tasks; // Attach tasks to request object
        next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// Route to render tasks page with all tasks
app.get('/tasks', checkAuthenticated, (req, res) => {
    try {
        res.render('tasks.ejs', { tasks: req.tasks });
    } catch (err) {
        res.status(500).send('Error rendering tasks page');
    }
});

//create a task
app.post('/tasks', checkAuthenticated, async (req, res) => {
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

app.patch('/tasks', checkAuthenticated, async (req, res) => {
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
app.delete('/tasks', checkAuthenticated, async (req, res) => {
    try {
        await res.task.deleteOne({ _id: req.params.id })
        res.json({ message: 'Deleted Task' })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
})





//team

app.get('/team', checkAuthenticated, async (req, res) => {
    try{
        const users = await User.find();
        res.render('team.ejs', {users: users})
    } catch (err){
        res.status(500).send('Error rendering team page')
    }
})











//login

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
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

});



//log out

app.delete('/logout', function (req, res, next) { //logout is an async function
    req.logout(function (err) {
        if (err) {
            return next(err)
        }
    res.redirect('/login')
    })
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




const server = http.createServer(app)
const wss = new WebSocket.Server({server})


let messages = []; // Array to store messages during the session

wss.on('connection', function connection(ws) {
    console.log('WebSocket connection established.');

    // Send existing messages to the newly connected client
    messages.forEach(message => {
        ws.send(JSON.stringify({ content: message }));
    });

    // Broadcast incoming messages to all connected clients
    ws.on('message', function incoming(data) {
        console.log('Received message:', data);

        // Parse the received JSON message
        const message = JSON.parse(data);
        messages.push(message.content); // Store the message content in memory

        // Broadcast the new message content to all clients
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ content: message.content }));
            }
        });
    });
});



const port = process.env.PORT || 7000
server.listen(port, () => console.log(`Portal app listening to port ${port}!`))




