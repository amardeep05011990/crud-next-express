const express = require('express');
const app = express();
const port = process.env.PORT || 3000;


app.get('/', (req, res) => {
  res.send('helo  node ');
});

app.get('/hello', (req, res) => {
  res.send('Hello from Node.js microservice!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
