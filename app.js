const express = require('express');
require('express-async-errors');

const app = express();

app.use(express.urlencoded({
  extended: true
}));

app.use(function (req, res) {
  res.send('LTWEB2')
})

const PORT = 3000;
app.listen(PORT, function () {
  console.log(`Server is running at http://localhost:${PORT}`);
})