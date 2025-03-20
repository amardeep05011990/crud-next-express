const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MONGO_URI, PORT } = require('./config');
const authRoutes = require('./routes/auth');
const dynamicCrudRoutes = require('./routes/dynamicCrud');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/api/auth', authRoutes);
app.use('/api/crud', dynamicCrudRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
