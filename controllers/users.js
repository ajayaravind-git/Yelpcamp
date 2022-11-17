const User = require('../models/user');


module.exports.renderRegister = (req, res) => {
    res.render('users/register')

}

module.exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {                                            // using the passport function req.login to login directly after one is registered.
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp')
            res.redirect('/campgrounds')

        })

    } catch (e) {

        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');

}

module.exports.login = (req, res) => {         // passport function 
    req.flash('success', 'Welcome back!')
    const redirectUrl = req.session.returnTo || '/campgrounds'              // returning to the page user was trying to accces if any  present or else to campground page
    delete req.session.returnTo;
    res.redirect(redirectUrl)

}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Logged out successfully');
    res.redirect('/campgrounds')

}
// (in the latest version of passport) (Old version used here (0.5.3))passport method to logout. Simply call this logout function and redirect. the logout function has a callback function as an arguement.