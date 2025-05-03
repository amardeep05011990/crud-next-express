const {query} = require('express-validator');


    const validationRule =  [
            query('name').notEmpty().withMessage('please enter the name'),
            query('age').notEmpty().withMessage('please enter the age')

        ]

    module.exports = {validationRule}