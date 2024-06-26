const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, '/')));
app.use(express.json());
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});


const fs = require('fs');

// Endpoint to get data from the database
app.get('/database', (req, res) => {
  fs.readFile('database.json', 'utf8', (err, data) => {
    // Check return for errors and output to console
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred while reading the database.');
    } else {
      res.send(JSON.parse(data));
    }
  });
});

// Endpoint to write data to the database
app.post('/database', (req, res) => {
  const newData = req.body; // This assumes that you're sending JSON data in the request body
  fs.writeFile('database.json', JSON.stringify(newData, null, 2), (err) => {
    // Check return for errors and output to console
    if (err) {
      console.error(err);
      res.status(500).send('An error occurred while writing to the database.');
    } else {
      res.send('Data successfully written to the database.');
    }
  });
});

app.post('/github-webhook', (req, res) => {
  // Verify that the request is from GitHub
  if (req.headers['x-hub-signature-256'] === crypto.createHmac('sha256', helloworld).update(JSON.stringify(req.body)).digest('hex')) {
    // Pull the latest changes and restart the application
    execSync('git pull origin main && npm install && pm2 restart main.js');
    res.sendStatus(200);
  } else {
    res.sendStatus(403);
  }
});