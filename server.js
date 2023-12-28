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



const initializePassport = require('./passport-config')
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


app.set('view engine', 'ejs')
//app.use(express.json()) //wrong, getting undefined values for user fields
app.use(express.urlencoded()) //works

app.use(flash())

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUnititialized: false //do you want to save an empty value int he session? no
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


//--------------requests------------------

//index
app.get('/', checkAuthenticated, (req, res) => {    //check is authenticated before getting
    res.render('index.ejs', { name: req.user.name })
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


//console.log('stopped at 23:25');

