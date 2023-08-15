const express = require('express');
var cors = require('cors')
const app = express();
const path = require('path');
const PORT = 8009;

require('dotenv').config();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const review  = require('./controllers/review');
app.use('/controller', review);
const movieNameRoute = require('./routes/movieName');
app.use('/movieName', movieNameRoute);
const movieNamesRoute = require('./routes/movieNames');
app.use('/movieNames', movieNamesRoute);

//Please don't delete this health API
app.use('/api/health', (req, res) => {
    res.send('Hello Autopilot');
  });

app.listen(PORT, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

module.exports = app;