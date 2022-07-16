'use strict'
const Joi = require('joi')

async function validateSearch(req, res, next) {
    const searchSchema = Joi.object({
        name: Joi.string().lowercase(),
        cca2: Joi.string().max(2),
        cca3: Joi.string().max(3),
        ccn3: Joi.string().max(3),
    });
    const options = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true
    };
    const { error, value } = searchSchema.validate(req.query, options);
    if (error) {
        res.status(422).send(`Validation error: ${error.details.map(x => x.message).join(', ')}`);
    } else {
        req.query = value;
        next();
    }
}
async function validateAdmin(req, res, next) {
    console.log(req.headers);
    if (req.headers['x-admin'] != 1) {
        res.status(401).send(`you're unauthorized to download this file`);
    } else {
        next();
    }
}

module.exports = {
    validateSearch,
    validateAdmin
};