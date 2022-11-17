const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary')
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })


module.exports.index = async (req, res) => {  //A wrap of  catchAsync over the async function to catch errors. Same done on other functions aswell.
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}

module.exports.renderNewForm = (req, res) => {

    res.render('campgrounds/new');

}

module.exports.createCampground = async (req, res, next) => {        //adding the middleware validateCampground to the post route.

    const geoData = await geocoder.forwardGeocode({         //mapbox npm functions used (required above)
        query: req.body.campground.location,
        limit: 1
    }).send()

    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;

    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))      // While uploading images makes two objects with Url and filename.(multer function)
    campground.author = req.user._id;                            //setting the name of the created user to a campground usig the passport  property req.user.
    await campground.save();
    console.log(campground)
    req.flash('success', 'Successfully created a new campground!')         // implementing flash message in model.

    res.redirect(`/campgrounds/${campground._id}`)

}


module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).
        populate({
            path: 'reviews',                       //  nested populate to populate authors inside reviews which is inside camgrounds
            populate: {
                path: 'author'
            }
        }).populate('author');                     // populating with the newly added reviews


    if (!campground) {
        req.flash('error', 'Cannot find that campground')           //calling the middleware with error flash.
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });

}

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground')           //calling the middleware with error flash.
        res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...imgs)     // While uploading images makes two objects with Url and filename.(multer function)
    await campground.save()

    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }

        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Update successful!!')
    res.redirect(`/campgrounds/${campground._id}`)
}



module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Succesfully deleted campground');
    res.redirect('/campgrounds');

}