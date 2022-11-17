const express = reuire('express');
const app = express();
const mongoose = require('mongoose');

app.get('/', (req, res) => {
    res.send('Hello from YelpCamp')
})

app.listen(3000, (req, res) => {
    console.log('serving on port 3000');
})




