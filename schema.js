// Schema for Server side validation

const Joi= require('joi');

const productSchema = Joi.object({
    name: Joi.string().required(),
    img: Joi.string().required(),
    price: Joi.number().min(0).required(), // Changed to Joi.number()
    quantity: Joi.string().min(0).required(), // Changed to Joi.number()
    desc: Joi.string().required(),
    stock: Joi.number().min(0).required() // Changed to Joi.number()
});

const reviewSchema = Joi.object({
    rating: Joi.number().min(1).max(5).required(), // Changed to Joi.number()
    Comment: Joi.string().optional().allow('') // A more concise way for optional strings
});

module.exports={productSchema,reviewSchema};