"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Typography,
} from "@mui/material";

export default function PagesList() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ✅ Fetch All Pages
  useEffect(() => {
    async function fetchPages() {
      try {
        const response = await fetch("http://localhost:3000/api/pages");
        const result = await response.json();

        if (response.ok) {
          setPages(result.data); // ✅ Set pages data
        } else {
          alert("❌ Error fetching pages: " + result.message);
        }
      } catch (error) {
        console.error("❌ Error fetching pages:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPages();
  }, []);

  // ✅ Handle Delete Page
  const handleDelete = async (pageId) => {
    if (!confirm("Are you sure you want to delete this page?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/pages/${pageId}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (response.ok) {
        alert("✅ Page deleted successfully!");
        setPages(pages.filter((page) => page._id !== pageId)); // ✅ Remove from UI
      } else {
        alert("❌ Error deleting page: " + result.message);
      }
    } catch (error) {
      console.error("❌ Error deleting page:", error);
    }
  };

  if (loading) return <Typography>Loading pages...</Typography>;

  return (
    <Container>
      <Typography variant="h4">Pages List</Typography>
      <Button variant="contained" color="primary" onClick={() => router.push("/create-page")}>
        + Create New Page
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Page Title</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {pages.map((page) => (
            <TableRow key={page._id}>
              <TableCell>{page._id}</TableCell>
              <TableCell>{page.title}</TableCell>
              <TableCell>
                <Button variant="contained" onClick={() => router.push(`/pagebuilder/editpage/${page._id}`)}>
                  Edit
                </Button>
                <Button variant="contained" color="error" onClick={() => handleDelete(page._id)} style={{ marginLeft: 8 }}>
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
