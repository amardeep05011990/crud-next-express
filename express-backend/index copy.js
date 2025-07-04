const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Initialize Express App
const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect('REMOVED_SECRET', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// Function to Generate Dynamic CRUD with Relationships
const createCRUDWithRelations = (
  collectionName,
  schemaDefinition,
  relationships = []
) => {
  // Extend Schema with Relationships
  relationships.forEach((relation) => {
    const { field, ref, type } = relation;
    if (type === 'one-to-many') {
      schemaDefinition[field] = [{ type: mongoose.Schema.Types.ObjectId, ref }];
    } else if (type === 'many-to-one' || type === 'one-to-one') {
      schemaDefinition[field] = { type: mongoose.Schema.Types.ObjectId, ref };
    } else if (type === 'many-to-many') {
      schemaDefinition[field] = [{ type: mongoose.Schema.Types.ObjectId, ref }];
    }
  });

  // Create a Mongoose Schema
  const schema = new mongoose.Schema(schemaDefinition);

  // Create a Mongoose Model
  const Model = mongoose.model(collectionName, schema);

  // CRUD Routes

  // CREATE
  app.post(`/api/${collectionName}`, async (req, res) => {
    try {
      const item = new Model(req.body);
      await item.save();
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // READ (with relationships)
  app.get(`/api/${collectionName}`, async (req, res) => {
    try {
      const query = Model.find();

      // Populate relationships dynamically
      relationships.forEach((relation) => {
        query.populate(relation.field);
      });

      const items = await query.exec();
      res.json(items);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // UPDATE
  app.put(`/api/${collectionName}/:id`, async (req, res) => {
    try {
      const updatedItem = await Model.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate(relationships.map((rel) => rel.field));

      if (!updatedItem) return res.status(404).json({ error: 'Item not found' });
      res.json(updatedItem);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // DELETE
  app.delete(`/api/${collectionName}/:id`, async (req, res) => {
    try {
      const deletedItem = await Model.findByIdAndDelete(req.params.id);
      if (!deletedItem) return res.status(404).json({ error: 'Item not found' });
      res.json(deletedItem);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
};

// Example Usage

// Define a `users` schema with relations to `posts` and `comments`
createCRUDWithRelations(
  'users',
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  [
    { field: 'posts', ref: 'posts', type: 'one-to-many' },
    { field: 'comments', ref: 'comments', type: 'one-to-many' },
  ]
);

// Define a `posts` schema with relations to `users` and `comments`
createCRUDWithRelations(
  'posts',
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
  },
  [
    { field: 'author', ref: 'users', type: 'many-to-one' },
    { field: 'comments', ref: 'comments', type: 'one-to-many' },
  ]
);

// Define a `comments` schema with relations to `users` and `posts`
createCRUDWithRelations(
  'comments',
  {
    text: { type: String, required: true },
  },
  [
    { field: 'author', ref: 'users', type: 'many-to-one' },
    { field: 'post', ref: 'posts', type: 'many-to-one' },
  ]
);

// Start the Server
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
