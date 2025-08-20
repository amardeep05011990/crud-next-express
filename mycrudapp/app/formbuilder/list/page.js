"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button, CircularProgress } from "@mui/material";
import React from "react";


const FormRow = React.memo(({ form, router, handleDelete }) => (
  <TableRow key={form._id}>
    <TableCell>{form.name}</TableCell>
    <TableCell>
      <Button variant="contained" color="primary" onClick={() => router.push(`/formbuilder/${form._id}`)}>
        Edit
      </Button>
      <Button variant="contained" color="primary" onClick={() => router.push(`/df/${form._id}`)}>
        Display Form
      </Button>
      <Button variant="contained" color="primary" onClick={() => router.push(`/df/${form._id}/submissions`)}>
        List Data
      </Button>
      <Button variant="contained" color="primary" onClick={() => handleDelete(form._id)}>
        Delete
      </Button>
    </TableCell>
  </TableRow>
));

export default function FormListPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  

console.log("apiUrl", apiUrl)
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ Fetch Forms with Pagination
  const fetchForms = useCallback(async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/forms?page=${page}&limit=${limit}`);
      const result = await response.json();
      if (result.status === "success") {
        setForms(result.data);
      } else {
        alert("❌ Error fetching forms: " + result.message);
      }
    } catch (error) {
      console.error("❌ Error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  // ✅ Delete Function
  const handleDelete = useCallback(async (formid) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    try {
      const response = await fetch(`${apiUrl}/forms/${formid}`, { method: "DELETE" });
      const result = await response.json();
      if (response.ok) {
        alert("✅ Page deleted successfully!");
        setForms((prevForms) => prevForms.filter((form) => form._id !== formid));
      } else {
        alert("❌ Error deleting page: " + result.message);
      }
    } catch (error) {
      console.error("❌ Error deleting page:", error);
    }
  }, []);

  // ✅ Memoized Forms
  const memoizedForms = useMemo(() => forms, [forms]);

  if (loading) return <Typography>Loading forms... <CircularProgress /></Typography>;

  return (
    <Container style={{ flex: 1, marginLeft: "-200px" }}>
      <Typography variant="h4">Saved Forms</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Form Name</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {memoizedForms.map((form) => (
            <FormRow key={form._id} form={form} router={router} handleDelete={handleDelete} />
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}
