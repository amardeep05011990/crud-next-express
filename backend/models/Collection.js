const mongoose = require('mongoose');

const CollectionSchema = new mongoose.Schema({
  name: String,
  schemaDefinition: Object,
  relationships: Array,
});

module.exports = mongoose.model('Collection', CollectionSchema);
