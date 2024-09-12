const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });;

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, '../client')));

// Replace with your actual MongoDB connection string
const uri = process.env.MONGO_URI;
// Database connection
MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    app.locals.db = client.db('expenses');  // Correctly set db on app.locals
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });

// Route Definitions
const expenseRoutes = require('./routes/expenseRoutes');
app.use('/api/expenses', expenseRoutes);

// Serve index.html on the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
