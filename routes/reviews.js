const express = require('express')
const router = express.Router({ mergeParams: true });    //Express router doesnot have access to the id params which are in the index.js folder. so we have to specify to merge params in such cases like this {mergeParams: true}  to get the in in   app.use('/campgrounds/:id/reviews', reviews)

const Campground = require('../models/campground');
const Review = require('../models/reviews');

const ExpressError = require('../utils/ExpressError')    //Express error is defined in ExpressError.js under utils
const catchAsync = require('../utils/catchAsync')        //catchAsync function for all async functions defined  in the dirctory given. Wrap all async functions in this function where there is a possibility of an error
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')

const { reviewSchema } = require('../schemas.js')
const reviews = require('../controllers/reviews')




router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));


router.delete('/:reviewId', isReviewAuthor, isLoggedIn, catchAsync(reviews.deleteReview));

module.exports = router;