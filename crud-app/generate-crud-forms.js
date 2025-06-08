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
  TextField, Button, Typography, Box, Paper, Grid,
  FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, FormControlLabel, Radio, RadioGroup, Checkbox,
  Table, TableHead, TableBody, TableRow, TableCell, TablePagination,
  IconButton, InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';

const ${compName} = () => {
  const { control, handleSubmit, reset } = useForm();
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    const res = await fetch(\`/api/${collection.name}?page=\${page + 1}&limit=\${rowsPerPage}&search=\${search}\`);
    const json = await res.json();
    setData(json.items || []);
    setTotal(json.total || 0);
  };

  useEffect(() => {
    loadData();
  }, [page, rowsPerPage, search]);

  const onSubmit = async (formData) => {
    const url = editId ? \`/api/${collection.name}/\${editId}\` : '/api/${collection.name}';
    const method = editId ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setOpen(false);
    reset();
    setEditId(null);
    loadData();
  };

  const handleEdit = (item) => {
    reset(item);
    setEditId(item._id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    await fetch(\`/api/${collection.name}/\${id}\`, { method: 'DELETE' });
    loadData();
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  return (
    <Box p={3}>
      <Paper elevation={3} style={{ padding: 20, marginBottom: 20 }}>
        <Typography variant="h5">${capitalize(collection.name)} List</Typography>
        <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
          <TextField
            placeholder="Search..."
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          <Button variant="contained" color="primary" onClick={() => { reset(); setEditId(null); setOpen(true); }}>
            Create New
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              ${collection.fields.map((f) => `<TableCell>${capitalize(f.name)}</TableCell>`).join("\n")}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item._id}>
                ${collection.fields.map((f) => `<TableCell>{Array.isArray(item.${f.name}) ? item.${f.name}.join(', ') : item.${f.name}}</TableCell>`).join("\n")}
                <TableCell>
                  <IconButton onClick={() => handleEdit(item)}><EditIcon /></IconButton>
                  <IconButton onClick={() => handleDelete(item._id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
        />
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editId ? 'Edit' : 'Create'} ${capitalize(collection.name)}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              ${fields.join('\n')}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editId ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ${compName};
`;


  fs.writeFileSync(filename, componentCode.trim(), 'utf-8');
});

console.log('✅ React CRUD form components generated in /generated/forms');
