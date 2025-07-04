const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const swaggerUI = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

// Initialize Express App
const app = express();
app.use(bodyParser.json());

// Swagger Configuration
// Swagger Configuration
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'Dynamic CRUD Generator API',
      version: '1.0.0',
      description: 'API documentation for dynamic CRUD operations',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token to access secure endpoints',
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  };
const swaggerOptions = {
  swaggerDefinition,
  apis: ['./index.js'], // JSDoc annotations in this file
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Serve Swagger Documentation
// app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

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

/**
 * Adds Swagger paths for a specific collection
 * @param {string} collectionName - Name of the collection
 */
// const addSwaggerPaths = (collectionName) => {
//   swaggerSpec.paths = swaggerSpec.paths || {};

//   swaggerSpec.paths[`/api/${collectionName}`] = {
//     get: {
//       summary: `Retrieve all ${collectionName}`,
//       tags: [collectionName],
//       parameters: [
//         { name: 'page', in: 'query', schema: { type: 'integer' }, description: 'Page number' },
//         { name: 'limit', in: 'query', schema: { type: 'integer' }, description: 'Number of items per page' },
//         { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term' },
//       ],
//       responses: {
//         200: { description: `List of ${collectionName}` },
//         400: { description: 'Bad request' },
//       },
//     },
//     post: {
//       summary: `Create a new ${collectionName}`,
//       tags: [collectionName],
//       requestBody: {
//         required: true,
//         content: {
//           'application/json': {
//             schema: { type: 'object', properties: {} },
//           },
//         },
//       },
//       responses: {
//         201: { description: `${collectionName} created successfully` },
//         400: { description: 'Validation error' },
//       },
//     },
//   };

//   swaggerSpec.paths[`/api/${collectionName}/{id}`] = {
//     get: {
//       summary: `Retrieve a single ${collectionName} by ID`,
//       tags: [collectionName],
//       parameters: [
//         { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID of the item' },
//       ],
//       responses: {
//         200: { description: `${collectionName} details` },
//         404: { description: `${collectionName} not found` },
//       },
//     },
//     put: {
//       summary: `Update a ${collectionName}`,
//       tags: [collectionName],
//       parameters: [
//         { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID of the item' },
//       ],
//       requestBody: {
//         required: true,
//         content: {
//           'application/json': {
//             schema: { type: 'object', properties: {} },
//           },
//         },
//       },
//       responses: {
//         200: { description: `${collectionName} updated successfully` },
//         404: { description: `${collectionName} not found` },
//       },
//     },
//     delete: {
//       summary: `Delete a ${collectionName}`,
//       tags: [collectionName],
//       parameters: [
//         { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID of the item' },
//       ],
//       responses: {
//         200: { description: `${collectionName} deleted successfully` },
//         404: { description: `${collectionName} not found` },
//       },
//     },
//   };
// };

const addSwaggerPaths = (collectionName, validationSchemas) => {
  swaggerSpec.paths = swaggerSpec.paths || {};

  // Convert Joi schema to Swagger properties
  const convertJoiToSwaggerProperties = (joiSchema) => {
    if (!joiSchema) return { properties: {}, required: [] };

    const properties = {};
    const required = [];

    // Use Joi's `describe` method to extract schema details
    Object.entries(joiSchema.describe().keys).forEach(([key, details]) => {
      const property = { type: details.type };

      if (details.flags && details.flags.presence === 'required') {
        required.push(key);
      }

      if (details.rules) {
        details.rules.forEach((rule) => {
          if (rule.name === 'min') property.minLength = rule.args.limit;
          if (rule.name === 'max') property.maxLength = rule.args.limit;
          if (rule.name === 'pattern') property.pattern = rule.args.regex.toString();
        });
      }

      properties[key] = property;
    });

    return { properties, required };
  };

  // Convert schemas for `create` and `update`
  const createSchema = convertJoiToSwaggerProperties(validationSchemas.create);
  const updateSchema = convertJoiToSwaggerProperties(validationSchemas.update);

  swaggerSpec.paths[`/api/${collectionName}`] = {
    get: {
      summary: `Retrieve all ${collectionName}`,
      tags: [collectionName],
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer' }, description: 'Page number' },
        { name: 'limit', in: 'query', schema: { type: 'integer' }, description: 'Number of items per page' },
        { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search term' },
      ],
      responses: {
        200: { description: `List of ${collectionName}` },
        400: { description: 'Bad request' },
      },
    },
    post: {
      summary: `Create a new ${collectionName}`,
      tags: [collectionName],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: createSchema.properties,
              required: createSchema.required,
            },
          },
        },
      },
      responses: {
        201: { description: `${collectionName} created successfully` },
        400: { description: 'Validation error' },
      },
    },
  };

  swaggerSpec.paths[`/api/${collectionName}/{id}`] = {
    get: {
      summary: `Retrieve a single ${collectionName} by ID`,
      tags: [collectionName],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID of the item' },
      ],
      responses: {
        200: { description: `${collectionName} details` },
        404: { description: `${collectionName} not found` },
      },
    },
    put: {
      summary: `Update a ${collectionName}`,
      tags: [collectionName],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID of the item' },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: updateSchema.properties,
              required: updateSchema.required,
            },
          },
        },
      },
      responses: {
        200: { description: `${collectionName} updated successfully` },
        404: { description: `${collectionName} not found` },
      },
    },
    delete: {
      summary: `Delete a ${collectionName}`,
      tags: [collectionName],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'ID of the item' },
      ],
      responses: {
        200: { description: `${collectionName} deleted successfully` },
        404: { description: `${collectionName} not found` },
      },
    },
  };
};



/**
 * Function to Generate CRUD Endpoints
 * @param {string} collectionName - The name of the collection
 * @param {object} schemaDefinition - The Mongoose schema definition
 * @param {array} relationships - Array of relationship objects
 * @param {object} validationSchemas - Joi validation schemas
 * @param {object} permissionsMap - Role-based permissions
 */
const createCRUDWithPermissions = (
  collectionName,
  schemaDefinition,
  relationships = [],
  validationSchemas = {},
  permissionsMap = {}
) => {
  // Add Swagger Documentation
  addSwaggerPaths(collectionName, validationSchemas);

  // Create the Mongoose schema and model
  relationships.forEach((relation) => {
    const { field, ref, type } = relation;

    if (!field || !ref || !type) {
      throw new Error(`Invalid relationship definition: ${JSON.stringify(relation)}`);
    }

    if (type === 'one-to-many') {
      schemaDefinition[field] = [{ type: mongoose.Schema.Types.ObjectId, ref }];
    } else if (type === 'many-to-one' || type === 'one-to-one') {
      schemaDefinition[field] = { type: mongoose.Schema.Types.ObjectId, ref };
    } else if (type === 'many-to-many') {
      schemaDefinition[field] = [{ type: mongoose.Schema.Types.ObjectId, ref }];
    } else {
      throw new Error(`Unsupported relationship type: ${type}`);
    }
  });

  const schema = new mongoose.Schema(schemaDefinition, { timestamps: true });
  relationships.forEach((relation) => schema.index({ [relation.field]: 1 }));
  const Model = mongoose.model(collectionName, schema);

  // CREATE
  app.post(
    `/api/${collectionName}`,
    authenticate,
    authorizeWithPermissions('create', permissionsMap),
    validateRequest(validationSchemas.create),
    async (req, res) => {
      try {
        const item = new Model({
          ...req.body,
          userId: req.user.id, // Automatically set userId as tenant ID
        });
        await item.save();
        res.status(201).json({ status: 'success', data: item });
      } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
      }
    }
  );

  // READ
  app.get(
    `/api/${collectionName}`,
    authenticate,
    authorizeWithPermissions('read', permissionsMap),
    async (req, res) => {
      try {
        const { page = 1, limit = 10, search, ...filters } = req.query;

        // Site admin can fetch all data; others see only their tenant's data
        const query = req.user.role === 'siteadmin'
          ? Model.find()
          : Model.find({ userId: req.user.id });

        Object.keys(filters).forEach((key) => query.where(key).equals(filters[key]));

        if (search) {
          const searchFields = Object.keys(schemaDefinition).filter(
            (key) => schemaDefinition[key].type === String
          );
          const searchQuery = searchFields.map((field) => ({
            [field]: { $regex: search, $options: 'i' },
          }));
          query.or(searchQuery);
        }

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
        const updatedItem = await Model.findOneAndUpdate(
          { _id: req.params.id, userId: req.user.id }, // Ensure tenant ownership with userId
          req.body,
          { new: true, runValidators: true }
        ).populate(relationships.map((relation) => relation.field));

        if (!updatedItem) {
          return res.status(404).json({ status: 'error', message: 'Item not found or not authorized' });
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
        const deletedItem = await Model.findOneAndDelete({
          _id: req.params.id,
          userId: req.user.id, // Ensure tenant ownership with userId
        });

        if (!deletedItem) {
          return res.status(404).json({ status: 'error', message: 'Item not found or not authorized' });
        }

        res.json({ status: 'success', data: deletedItem });
      } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
      }
    }
  );
};


// // Define Validation Schemas and Permissions for Users, Blogs, Posts, Comments
// const userValidationSchemas = { /* Joi validation */ };
// const blogValidationSchemas = { /* Joi validation */ };
// const postValidationSchemas = { /* Joi validation */ };
// const commentValidationSchemas = { /* Joi validation */ };

// const userPermissions = { /* Permissions */ };
// const blogPermissions = { /* Permissions */ };
// const postPermissions = { /* Permissions */ };
// const commentPermissions = { /* Permissions */ };

// // Create CRUD Endpoints
// createCRUDWithPermissions('users', { /* Schema */ }, [], userValidationSchemas, userPermissions);
// createCRUDWithPermissions('blogs', { /* Schema */ }, [], blogValidationSchemas, blogPermissions);
// createCRUDWithPermissions('posts', { /* Schema */ }, [], postValidationSchemas, postPermissions);
// createCRUDWithPermissions('comments', { /* Schema */ }, [], commentValidationSchemas, commentPermissions);

// Define Joi validation schemas for Blog
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
  //     userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  //   },
  //   [{ field: 'userId', ref: 'users', type: 'many-to-one' }],
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
        userId: Joi.string().required(), // userId is the user ID
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
        userId: Joi.string().required(), // userId is the user ID
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
      {        name: { type: String, required: true },
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
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
      },
      [{ field: 'userId', ref: 'users', type: 'many-to-one' }],
      blogValidationSchemas,
      blogPermissions
    );
    
    // Create CRUD for Posts
    createCRUDWithPermissions(
      'posts',
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
        blog: { type: mongoose.Schema.Types.ObjectId, ref: 'blogs', required: true },
      },
      [
        { field: 'userId', ref: 'users', type: 'many-to-one' },
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
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
      },
      [
        { field: 'post', ref: 'posts', type: 'many-to-one' },
        { field: 'userId', ref: 'users', type: 'many-to-one' },
      ],
      commentValidationSchemas,
      commentPermissions
    );



//     // User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'editor', 'user'], default: 'user' },
  });
  
  // Define the User model
  const User = mongoose.model('User', userSchema);
  
        // Register Endpoint
/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
app.post('/api/register', async (req, res) => {
    const schema = Joi.object({
      name: Joi.string(),
      email: Joi.string().required(),//Joi.string().email().required(),
      password: Joi.string().min(6).required(),
    });
  
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
  
    const { name, email, password } = req.body;
  
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ status: 'error', message: 'User already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword });
      await user.save();
  
      res.status(201).json({ status: 'success', message: 'User registered successfully' });
    } catch (err) {
      console.error('Error during registration:', err); // Log error details
      res.status(500).json({ status: 'error', message: 'Something went wrong' });
    }
  });
  
  
  // Login Endpoint
  /**
   * @swagger
   * /api/login:
   *   post:
   *     summary: Log in as an existing user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful
   *       400:
   *         description: Invalid credentials
   */
  app.post('/api/login', async (req, res) => {
    const schema = Joi.object({
      email: Joi.string().required(),//Joi.string().email().required(),
      password: Joi.string().required(),
    });
  
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ status: 'error', message: error.details[0].message });
    }
  
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ status: 'error', message: 'Invalid email or password' });
      }
  
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ status: 'error', message: 'Invalid email or password' });
      }
  
      const token = jwt.sign({ id: user._id, role: user.role }, 'secretKey', { expiresIn: '1h' });
  
      res.json({ status: 'success', token });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Something went wrong' });
    }
  });
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Start the Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
