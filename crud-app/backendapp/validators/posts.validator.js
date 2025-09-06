
const { body } = require("express-validator");

exports.postsValidator = [
  body("title").notEmpty().withMessage("title is required"),
  body("hobbies").notEmpty().withMessage("Please select at least one hobby.")
];
