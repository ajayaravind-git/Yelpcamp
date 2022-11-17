const mongoose = require('mongoose');
const { campgroundSchema, reviewSchema } = require('../schemas');
const Schema = mongoose.Schema;
const Review = require('./reviews');


//https://res.cloudinary.com/dejl1hpuq/image/upload/w_550,h_350,c_fill/v1668260815/Yelpcamp/ththu3rzf7dm9p8teshc.avif


const ImageSchema = new Schema({
    url: String,
    filename: String
})
ImageSchema.virtual('mainDisplay').get(function () {
    return this.url.replace('/upload', '/upload/w_550,h_350')
})
ImageSchema.virtual('indexDisplay').get(function () {
    return this.url.replace('/upload', '/upload/w_550,h_350')
})
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

const opts={toJSON :{virtuals:true}};   //While converting scchema to JSON mongoose does not include virtuals by default. inscclude this statemetn and then pass the value opts with the schema definition.
const CampgroundSchema = new Schema({

    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'

    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
},opts);

CampgroundSchema.virtual('properties.popupMarkup').get(function () {     //defining properties.popupmarkup because in mapbox the geo JSON has two objeccts under the features. one user properties and then the geometry. There is no properties in the campground model so we include this to get a property section under the campground scchema
    return `<strong><a href="/campgrounds/${this._id}">${this.title}-<span style="color: grey; font-weight:200;"> ${this.location}</span></a></strong>
    <p>${this.description.substring(0,40)}...</p>`
})

CampgroundSchema.post('findOneAndDelete', async function (doc) {      //deleting the reviews under a campground after it is deleted using mongoose middleware.
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }                                             //Middleware returns the deleted Object, 'doc' here,             
})


module.exports = mongoose.model('Campground', CampgroundSchema);