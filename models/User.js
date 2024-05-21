module.exports = class UserModel {
  constructor(username) {
    this._id = Math.floor(Math.random() * 100).toString();
    this.username = username;
    this.exercises = [];
  }
};
