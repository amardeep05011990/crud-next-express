"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Button } from "@mui/material";

export default function FormListPage() {
  const [forms, setForms] = useState([]);
  const router = useRouter();

  useEffect(() => {
    async function fetchForms() {
      try {
        const response = await fetch("http://localhost:3000/api/forms");
        const result = await response.json();

        if (result.status === "success") {
          setForms(result.data);
        } else {
          alert("❌ Error fetching forms: " + result.message);
        }
      } catch (error) {
        console.error("❌ Error:", error);
      }
    }

    fetchForms();
  }, []);

  // ✅ Handle Delete Page
  const handleDelete = async (formid) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/forms/${formid}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (response.ok) {
        alert("✅ Page deleted successfully!");
        setForms(forms.filter((forms) => forms._id !== formid)); // ✅ Remove from UI
      } else {
        alert("❌ Error deleting page: " + result.message);
      }
    } catch (error) {
      console.error("❌ Error deleting page:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h4">Saved Forms</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Form Name</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {forms.map((form) => (
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
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}
