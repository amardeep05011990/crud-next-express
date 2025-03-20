const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
app.use(bodyParser.json());

// Swagger Setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'School Management System API',
    version: '1.0.0',
    description: 'A multi-tenant school management system API with CRUD operations, authentication, and authorization.',
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
        description: 'Enter JWT token to access secure endpoints',
      },
    },
  },
  security: [{ BearerAuth: [] }],
};

const swaggerOptions = {
  swaggerDefinition,
  apis: ['./sms.js'], // Update if using a different file structure
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);


// MongoDB Connection
mongoose
  .connect('mongodb://localhost:27017/school_management', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['siteowner', 'schooladmin', 'teacher', 'student'], required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'schools', required: true }, // Tenant-specific field
});

const User = mongoose.model('User', userSchema);

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
  } catch (err) {
    res.status(400).json({ status: 'error', message: 'Invalid token.' });
  }
};

// Middleware for Authorization
const authorizeWithPermissions = (action, permissionsMap) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const permissions = permissionsMap[userRole];
    if (!permissions || !permissions.includes(action)) {
      return res.status(403).json({ status: 'error', message: 'Forbidden. Access denied.' });
    }
    next();
  };
};


// ✅ **CRUD Generator with Swagger**
const createCRUDWithPermissions = (collectionName, schemaDefinition,   relationships = [], validationSchemas = {}, permissionsMap) => {
    // const schema = new mongoose.Schema(
    //   { ...schemaDefinition, schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'schools', required: true } },
    //   { timestamps: true }
    // );
    // const Model = mongoose.model(collectionName, schema);

     // ✅ **Dynamically Add Relationships to Schema**
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

    // **Ensure validationSchemas exist to prevent errors**
    const createSchema = validationSchemas.create ? validationSchemas.create.describe().keys : {};
    const updateSchema = validationSchemas.update ? validationSchemas.update.describe().keys : {};

    // ✅ **Swagger Documentation for CRUD**
    swaggerSpec.paths[`/api/${collectionName}`] = {
      get: { summary: `Get all ${collectionName}`, tags: [collectionName], responses: { 200: { description: `List of ${collectionName}` }, 400: { description: 'Bad request' } } },
      post: {
        summary: `Create a new ${collectionName}`,
        tags: [collectionName],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: createSchema } } } },
        responses: { 201: { description: `${collectionName} created successfully` }, 400: { description: 'Validation error' } },
      },
    };
    swaggerSpec.paths[`/api/${collectionName}/{id}`] = {
      get: { summary: `Get a ${collectionName} by ID`, tags: [collectionName], responses: { 200: { description: `${collectionName} details` }, 404: { description: 'Not found' } } },
      put: {
        summary: `Update a ${collectionName}`,
        tags: [collectionName],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: updateSchema } } } },
        responses: { 200: { description: `${collectionName} updated successfully` }, 404: { description: 'Not found' } },
      },
      delete: { summary: `Delete a ${collectionName}`, tags: [collectionName], responses: { 200: { description: `${collectionName} deleted successfully` }, 404: { description: 'Not found' } } },
    };

    // **CRUD Routes**
    app.post(`/api/${collectionName}`, authenticate, authorizeWithPermissions('create', permissionsMap), async (req, res) => {
      try {
        const item = new Model({ ...req.body, schoolId: req.user.schoolId });
        await item.save();
        res.status(201).json({ status: 'success', data: item });
      } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
      }
    });

    app.get(`/api/${collectionName}`, authenticate, authorizeWithPermissions('read', permissionsMap), async (req, res) => {
      try {
        const query = req.user.role === 'siteowner' ? Model.find() : Model.find({ schoolId: req.user.schoolId });
        res.json({ status: 'success', data: await query });
      } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
      }
    });

    app.put(`/api/${collectionName}/:id`, authenticate, authorizeWithPermissions('update', permissionsMap), async (req, res) => {
      try {
        const item = await Model.findOneAndUpdate({ _id: req.params.id, schoolId: req.user.schoolId }, req.body, { new: true });
        if (!item) return res.status(404).json({ status: 'error', message: 'Item not found' });
        res.json({ status: 'success', data: item });
      } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
      }
    });

    app.delete(`/api/${collectionName}/:id`, authenticate, authorizeWithPermissions('delete', permissionsMap), async (req, res) => {
      try {
        const item = await Model.findOneAndDelete({ _id: req.params.id, schoolId: req.user.schoolId });
        if (!item) return res.status(404).json({ status: 'error', message: 'Item not found' });
        res.json({ status: 'success', data: item });
      } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
      }
    });
};


// ✅ **Entity-Specific CRUD Definitions with Dynamic Relationships**

createCRUDWithPermissions(
    'schools',
    { 
      name: { type: String, required: true },
      address: { type: String, required: true }
    },
    [], // No relationships needed
    {},
    { siteowner: ['create', 'read', 'update', 'delete'], schooladmin: ['read'], teacher: [], student: [] }
  );
  
  createCRUDWithPermissions(
    'teachers',
    { 
      name: { type: String, required: true },
      subject: { type: String, required: true },
      schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'schools', required: true } // Each teacher belongs to a school
    },
    [{ field: 'schoolId', ref: 'schools', type: 'many-to-one' }], // Relationship to schools
    {},
    { siteowner: ['create', 'read', 'update', 'delete'], schooladmin: ['create', 'read', 'update', 'delete'], teacher: ['read'], student: [] }
  );
  
  createCRUDWithPermissions(
    'students',
    { 
      name: { type: String, required: true },
      grade: { type: String, required: true },
      schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'schools', required: true }, // Each student belongs to a school
      teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'teachers', required: true } // Each student has a teacher
    },
    [
      { field: 'schoolId', ref: 'schools', type: 'many-to-one' }, // Student belongs to a school
      { field: 'teacherId', ref: 'teachers', type: 'many-to-one' } // Student is assigned a teacher
    ],
    {},
    { siteowner: ['create', 'read', 'update', 'delete'], schooladmin: ['create', 'read', 'update', 'delete'], teacher: ['read'], student: ['read', 'update'] }
  );
  

// ✅ **Register Endpoint**
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
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: ['siteowner', 'schooladmin', 'teacher', 'student'] }
 *               schoolId: { type: string }
 *     responses:
 *       201: { description: User registered successfully }
 *       400: { description: Validation error }
 */
app.post('/api/register', async (req, res) => {
    const schema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      role: Joi.string().valid('siteowner', 'schooladmin', 'teacher', 'student').required(),
      schoolId: Joi.string().required(),
    });
  
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ status: 'error', message: error.details[0].message });
  
    const { name, email, password, role, schoolId } = req.body;
  
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ status: 'error', message: 'User already exists' });
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword, role, schoolId });
      await user.save();
  
      res.status(201).json({ status: 'success', message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Something went wrong' });
    }
  });
  
  // ✅ **Login Endpoint**
  /**
   * @swagger
   * /api/login:
   *   post:
   *     summary: Login a user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email: { type: string }
   *               password: { type: string }
   *     responses:
   *       200: { description: Login successful }
   *       400: { description: Invalid credentials }
   */
  app.post('/api/login', async (req, res) => {
    const schema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });
  
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ status: 'error', message: error.details[0].message });
  
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ status: 'error', message: 'Invalid email or password' });
  
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ status: 'error', message: 'Invalid email or password' });
  
      const token = jwt.sign({ id: user._id, role: user.role, schoolId: user.schoolId }, 'secretKey', { expiresIn: '1h' });
  
      res.json({ status: 'success', token });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Something went wrong' });
    }
  });
  
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start the Server
app.listen(3000, () => console.log('Server running at http://localhost:3000'));
