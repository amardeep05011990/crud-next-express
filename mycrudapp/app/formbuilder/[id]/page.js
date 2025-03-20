"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FormBuilder from "./../components/FormBuilder";
import { Container, Typography, Button } from "@mui/material";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function EditFormPage() {
  const { id } = useParams();
  const router = useRouter();
  const [form, setForm] = useState(null);

  useEffect(() => {
    async function fetchForm() {
      try {
        const response = await fetch(`${apiUrl}/forms/${id}`);
        const result = await response.json();

        if (result.status === "success") {
          setForm(result.data);
        } else {
          alert("❌ Error fetching form: " + result.message);
        }
      } catch (error) {
        console.error("❌ Error:", error);
      }
    }

    fetchForm();
  }, [id]);

  const handleSave = async (updatedData) => {
    try {
      const response = await fetch(`${apiUrl}/forms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("✅ Form updated successfully!");
        // router.push("/formbuilder"); // Redirect to form list after updating
      } else {
        alert("❌ Error updating form: " + result.message);
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };

  if (!form) return <p>Loading form...</p>;

  return (
    <Container>
      <Typography variant="h4">Edit Form</Typography>
      <FormBuilder onSave={handleSave} initialData={form} />
      <Button variant="contained" color="secondary" onClick={() => router.push("/formbuilder")}>
        Cancel
      </Button>
    </Container>
  );
}
