
// Import required modules and packages
const express = require('express');
const {connectMongoose, user} = require("./database")
const bodyParser = require('body-parser');
const ejs = require('ejs');
const passport = require('passport');
const session = require('express-session');
const {initializingpassport} = require('./passport');

// Create an Express application
const app = express();

// Connect to MongoDB using the provided function
connectMongoose();

// Initialize Passport.js for user authentication
initializingpassport(passport);

// Serve static files from the 'public' directory
app.use(express.static("public"));

// Set the view engine to EJS (Embedded JavaScript templates)
app.set('view engine', 'ejs');

// Parse incoming request bodies as JSON or URL-encoded data
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

// Configure session management with a secret key
app.use(session({ secret: 'your-secret-key', resave: false, saveUninitialized: false }));

// Initialize Passport.js sessions
app.use(passport.initialize());
app.use(passport.session());


 // Define a route for the homepage
app.get("/",(req,res)=>{
    res.render("index");
})

// Define a route for the registration page
app.get("/register",async(req,res)=>{
    res.render("register");
});


// Handle POST requests to authenticate users using local strategy
app.post('/', passport.authenticate("local"), async (req, res) => {
  // If this code executes, authentication was successful
  res.send("Authentication successful");
});


// Handle POST requests for user registration
app.post('/register',async(req,res)=>{

    try {
        const existingUser = await user.findOne({ username: req.body.username });
    
        if (existingUser) {
          return res.status(400).send("User already exists");
        }
    
        const newUser = new user({
          username: req.body.username,
          email: req.body.email,
          password: req.body.password,
        });
    
        await newUser.save();
    
        res.status(201).send(newUser);
      } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
      }

});

// Add this route handler to initiate Google Sign-In
app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile'], // Specify the scope of information you want to access
  })
);

// Add this route handler to handle the Google Sign-In callback
app.get(
  '/auth/google/secrets',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful Google Sign-In, redirect to a different page
    res.render('success'); // You can change the redirect URL
  }
);


// Start the Express server on port 3000
app.listen(3000,function(){
    console.log("Server starts at port 3000");
})