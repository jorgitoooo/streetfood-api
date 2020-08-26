const validator = require("validator");

exports.validPasswordConfirm = function validPasswordConfirm(pwd) {
  // Only runs on create() and save()
  return this.password === pwd;
};

exports.isEmail = validator.isEmail;
