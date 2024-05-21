const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const User = require("./models/User");
const Exercise = require("./models/Exercise");

const users = [];

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// add user endpoint
app.post("/api/users", async (req, res) => {
  const { username } = req.body;
  const user = new User(username);
  users.push(user);
  return res.status(201).json({
    _id: user._id,
    username: user.username,
  });
});

// get all users endpoint
app.get("/api/users", async (req, res) => {
  return res.status(200).json(users);
});

// add exercise endpoint
// if no date supplied use current date
app.post("/api/users/:_id/exercises", async (req, res) => {
  const { _id: userId } = req.params;
  const { description, duration } = req.body;
  var { date } = req.body;
  if (date === undefined) date = new Date();
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    if (user._id == userId) {
      const exercise = new Exercise(description, duration, date);
      user.exercises.push(exercise);
      return res.status(201).json({
        _id: user._id,
        username: user.username,
        exercise,
      });
    }
  }
  return res.status(400).json({ message: "User not found" });
});

// get all exercises from a given user
// it is also possible to retrieve part of the log
// passing along optional parameters of from & to or limit.
app.get("/api/users/:_id/logs", async (req, res) => {
  const { _id: userId } = req.params;
  const { from, to, limit } = req.query;

  const limitFilter = limit != undefined;
  const dateFilter = from != undefined && to != undefined;
  var startDate, endDate;
  if (dateFilter) {
    startDate = new Date(Date.parse(from));
    endDate = new Date(Date.parse(to));
  }

  const result = [];
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    if (user._id == userId) {
      for (let j = 0; j < user.exercises.length; j++) {
        const exercise = user.exercises[j];
        if (limitFilter && result.length >= limit) {
          break;
        }
        if (!dateFilter) {
          result.push(exercise);
        } else {
          if (exercise.date > startDate && exercise.date < endDate) {
            result.push(exercise);
          }
        }
      }
      return res.status(200).json({
        _id: user._id,
        username: user.username,
        count: result.length,
        log: result,
      });
    }
  }
  return res.status(400).json({ message: "User not found" });
});

// Not found middleware
app.use((req, res, next) => {
  return next({ status: 404, message: "not found" });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
