if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const flash = require('connect-flash');
const session = require('express-session');   // including express session . express-session npm package. no need to install express cookies seperately, already included in this package.
const Campground = require('./models/campground');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync')        //catchAsync function for all async functions defined  in the dirctory given. Wrap all async functions in this function where there is a possibility of an error
const ExpressError = require('./utils/ExpressError')    //Express error is defined in ExpressError.js under utils
const { campgroundSchema, reviewSchema } = require('./schemas.js')
const Review = require('./models/reviews');
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore= require('connect-mongo'); // npm package to store sessions inside mongo. now sessions are stored in mongo like campgrounds,review and users.


const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')


const mongoose = require('mongoose');
const { ppid } = require('process');        //parent process id, Including the node process module.
const { application } = require('express');
const campground = require('./models/campground');

const dbUrl ='mongodb://127.0.0.1:27017/yelp-camp' || process.env.DB_URL;



mongoose.connect(dbUrl)
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
})

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));   // serving the static assets , telling the Express app to use the included style sheets and scripts in the public folder.
app.use(mongoSanitize());    //Security purposes. used npm package express-mongo-sanitize

const secret = process.env.SECRET || 'thisshouldbeabettersecret';
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    secret,
   
    });

store.on('error', function (e) {
    console.log('session store error',e)
})

const sessionConfig = {
    store,                       // express-session npm package installed to start new session.
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,                       // security feature to set request type to http only.                      
        //secure:true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,    //  ms , sec , min , hr ,week  (cookie expiration time)
        maxAge: 1000 * 60 * 60 * 24 * 7
    }

}
app.use(session(sessionConfig));

app.use(flash());

app.use(helmet());
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",

];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/"

];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dejl1hpuq/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            
        },
        
    })
);





app.use(passport.initialize());
app.use(passport.session());    //middleware to stay  logged in, make sure to use this after app.session.
passport.use(new LocalStrategy(User.authenticate()));     //using predefineed authenticate startegy that comes with passpoert-local. 


passport.serializeUser(User.serializeUser());          //how to store in session
passport.deserializeUser(User.deserializeUser());       // how to unstore in session


app.use((req, res, next) => {
                  //Flash middleware to display flsh messages
    res.locals.success = req.flash('success');  // for every single request, take whatever is in the flash. and have access to under 'success' key. Now use success in boileplate.js template
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;          // adding the req.user passport object which contains the username and other details of the logged in id.
    next();                                      // this req.user is used to display if there is a logged in user and change the nav bar display accordingly.
})

app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

app.get('/', (req, res) => {
    res.render('home')
})






app.all('*', (req, res, next) => {                               //Order is really impoortant because this should only function only if none of the above error handling work. So put to the end part .
    next(new ExpressError('Page not found', 404))                //Works for all wrong requests
})                                                               //used ExpressError to assign values to statusCode and message in ExpressError.

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;                                                // Defining err with default values.
    if (!err.message) err.message = 'Oh no, something went wrong';
    res.status(statusCode).render('error', { err })                                  //Passing err object to views/error to render.

})

const port = process.env.PORT||3000
app.listen(port, () => {
    console.log('serving on port 3000');
})
//