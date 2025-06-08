
const { body } = require("express-validator");

exports.studentsValidator = [
  body("title").notEmpty().withMessage("title is required")
];
