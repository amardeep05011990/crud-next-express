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

const AssignmentsForm = () => {
  const { control, handleSubmit, reset } = useForm();
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    const res = await fetch(`/api/assignments?page=${page + 1}&limit=${rowsPerPage}&search=${search}`);
    const json = await res.json();
    setData(json.items || []);
    setTotal(json.total || 0);
  };

  useEffect(() => {
    loadData();
  }, [page, rowsPerPage, search]);

  const onSubmit = async (formData) => {
    const url = editId ? `/api/assignments/${editId}` : '/api/assignments';
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
    await fetch(`/api/assignments/${id}`, { method: 'DELETE' });
    loadData();
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  return (
    <Box p={3}>
      <Paper elevation={3} style={{ padding: 20, marginBottom: 20 }}>
        <Typography variant="h5">Assignments List</Typography>
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
              <TableCell>Title</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{Array.isArray(item.title) ? item.title.join(', ') : item.title}</TableCell>
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
        <DialogTitle>{editId ? 'Edit' : 'Create'} Assignments</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12}>
<Controller
        name="title"
        control={control}
        defaultValue={[]}
        rules={{ required: 'title is required' }}
        render={({ field, fieldState }) => (
          <FormControl fullWidth>
            <InputLabel>Title</InputLabel>
            <Select
              label="Title"
              multiple
              {...field}
              error={!!fieldState.error}
            >
              <MenuItem value="asdf1">asdf1</MenuItem>
<MenuItem value="asdf2">asdf2</MenuItem>
<MenuItem value="asdf3">asdf3</MenuItem>
<MenuItem value="asdf4">asdf4</MenuItem>
<MenuItem value="asdf5">asdf5</MenuItem>
            </Select>
            {fieldState.error && <p style={{ color: 'red' }}>{fieldState.error.message}</p>}
          </FormControl>
        )}
      />
</Grid>
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

export default AssignmentsForm;