const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const config = require('./db');
const path=require("path");

const documents = require('./routes/document'); 
const members = require('./routes/member'); 
const histories = require('./routes/history'); 
const emails = require('./routes/email'); 


mongoose.connect(config.DB, { useNewUrlParser: true }).then(
    () => {console.log('Database is connected') },
    err => { console.log('Can not connect to the database'+ err)}
);

const app = express();
app.use(passport.initialize());
require('./passport')(passport);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,"public")));
app.use('/api/documents', documents);
app.use('/api/members', members);
app.use('/api/histories', histories);
app.use('/api/emails', emails);

app.get('/', function(req, res) {
    res.send('hello');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
    console.log(`PATH`, path.dirname(require.main.filename));
});