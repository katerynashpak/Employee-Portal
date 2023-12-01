const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const { initial } = require('prelude-ls')
const User = require('./models/user')

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {

        try {

            const user = await getUserByEmail(email)

            if (!user) {
                return done(null, false, { message: 'No user with that email' })
            }

            const passwordMatch = await bcrypt.compare(password, user.password)
        
            if (passwordMatch) {
                return done(null, user)
            }
            else {
                return done(null, false, { message: 'Password incorrect' })
            }

        } catch (e) {
            return done(e)
        }
    }

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })
    passport.deserializeUser( async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user)
        } catch(e) {
            done(e, null)
        }
    })
}




module.exports = initialize

