const {query, body} = require('express-validator');


    const validationRule =  [
            query('name').notEmpty().withMessage('please enter the name'),
            query('age').notEmpty().withMessage('please enter the age')

        ]
    const  validationRuleForPost=[body('name').notEmpty().withMessage('please enter the name')];

    module.exports = {validationRule, validationRuleForPost}