
const { body } = require("express-validator");

exports.assignmentsValidator = [
  body("title").notEmpty().withMessage("title is required")
];
