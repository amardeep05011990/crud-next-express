const fs = require('fs');
const path = require('path');

const schema = require('./schema.json');

const OUTPUT_DIR = path.join(__dirname, 'generated', 'forms');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

schema.collections.forEach((collection) => {
  const compName = `${capitalize(collection.name)}Form`;
  const filename = path.join(OUTPUT_DIR, `${compName}.jsx`);

const fields = collection.fields.map((field) => {
  const name = field.name;
  const type = field.type.toLowerCase();
  const validation = field.validation || {};
  const form = field.form || {};
  const input = form.input || "text";
  const grid = form.grid || 12;
  const options = form.options || [];

  let rules = [];

  if (validation.required?.value) {
    rules.push(`required: '${validation.required.message || `${name} is required`}'`);
  }
  if (validation.min?.value) {
    rules.push(`min: { value: ${validation.min.value}, message: '${validation.min.message || ''}' }`);
  }
  if (validation.max?.value) {
    rules.push(`max: { value: ${validation.max.value}, message: '${validation.max.message || ''}' }`);
  }
  if (validation.minLength?.value) {
    rules.push(`minLength: { value: ${validation.minLength.value}, message: '${validation.minLength.message || ''}' }`);
  }
  if (validation.maxLength?.value) {
    rules.push(`maxLength: { value: ${validation.maxLength.value}, message: '${validation.maxLength.message || ''}' }`);
  }

  let renderer = "";

  if (input === "select" || input === "autocomplete" || input === "multiselect") {
    const multiple = input === "multiselect" ? " multiple" : "";
    renderer = `
      <Controller
        name="${name}"
        control={control}
        defaultValue={${multiple ? "[]" : '""'}}
        rules={{ ${rules.join(", ")} }}
        render={({ field, fieldState }) => (
          <FormControl fullWidth>
            <InputLabel>${capitalize(name)}</InputLabel>
            <Select
              label="${capitalize(name)}"
              ${multiple ? "multiple" : ""}
              {...field}
              error={!!fieldState.error}
            >
              ${options.map((opt) => `<MenuItem value="${opt}">${opt}</MenuItem>`).join("\n")}
            </Select>
            {fieldState.error && <p style={{ color: 'red' }}>{fieldState.error.message}</p>}
          </FormControl>
        )}
      />
    `;
  } else if (input === "radio") {
    renderer = `
      <Controller
        name="${name}"
        control={control}
        defaultValue=""
        rules={{ ${rules.join(", ")} }}
        render={({ field, fieldState }) => (
          <FormControl component="fieldset">
            <Typography>${capitalize(name)}</Typography>
            <RadioGroup row {...field}>
              ${options.map((opt) => `<FormControlLabel value="${opt}" control={<Radio />} label="${opt}" />`).join("\n")}
            </RadioGroup>
            {fieldState.error && <p style={{ color: 'red' }}>{fieldState.error.message}</p>}
          </FormControl>
        )}
      />
    `;
  } else if (input === "checkbox") {
    renderer = `
      <Controller
        name="${name}"
        control={control}
        defaultValue={false}
        rules={{ ${rules.join(", ")} }}
        render={({ field, fieldState }) => (
          <FormControlLabel
            control={<Checkbox {...field} checked={field.value} />}
            label="${capitalize(name)}"
          />
        )}
      />
    `;
  } else {
    renderer = `
      <Controller
        name="${name}"
        control={control}
        defaultValue=""
        rules={{ ${rules.join(", ")} }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="${capitalize(name)}"
            variant="outlined"
            margin="normal"
            fullWidth
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
          />
        )}
      />
    `;
  }

  return `<Grid item xs={12} md={${grid}}>\n${renderer.trim()}\n</Grid>`;
});


  const componentCode = `
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const ${compName} = () => {
  const { control, handleSubmit, reset } = useForm();
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);

  const loadData = async () => {
    const res = await fetch('/api/${collection.name}');
    const json = await res.json();
    setData(json);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (formData) => {
    if (editId) {
      await fetch(\`/api/${collection.name}/\${editId}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } else {
      await fetch('/api/${collection.name}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    }

    reset();
    setEditId(null);
    loadData();
  };

  const handleEdit = (item) => {
    reset(item);
    setEditId(item._id);
  };

  const handleDelete = async (id) => {
    await fetch(\`/api/${collection.name}/\${id}\`, { method: 'DELETE' });
    loadData();
  };

  return (
    <Box p={3}>
      <Paper elevation={3} style={{ padding: 20 }}>
        <Typography variant="h5">${capitalize(collection.name)} Form</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          ${fields.join('\n')}
          <Button type="submit" variant="contained" color="primary">
            {editId ? 'Update' : 'Create'}
          </Button>
        </form>
      </Paper>

      <List>
        {data.map((item) => (
          <ListItem
            key={item._id}
            secondaryAction={
              <>
                <IconButton onClick={() => handleEdit(item)}><EditIcon /></IconButton>
                <IconButton onClick={() => handleDelete(item._id)}><DeleteIcon /></IconButton>
              </>
            }
          >
            <ListItemText primary={JSON.stringify(item)} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ${compName};
  `;

  fs.writeFileSync(filename, componentCode.trim(), 'utf-8');
});

console.log('✅ React CRUD form components generated in /generated/forms');
