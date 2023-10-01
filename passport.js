const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const {user} = require('./database');
require('dotenv').config();


exports.initializingpassport = (passport) =>{

    passport.use(
        new LocalStrategy(async(username, password, done)=>{
        try {
            const User = await user.findOne({username});

            if (!User) return done(null,false);

            if(User.password !== password) return done(null, false);

            return done(null, User);

        } catch (error) {
            return done(error, false);
        }

    })
    );

    passport.use(
        
    new GoogleStrategy(
        {
          clientID: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          callbackURL: 'https://localhost:3000/auth/google/secrets', // Specify the callback URL
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if the user is already registered in your database
            const existingUser = await user.findOne({ googleId: profile.id });
    
            if (existingUser) {
              return done(null, existingUser);
            }
    
            // If the user is not registered, create a new user
            const newUser = new user({
              googleId: profile.id,
              username: profile.displayName,
              // You can add more user information here if needed
            });
    
            await newUser.save();
    
            done(null, newUser);
          } catch (error) {
            done(error, false);
          }
        }
      )
    );
    
   

    passport.serializeUser((User, done)=> {
        done(null, User.id);
      });
      passport.deserializeUser(async(id, done)=> {
       try {

        const User = await user.findById(id);
        done(null,User);
        
       } catch (error) {
        done(error,false);
        
       }
      });
};