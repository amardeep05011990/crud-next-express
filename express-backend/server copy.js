const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const ejs = require('ejs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.set('view engine', 'ejs');
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/crud_generator', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'));

// 🔹 User Schema & Model
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model('User', UserSchema);

// 🔹 JWT Authentication Middleware
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token.split(' ')[1], 'secretKey');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// 🔹 Dynamic CRUD Generator with UI Support
const createdModels = {};

const createCRUD = (collectionName, schemaDefinition, relationships = []) => {
  relationships.forEach(({ field, ref, type }) => {
    if (type === 'one-to-many') schemaDefinition[field] = [{ type: mongoose.Schema.Types.ObjectId, ref }];
    else schemaDefinition[field] = { type: mongoose.Schema.Types.ObjectId, ref };
  });

  const schema = new mongoose.Schema(schemaDefinition, { timestamps: true });
  const Model = mongoose.model(collectionName, schema);
  createdModels[collectionName] = { Model, schemaDefinition, relationships };

  // ✅ CRUD Endpoints
  app.post(`/api/${collectionName}`, authenticate, async (req, res) => {
    try {
      const item = new Model(req.body);
      await item.save();
      res.status(201).json({ status: 'success', data: item });
    } catch (err) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  });

  app.get(`/api/${collectionName}`, authenticate, async (req, res) => {
    try {
      const items = await Model.find().populate(relationships.map(r => r.field));
      res.json({ status: 'success', data: items });
    } catch (err) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  });

  app.put(`/api/${collectionName}/:id`, authenticate, async (req, res) => {
    try {
      const item = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.json({ status: 'success', data: item });
    } catch (err) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  });

  app.delete(`/api/${collectionName}/:id`, authenticate, async (req, res) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      res.json({ status: 'success', data: item });
    } catch (err) {
      res.status(400).json({ status: 'error', message: err.message });
    }
  });

  // 🔹 Generate Dynamic Forms UI for CRUD
  app.get(`/ui/${collectionName}`, authenticate, async (req, res) => {
    res.render('crud-ui', { collectionName, schemaDefinition, relationships });
  });
};

// 🔹 Render Home Page
app.get('/', (req, res) => res.render('index'));

// 🔹 Generate CRUD API from UI
app.post('/generate-crud', authenticate, async (req, res) => {
  const { collectionName, fields, relationships } = req.body;
  const schemaDefinition = {};

  fields.forEach(f => schemaDefinition[f.name] = { type: f.type, required: f.required });

  createCRUD(collectionName, schemaDefinition, relationships);
  res.json({ status: 'success', message: `CRUD for ${collectionName} created successfully!` });
});

// 🔹 Register & Login
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await new User({ username, password: hashedPassword }).save();
  res.json({ message: 'User registered successfully' });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, 'secretKey', { expiresIn: '1h' });
  res.json({ token });
});

// 🔹 Start Server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
