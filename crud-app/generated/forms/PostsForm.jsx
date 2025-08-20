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
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const PostsForm = () => {
  const { control, handleSubmit, reset } = useForm();
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);

  const loadData = async () => {
    const res = await fetch('/api/posts');
    const json = await res.json();
    setData(json);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (formData) => {
    if (editId) {
      await fetch(`/api/posts/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } else {
      await fetch('/api/posts', {
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
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    loadData();
  };

  return (
    <Box p={3}>
      <Paper elevation={3} style={{ padding: 20 }}>
        <Typography variant="h5">Posts Form</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          
        <Controller
          name="title"
          control={control}
          defaultValue=""
          rules={{ required: 'title field is required', min: { value: 2, message: '' } }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Title"
              variant="outlined"
              margin="normal"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
    

        <Controller
          name="description"
          control={control}
          defaultValue=""
          rules={{  }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Description"
              variant="outlined"
              margin="normal"
              fullWidth
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
            />
          )}
        />
    
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

export default PostsForm;