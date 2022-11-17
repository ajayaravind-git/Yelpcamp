module.exports = func => {               // Required in the main index.js file with directory.
    return (req, res, next) => {        // Takes the function around which this is wrapped around and returns another function while catching the errors and passing them to next.
        func(req, res, next).catch(next)
    }
}