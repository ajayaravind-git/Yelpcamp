const Review = require('../models/reviews');
const Campground = require('../models/campground');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Review added successfully')
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {     // deleting individual reviews
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });      // $pull is an operator in mongo used to remove an element completely from an array
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review deleted successfully')
    res.redirect(`/campgrounds/${id}`)
}