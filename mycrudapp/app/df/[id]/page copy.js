"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Container, TextField, Button, Typography } from "@mui/material";

export default function RenderForm() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const { register, handleSubmit } = useForm();

  useEffect(() => {
    async function fetchForm() {
      const response = await fetch(`http://localhost:3000/api/forms/${id}`);
      const result = await response.json();
      setForm(result.data);
    }
    fetchForm();
  }, [id]);

  const onSubmit = (data) => {
    console.log("Submitted Data:", data);
  };

  if (!form) return <p>Loading...</p>;

  return (
    <Container>
      <Typography variant="h4">{form.formName}</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        {form.fields.map((field) => (
          <TextField key={field.id} label={field.name} {...register(field.name)} fullWidth required />
        ))}
        <Button type="submit" variant="contained">Submit</Button>
      </form>
    </Container>
  );
}
