"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Container,
  TextField,
  Select,
  MenuItem,
  FormControl,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
} from "@mui/material";

export default function DisplayForm() {
  const { id } = useParams(); // Get form ID from URL
  const [formData, setFormData] = useState([]);
  const [formName, setFormName] = useState("");
  const [formValues, setFormValues] = useState({}); // Stores user input
  const [errors, setErrors] = useState({}); // Stores validation errors

  useEffect(() => {
    async function fetchForm() {
      try {
        const response = await fetch(`http://localhost:3000/api/forms/${id}`);
        const result = await response.json();

        if (result.status === "success") {
          setFormName(result.data.name);
          setFormData(result.data.structure);
        } else {
          alert("❌ Error fetching form: " + result.message);
        }
      } catch (error) {
        console.error("❌ Error fetching form:", error);
      }
    }

    if (id) fetchForm();
  }, [id]);

  // ✅ Handle Input Change
  const handleChange = (rowId, columnId, value) => {
    setFormValues((prev) => ({
      ...prev,
      [`${rowId}-${columnId}`]: value,
    }));

    // ✅ Reset validation error on input change
    setErrors((prev) => ({
      ...prev,
      [`${rowId}-${columnId}`]: "",
    }));
  };

  // ✅ Validate Form Before Submission
  const validateForm = () => {
    let valid = true;
    let newErrors = {};

    formData.forEach((row) => {
      row.columns.forEach((column) => {
        const value = formValues[`${row.id}-${column.id}`] || "";
        column.validations?.forEach((validation) => {
          if (validation.type === "Required" && !value) {
            newErrors[`${row.id}-${column.id}`] = "This field is required";
            valid = false;
          }
          if (validation.type === "Min Length" && value.length < validation.value) {
            newErrors[`${row.id}-${column.id}`] = `Minimum length is ${validation.value}`;
            valid = false;
          }
          if (validation.type === "Max Length" && value.length > validation.value) {
            newErrors[`${row.id}-${column.id}`] = `Maximum length is ${validation.value}`;
            valid = false;
          }
          if (validation.type === "Pattern" && !new RegExp(validation.value).test(value)) {
            newErrors[`${row.id}-${column.id}`] = "Invalid format";
            valid = false;
          }
          if (validation.type === "Min Value" && Number(value) < validation.value) {
            newErrors[`${row.id}-${column.id}`] = `Value must be at least ${validation.value}`;
            valid = false;
          }
          if (validation.type === "Max Value" && Number(value) > validation.value) {
            newErrors[`${row.id}-${column.id}`] = `Value must be at most ${validation.value}`;
            valid = false;
          }
        });
      });
    });

    setErrors(newErrors);
    return valid;
  };

  // ✅ Handle Form Submission & Save Data to Backend
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/forms/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submittedData: formValues }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("✅ Form submitted successfully!");
        console.log("Saved Submission:", result);
      } else {
        alert("❌ Error submitting form: " + result.message);
      }
    } catch (error) {
      console.error("❌ Error submitting form:", error);
    }
  };

  if (!formData.length) return <Typography>Loading form...</Typography>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {formName}
      </Typography>
      <form onSubmit={handleSubmit}>
        {formData.map((row) => (
          <div key={row.id} style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
            <div style={{ display: "flex", gap: "20px" }}>
              {row.columns.map((column) => (
                <FormControl key={column.id} style={{ flex: 1 }}>
                  {column.type === "Text" && (
                    <TextField
                      label={column.label}
                      value={formValues[`${row.id}-${column.id}`] || ""}
                      onChange={(e) => handleChange(row.id, column.id, e.target.value)}
                      fullWidth
                      error={!!errors[`${row.id}-${column.id}`]}
                      helperText={errors[`${row.id}-${column.id}`]}
                    />
                  )}

                  {column.type === "Number" && (
                    <TextField
                      type="number"
                      label={column.label}
                      value={formValues[`${row.id}-${column.id}`] || ""}
                      onChange={(e) => handleChange(row.id, column.id, e.target.value)}
                      fullWidth
                      error={!!errors[`${row.id}-${column.id}`]}
                      helperText={errors[`${row.id}-${column.id}`]}
                    />
                  )}

                  {column.type === "Dropdown" && (
                    <Select
                      value={formValues[`${row.id}-${column.id}`] || ""}
                      onChange={(e) => handleChange(row.id, column.id, e.target.value)}
                      fullWidth
                      error={!!errors[`${row.id}-${column.id}`]}
                    >
                      <MenuItem value="">Select an option</MenuItem>
                      <MenuItem value="Option 1">Option 1</MenuItem>
                      <MenuItem value="Option 2">Option 2</MenuItem>
                    </Select>
                  )}

                  {column.type === "Checkbox" && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!formValues[`${row.id}-${column.id}`]}
                          onChange={(e) => handleChange(row.id, column.id, e.target.checked)}
                        />
                      }
                      label={column.label}
                    />
                  )}
                </FormControl>
              ))}
            </div>
          </div>
        ))}
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </form>
    </Container>
  );
}
