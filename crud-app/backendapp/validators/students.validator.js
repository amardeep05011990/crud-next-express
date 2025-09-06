
const { body } = require("express-validator");

exports.studentsValidator = [
  body("gender").notEmpty().withMessage("Name is required"),
  body("title").notEmpty().withMessage("title is required")
];
