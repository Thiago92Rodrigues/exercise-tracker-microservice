const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const ExerciseModel = require('./models/Exercise');
const UserModel = require('./models/User');

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// add user endpoint
app.post('/api/exercise/new-user', async (req, res) => {
  const { username } = req.body;
  const user = await UserModel.create({ username });
  res.status(204).json(user);
});

// get all users endpoint
app.get('api/exercise/users', async (req, res) => {
  const users = await UserModel.find();
  res.status(200).json(users);
})

// add exercise endpoint
// if no date supplied use current date
app.post('/api/exercise/add', async (req, res) => {
  const { userId, description, duration } = req.body;
  let { date } = req.body;
  if (date === undefined) date = new Date();
  const exercise = await ExerciseModel.create({
    description,
    duration,
    date,
    user: userId
  });
  res.status(204).json(exercise);
});

// get all exercises from a given user
// it is also possible to retrieve part of the log
// passing along optional parameters of from & to or limit.
app.get('/api/exercise/log', async (req, res) => {
  const { userId } = req.body;
  const { from, to, limit } = req.body;

  let exercises;
  if (from !== undefined && to !== undefined) {
    exercises = await ExerciseModel.find({
      user: userId,
      date: { $gte: from, $lte: to }
    });
  } else if (limit !== undefined) {
    exercises = await ExerciseModel.find({
      user: userId,
      date: { $lte: limit }
    });
  } else {
    exercises = await ExerciseModel.find({ 
      user: userId
    });
  }

  res.status(200).json({ exercises });
});


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
