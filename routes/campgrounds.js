const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')        //catchAsync function for all async functions defined  in the dirctory given. Wrap all async functions in this function where there is a possibility of an error
const ExpressError = require('../utils/ExpressError')    //Express error is defined in ExpressError.js under utils
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas')
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware')
const campgrounds = require('../controllers/campgrounds')
const multer = require('multer')
const { storage } = require('../cloudinary/index')
const upload = multer({ storage });




router.get('/', catchAsync(campgrounds.index))       // campground object in controllers directory.

router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.post('/', upload.array('image'), isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

router.get('/:id', catchAsync(campgrounds.showCampground));


router.get('/:id/edit', isAuthor, isLoggedIn, catchAsync(campgrounds.renderEditForm))


router.put('/:id', isLoggedIn, upload.array('image'), isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))

router.delete('/:id', isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;