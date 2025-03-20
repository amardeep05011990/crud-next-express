"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Container, Typography, Table, TableHead, TableBody, TableRow, TableCell, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";

export default function CollectionPage() {
  const params = useParams();
  const collectionName = params?.collection;
  
  if (!collectionName) return <p>Loading collection...</p>;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const token = typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null;
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    setIsMounted(true);
    if (!token) {
      alert("Unauthorized! Please login.");
      window.location.href = "/login";
      return;
    }

    async function fetchCollection() {
      try {
        const response = await fetch(`http://localhost:3000/api/${collectionName}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json();

        if (result.status !== "success") {
          alert("Error fetching data: " + result.message);
          return;
        }

        setData(result.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCollection();
  }, [collectionName]);

  const handleOpen = (item = null) => {
    setEditingItem(item);
    if (item) {
      Object.keys(item).forEach((key) => setValue(key, item[key]));
    } else {
      reset();
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
    reset();
  };

  const onSubmit = async (formData) => {
    const method = editingItem ? "PUT" : "POST";
    const url = editingItem
      ? `http://localhost:3000/api/${collectionName}/${editingItem._id}`
      : `http://localhost:3000/api/${collectionName}`;

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (result.status === "success") {
        alert(editingItem ? "Updated successfully!" : "Created successfully!");
        handleClose();
        window.location.reload();
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const deleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/${collectionName}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();
      if (result.status === "success") {
        alert("Deleted successfully!");
        window.location.reload();
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  if (!isMounted) return null;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4">Manage {collectionName}</Typography>
      <Button variant="contained" color="primary" onClick={() => handleOpen()}>
        Add New
      </Button>

      {loading ? <CircularProgress /> : (
        <Table>
          <TableHead>
            <TableRow>
              {data.length > 0 && Object.keys(data[0]).map((field) => (
                <TableCell key={field}>{field}</TableCell>
              ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item._id}>
                {Object.keys(item).map((field) => (
                  <TableCell key={field}>{item[field]}</TableCell>
                ))}
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleOpen(item)}>
                    Edit
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => deleteItem(item._id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* ✅ Modal for Add/Edit Form */}
      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
        <DialogContent>
          <form id="crudForm" onSubmit={handleSubmit(onSubmit)}>
            {data.length > 0 &&
              Object.keys(data[0]).map((field) => (
                <TextField
                  key={field}
                  label={field}
                  fullWidth
                  margin="dense"
                  {...register(field, { required: true })}
                />
              ))}
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button type="submit" form="crudForm" variant="contained" color="primary">
            {editingItem ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
