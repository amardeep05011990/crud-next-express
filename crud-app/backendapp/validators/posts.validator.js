
const { body } = require("express-validator");

exports.postsValidator = [
  body("title").notEmpty().withMessage("title field is required"),
  body("title").isLength({ min: 2 }).withMessage("title is too short")
];
