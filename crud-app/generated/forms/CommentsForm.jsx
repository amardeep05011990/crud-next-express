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

const CommentsForm = () => {
  const { control, handleSubmit, reset } = useForm();
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);

  const loadData = async () => {
    const res = await fetch('/api/comments');
    const json = await res.json();
    setData(json);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (formData) => {
    if (editId) {
      await fetch(`/api/comments/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } else {
      await fetch('/api/comments', {
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
    await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    loadData();
  };

  return (
    <Box p={3}>
      <Paper elevation={3} style={{ padding: 20 }}>
        <Typography variant="h5">Comments Form</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          
        <Controller
          name="commentDescription"
          control={control}
          defaultValue=""
          rules={{  }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="CommentDescription"
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

export default CommentsForm;