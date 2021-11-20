const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./db/db');
const socket = require('socket.io');

const app = express();

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '/client/build')));
app.use(cors());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/db', (req, res) => {
  res.send(db.tasks);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '/client/build/index.html'));
});

app.use((req, res) => {
  res.status(404).send('404 not found...');
})

const server = app.listen(process.env.PORT || 8000, () => {
  console.log('Server is running on port: 8000')
});
// ????
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  }
}); // server zapisany pod stala

io.on('connection', (socket) => {
  console.log('New client! It\'s id - ' + socket.id);

  socket.emit('updateData', db.tasks);

  socket.on('addTask', (task) => {
    console.log('Dodano do tablicy: ', task);
    db.tasks.push(task);
    socket.broadcast.emit('addTask', task);
  });

  socket.on('removeTask', (taskId) => {
    console.log('Usunieto z tablicy task o ID: ', taskId);
    db.tasks.splice(taskId, 1);
    socket.broadcast.emit('removeTask', taskId);
  });


});
