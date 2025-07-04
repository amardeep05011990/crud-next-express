const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const createdModels = {};

function createCRUD(collectionName, schemaDefinition) {
  if (!createdModels[collectionName]) {
    const schema = new mongoose.Schema(schemaDefinition, { timestamps: true });
    createdModels[collectionName] = mongoose.model(collectionName, schema);
  }
}

router.post('/:collectionName', async (req, res) => {
  const { collectionName } = req.params;
  const { schemaDefinition } = req.body;
  createCRUD(collectionName, schemaDefinition);
  res.json({ status: 'success', message: `${collectionName} registered` });
});

module.exports = router;
