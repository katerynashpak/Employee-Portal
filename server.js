//will load in all the env vars and set then inside the process env
if (process.env.NODE_ENV !== 'production') { 
    require('dotenv').config()
}


//import libraries
require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const User = require('./models/user');
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')



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


const usersRouter = require('./routes/users')
app.use('/users', usersRouter)

app.use(express.static('public')); //for css styles


app.set('view engine', 'ejs')
//app.use(express.json()) //wrong, getting undefined values for user fields
app.use(express.urlencoded({extended: true})) //works

app.use(flash())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false //do you want to save an empty value int he session? no
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


//--------------requests------------------

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





//login

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})


app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
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

    res.redirect('./login')
}


function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}




const port = 7000
app.listen(port, () => console.log(`Node app listening to port ${port}!`))




