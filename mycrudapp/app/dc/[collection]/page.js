"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Container, Typography, Table, TableHead, TableBody, TableRow, TableCell, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem
} from "@mui/material";

export default function CollectionPage() {
  const { collection } = useParams();
  const [data, setData] = useState([]);
  const [schema, setSchema] = useState({});
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const { register, handleSubmit, reset, setValue } = useForm();
  const token = localStorage.getItem("jwtToken");

  useEffect(() => {
    // if (!token) return (window.location.href = "/login");

    async function fetchCollection() {
      const res = await fetch(`/api/${collection}`, { headers: { Authorization: `Bearer ${token}` } });
      const { data, schemaDefinition } = await res.json();
      setData(data);
      setSchema(schemaDefinition);
    }
    fetchCollection();
  }, [collection]);

  const handleOpen = (item = null) => {
    setEditingItem(item);
    if (item) Object.keys(item).forEach((key) => setValue(key, item[key]));
    else reset();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
  };

  const onSubmit = async (formData) => {
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem ? `/api/${collection}/${editingItem._id}` : `/api/${collection}`;
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(formData),
    });
    window.location.reload();
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4">Manage {collection}</Typography>
      <Button onClick={() => handleOpen()} variant="contained" color="primary">Add New</Button>

      <Table>
        <TableHead>
          <TableRow>
            {Object.keys(schema).map((field) => <TableCell key={field}>{field}</TableCell>)}
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item._id}>
              {Object.keys(schema).map((field) => <TableCell key={field}>{item[field]}</TableCell>)}
              <TableCell>
                <Button onClick={() => handleOpen(item)}>Edit</Button>
                <Button color="error">Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            {Object.keys(schema).map((field) => (
              <TextField key={field} label={field} {...register(field)} fullWidth margin="dense" />
            ))}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
