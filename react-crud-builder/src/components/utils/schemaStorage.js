// utils/schemaStorage.js

export const saveSchemaToLocalStorage = (schema) => {
  localStorage.setItem('flow-schema', JSON.stringify(schema));
};

export const loadSchemaFromLocalStorage = () => {
  const data = localStorage.getItem('flow-schema');
  return data ? JSON.parse(data) : null;
};
