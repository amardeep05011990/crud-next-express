
const { body } = require("express-validator");

exports.userpostsValidator = [
  body("tite").notEmpty().withMessage("tite is required")
];
