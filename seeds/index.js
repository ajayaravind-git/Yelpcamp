const path = require('path');
const cities = require('./cities')
const Campground = require('../models/campground');
const { places, descriptors } = require('./seedHelpers')


const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
})
const sample = array => array[Math.floor(Math.random() * array.length)]


const seedDB = async () => {
    await Campground.deleteMany({}); //delete everything in the Database
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '636d0c5fd3a1e7df949f1650',
            location: ` ${cities[random1000].city},${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Fuga odit atque explicabo dicta, adipisci at, rem repudiandae reiciendis corrupti esse quae saepe repellendus commodi officiis laudantium harum suscipit! Architecto, vero.',
            price,
            geometry: { type: 'Point', coordinates: [cities[random1000].longitude, cities[random1000].latitude] },
            images: [
                {
                    url: 'https://res.cloudinary.com/dejl1hpuq/image/upload/v1668253859/Yelpcamp/wrpavku2qd3fyng9uiev.avif',
                    filename: 'Yelpcamp/wrpavku2qd3fyng9uiev',
                },
                {
                    url: 'https://res.cloudinary.com/dejl1hpuq/image/upload/v1668253859/Yelpcamp/bu4f0crbw98cehvji25a.avif',
                    filename: 'Yelpcamp/bu4f0crbw98cehvji25a',
                }
            ]
        })
        await camp.save();

    }
}
seedDB().then(() => {
    mongoose.connection.close();

})