const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('./dist'));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, './build', 'index.html'));
});

app.listen(process.env.PORT || 8055);

console.log("Application running on",process.env.PORT || 8055);