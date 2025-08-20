
const { body } = require("express-validator");

exports.postsValidator = [
  body("title").notEmpty().withMessage("title is required")
];
