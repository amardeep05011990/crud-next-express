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

const StudentsForm = () => {
  const { control, handleSubmit, reset } = useForm();
  const [data, setData] = useState([]);
  const [editId, setEditId] = useState(null);

  const loadData = async () => {
    const res = await fetch('http://localhost:5000/api/students');
    const json = await res.json();
    setData(json);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (formData) => {
    if (editId) {
      await fetch(`http://localhost:5000/api/students/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } else {
      await fetch('http://localhost:5000/api/students', {
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
    await fetch(`http://localhost:5000/api/students/${id}`, { method: 'DELETE' });
    loadData();
  };

  return (
    <Box p={3}>
      <Paper elevation={3} style={{ padding: 20 }}>
        <Typography variant="h5">Students Form</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid item xs={12} md={6}>
<Controller
        name="city"
        control={control}
        defaultValue={""}
        rules={{  }}
        render={({ field, fieldState }) => (
          <FormControl fullWidth>
            <InputLabel>City</InputLabel>
            <Select
              label="City"
              
              {...field}
              error={!!fieldState.error}
            >
              <MenuItem value="jaipur">jaipur</MenuItem>
<MenuItem value="patna">patna</MenuItem>
<MenuItem value="banglore">banglore</MenuItem>
            </Select>
            {fieldState.error && <p style={{ color: 'red' }}>{fieldState.error.message}</p>}
          </FormControl>
        )}
      />
</Grid>
<Grid item xs={12} md={6}>
<Controller
        name="gender"
        control={control}
        defaultValue=""
        rules={{  }}
        render={({ field, fieldState }) => (
          <FormControl component="fieldset">
            <Typography>Gender</Typography>
            <RadioGroup row {...field}>
              <FormControlLabel value="male" control={<Radio />} label="male" />
<FormControlLabel value="female" control={<Radio />} label="female" />
            </RadioGroup>
            {fieldState.error && <p style={{ color: 'red' }}>{fieldState.error.message}</p>}
          </FormControl>
        )}
      />
</Grid>
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

export default StudentsForm;