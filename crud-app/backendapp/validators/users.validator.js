
const { body } = require("express-validator");

exports.usersValidator = [
  body("name").notEmpty().withMessage("name is required"),
  body("email").notEmpty().withMessage("email is required")
];
