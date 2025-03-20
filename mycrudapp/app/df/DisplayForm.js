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
  const { id, submissionId } = useParams(); // ✅ Get form & submission ID from URL
  const [formData, setFormData] = useState([]); // Form structure
  const [formName, setFormName] = useState(""); // Form Name
  const [formValues, setFormValues] = useState({}); // Stores user input
  const [errors, setErrors] = useState({}); // Stores validation errors
  const [collections, setCollections] = useState([]); // Store available collections
  const [isMounted, setIsMounted] = useState(false); // Prevents hydration errors

  useEffect(() => {
    setIsMounted(true);
    fetchForm();
    fetchCollections();
    if (submissionId) fetchSubmission();
  }, [id, submissionId]);

  // ✅ Fetch Form Data
  async function fetchForm() {
    try {
      const response = await fetch(`http://localhost:3000/api/forms/${id}`);
      const result = await response.json();

      if (result.status === "success") {
        setFormName(result.data.name);
        setFormData(result.data.structure || []);
      } else {
        console.error("❌ Error fetching form:", result.message);
      }
    } catch (error) {
      console.error("❌ Error fetching form:", error);
    }
  }

  // ✅ Fetch Submission Data (for edit mode)
  async function fetchSubmission() {
    try {
      const response = await fetch(`http://localhost:3000/api/forms/${id}/submissions/${submissionId}`);
      const result = await response.json();

      if (result.status === "success" && result.data) {
        setFormValues(result.data[0]["submittedData"] || {}); // ✅ Ensure data is set
      } else {
        console.warn("⚠️ No submission data found:", result.message);
      }
    } catch (error) {
      console.error("❌ Error fetching submission:", error);
    }
  }

  // ✅ Fetch Available Collections for Dropdown
  async function fetchCollections() {
    try {
      const response = await fetch("http://localhost:3000/api/collections");
      const data = await response.json();
      if (data.status === "success") {
        setCollections(data.collections);
      }
    } catch (error) {
      console.error("❌ Error fetching collections:", error);
    }
  }

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

  // ✅ Handle Form Submission (Create or Update Submission)
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const endpoint = submissionId
      ? `http://localhost:3000/api/forms/${id}/submissions/${submissionId}`
      : `http://localhost:3000/api/forms/${id}/submit`;

    const method = submissionId ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submittedData: formValues }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(`✅ Form ${submissionId ? "updated" : "submitted"} successfully!`);
      } else {
        console.error("❌ Error saving form:", result.message);
      }
    } catch (error) {
      console.error("❌ Error saving form:", error);
    }
  };

  if (!isMounted) return null; // ✅ Prevents hydration error

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
                  {/* ✅ Text Input */}
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

                  {/* ✅ Number Input */}
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

                  {/* ✅ Dropdown (Manual or API-Fetched Options) */}
                  {column.type === "Dropdown" && (
                    <Select
                      value={formValues[`${row.id}-${column.id}`] || ""}
                      onChange={(e) => handleChange(row.id, column.id, e.target.value)}
                      fullWidth
                      error={!!errors[`${row.id}-${column.id}`]}
                    >
                      <MenuItem value="">Select an option</MenuItem>
                      {column.collection
                        ? collections.find((c) => c.name === column.collection)?.values?.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))
                        : column.options.map((opt) => (
                            <MenuItem key={opt.id} value={opt.value}>
                              {opt.value}
                            </MenuItem>
                          ))}
                    </Select>
                  )}

                  {/* ✅ Checkbox */}
                  {column.type === "Checkbox" && (
                    <FormControlLabel control={<Checkbox checked={!!formValues[`${row.id}-${column.id}`]} onChange={(e) => handleChange(row.id, column.id, e.target.checked)} />} label={column.label} />
                  )}
                </FormControl>
              ))}
            </div>
          </div>
        ))}
        <Button type="submit" variant="contained" color="primary">
          {submissionId ? "Update Submission" : "Submit"}
        </Button>
      </form>
    </Container>
  );
}
