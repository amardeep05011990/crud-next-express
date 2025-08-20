const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

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

// Middleware for Authentication
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], 'secretKey');
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ status: 'error', message: 'Invalid token.' });
  }
};

// Middleware for Authorization with Permissions
const authorizeWithPermissions = (action, permissionsMap) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const permissions = permissionsMap[userRole];
    if (!permissions || !permissions.includes(action)) {
      return res.status(403).json({ status: 'error', message: 'Forbidden. You do not have access to this resource.' });
    }
    next();
  };
};

// Middleware for Validation using Joi
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        details: error.details.map((detail) => ({
          field: detail.path[0],
          message: detail.message,
        })),
      });
    }
    next();
  };
};

// Function to Generate CRUD with Pagination, Search, Filter, and Permissions
const createCRUDWithPermissions = (
  collectionName,
  schemaDefinition,
  relationships = [],
  validationSchemas = {},
  permissionsMap = {}
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
  app.post(
    `/api/${collectionName}`,
    authenticate,
    authorizeWithPermissions('create', permissionsMap),
    validateRequest(validationSchemas.create),
    async (req, res) => {
      try {
        const item = new Model(req.body);
        await item.save();
        res.status(201).json({ status: 'success', data: item });
      } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
      }
    }
  );

  // READ (with pagination, search, and filter)
  app.get(
    `/api/${collectionName}`,
    authenticate,
    authorizeWithPermissions('read', permissionsMap),
    async (req, res) => {
      try {
        const { page = 1, limit = 10, search, ...filters } = req.query;

        const query = Model.find();

        // Apply filters dynamically
        Object.keys(filters).forEach((key) => {
          query.where(key).equals(filters[key]);
        });

        // Apply search functionality
        if (search) {
          const searchFields = Object.keys(schemaDefinition).filter(
            (key) => schemaDefinition[key].type === String
          );
          const searchQuery = searchFields.map((field) => ({
            [field]: { $regex: search, $options: 'i' },
          }));
          query.or(searchQuery);
        }

        // Apply pagination
        const totalItems = await Model.countDocuments(query);
        const items = await query
          .skip((page - 1) * limit)
          .limit(Number(limit))
          .populate(relationships.map((relation) => relation.field));

        res.json({
          status: 'success',
          data: items,
          meta: {
            total: totalItems,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(totalItems / limit),
          },
        });
      } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
      }
    }
  );

  // UPDATE
  app.put(
    `/api/${collectionName}/:id`,
    authenticate,
    authorizeWithPermissions('update', permissionsMap),
    validateRequest(validationSchemas.update),
    async (req, res) => {
      try {
        const updatedItem = await Model.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true,
        }).populate(relationships.map((rel) => rel.field));

        if (!updatedItem) {
          return res.status(404).json({ status: 'error', message: 'Item not found' });
        }

        res.json({ status: 'success', data: updatedItem });
      } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
      }
    }
  );

  // DELETE
  app.delete(
    `/api/${collectionName}/:id`,
    authenticate,
    authorizeWithPermissions('delete', permissionsMap),
    async (req, res) => {
      try {
        const deletedItem = await Model.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
          return res.status(404).json({ status: 'error', message: 'Item not found' });
        }
        res.json({ status: 'success', data: deletedItem });
      } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
      }
    }
  );
};

// // Define Joi validation schemas for Blog
const blogValidationSchemas = {
  create: Joi.object({
    title: Joi.string().required().messages({ 'string.empty': 'Title is required.' }),
    content: Joi.string().required().messages({ 'string.empty': 'Content is required.' }),
  }),
  update: Joi.object({
    title: Joi.string().optional(),
    content: Joi.string().optional(),
  }),
};

// Define blog permissions
const blogPermissions = {
  admin: ['create', 'read', 'update', 'delete'],
  editor: ['create', 'read', 'update'],
  user: ['read'],
};

// Create Blog CRUD
// createCRUDWithPermissions(
//   'blogs',
//   {
//     title: { type: String, required: true },
//     content: { type: String, required: true },
//     author: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
//   },
//   [{ field: 'author', ref: 'users', type: 'many-to-one' }],
//   blogValidationSchemas,
//   blogPermissions
// );

// User Validation Schemas
const userValidationSchemas = {
    create: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      role: Joi.string().valid('admin', 'editor', 'user').optional(),
    }),
    update: Joi.object({
      name: Joi.string().optional(),
      email: Joi.string().email().optional(),
      password: Joi.string().min(6).optional(),
      role: Joi.string().valid('admin', 'editor', 'user').optional(),
    }),
  };
  
  // Post Validation Schemas
  const postValidationSchemas = {
    create: Joi.object({
      title: Joi.string().required(),
      content: Joi.string().required(),
      author: Joi.string().required(), // Author is the user ID
    }),
    update: Joi.object({
      title: Joi.string().optional(),
      content: Joi.string().optional(),
    }),
  };
  
  // Comment Validation Schemas
  const commentValidationSchemas = {
    create: Joi.object({
      content: Joi.string().required(),
      post: Joi.string().required(), // Post ID
      author: Joi.string().required(), // Author is the user ID
    }),
    update: Joi.object({
      content: Joi.string().optional(),
    }),
  };
  
  // Permissions for Users, Posts, and Comments
  const userPermissions = {
    admin: ['create', 'read', 'update', 'delete'],
    user: ['read'],
  };
  
  const postPermissions = {
    admin: ['create', 'read', 'update', 'delete'],
    editor: ['create', 'read', 'update'],
    user: ['read'],
  };
  
  const commentPermissions = {
    admin: ['create', 'read', 'update', 'delete'],
    editor: ['create', 'read', 'update', 'delete'],
    user: ['read', 'create'],
  };
  
  // Create CRUD for Users
  createCRUDWithPermissions(
    'users',
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['admin', 'editor', 'user'], default: 'user' },
    },
    [],
    userValidationSchemas,
    userPermissions
  );
  
  // Create CRUD for Blogs
  createCRUDWithPermissions(
    'blogs',
    {
      title: { type: String, required: true },
      content: { type: String, required: true },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    },
    [{ field: 'author', ref: 'users', type: 'many-to-one' }],
    blogValidationSchemas,
    blogPermissions
  );
  
  // Create CRUD for Posts
  createCRUDWithPermissions(
    'posts',
    {
      title: { type: String, required: true },
      content: { type: String, required: true },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
      blog: { type: mongoose.Schema.Types.ObjectId, ref: 'blogs', required: true },
    },
    [
      { field: 'author', ref: 'users', type: 'many-to-one' },
      { field: 'blog', ref: 'blogs', type: 'many-to-one' },
    ],
    postValidationSchemas,
    postPermissions
  );
  
  // Create CRUD for Comments
  createCRUDWithPermissions(
    'comments',
    {
      content: { type: String, required: true },
      post: { type: mongoose.Schema.Types.ObjectId, ref: 'posts', required: true },
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    },
    [
      { field: 'post', ref: 'posts', type: 'many-to-one' },
      { field: 'author', ref: 'users', type: 'many-to-one' },
    ],
    commentValidationSchemas,
    commentPermissions
  );
  
// Start the Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
