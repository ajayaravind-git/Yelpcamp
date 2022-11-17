const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');      //sanitize HTML is a npm package to avioid or sanitize Html code inside any inputs. It completely eliminates any HTML script tags.

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});
const Joi = BaseJoi.extend(extension)   //Base Joi avoids html content inside of the 'Joi' Objects.

module.exports.campgroundSchema = Joi.object({                                // defining Joi validator for validation .
    campground: Joi.object({                                         // Joi is an npm package used for defining models with validation in serverside in case one gets past the layer one.
        title: Joi.string().required().escapeHTML(),
        price: Joi.string().required().min(0),
        //image: Joi.string().required(),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array()
});
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required()

});
