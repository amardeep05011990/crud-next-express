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
  InputLabel,
  RadioGroup,
  Radio,
} from "@mui/material";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function DisplayForm() {
  const { id, submissionId } = useParams(); // ✅ Get form & submission ID from URL
  const [formData, setFormData] = useState([]); // Form structure
  const [formName, setFormName] = useState(""); // Form Name
  const [formValues, setFormValues] = useState({}); // Stores user input
  const [errors, setErrors] = useState({}); // Stores validation errors
  const [collectionsData, setCollectionsData] = useState({}); // Stores fetched collection data
  const [isMounted, setIsMounted] = useState(false); // Prevents hydration errors

  useEffect(() => {
    setIsMounted(true);

    async function fetchForm() {
      try {
        const response = await fetch(`${apiUrl}/forms/${id}`);
        const result = await response.json();

        if (result.status === "success") {
          setFormName(result.data.name);
          setFormData(result.data.structure || []);

          // Fetch collection data if needed
          fetchCollectionData(result.data.structure);
        } else {
          console.error("❌ Error fetching form:", result.message);
        }
      } catch (error) {
        console.error("❌ Error fetching form:", error);
      }
    }

    async function fetchSubmission() {
      if (!submissionId) return; // ✅ Skip if it's a new submission

      try {
        const response = await fetch(
          `${apiUrl}/forms/${id}/submissions/${submissionId}`
        );
        const result = await response.json();

        if (result.status === "success" && result.data) {
          setFormValues(result.data["submittedData"] || {}); // ✅ Ensure data is set
        } else {
          console.warn("⚠️ No submission data found:", result.message);
        }
      } catch (error) {
        console.error("❌ Error fetching submission:", error);
      }
    }

    if (id) fetchForm();
    if (submissionId) fetchSubmission();
  }, [id, submissionId]);

  // ✅ **Fetch collection data dynamically**
  async function fetchCollectionData(formStructure) {
    let fetchedData = {};
    for (const row of formStructure) {
      for (const column of row.columns) {
        if (
          column.type === "Dropdown" &&
          column.source === "collection" &&
          column.collection
        ) {
          try {
            const response = await fetch(
              `${apiUrl}/forms/${column.collection}/submissions`
            );
            const result = await response.json();
            if (result.status === "success") {
              fetchedData[column.collection] = result.data;
            }
          } catch (error) {
            console.error(
              `❌ Error fetching collection ${column.collection}:`,
              error
            );
          }
        }
      }
    }
    setCollectionsData(fetchedData);
  }

  // // ✅ **Handle Input Change**
  // const handleChange = (rowId, columnId, value) => {
  //   setFormValues((prev) => ({
  //     ...prev,
  //     [`${rowId}-${columnId}`]: value,
  //   }));

  //   // ✅ Reset validation error on input change
  //   setErrors((prev) => ({
  //     ...prev,
  //     [`${rowId}-${columnId}`]: "",
  //   }));
  // };

  const handleChange = (rowId, columnId, value, isCheckbox = false) => {
    setFormValues((prev) => {
      const key = `${rowId}-${columnId}`;

      if (isCheckbox) {
        // Ensure it’s always an array
        const currentValues = Array.isArray(prev[key]) ? prev[key] : [];

        // Toggle the selected checkbox value
        const updatedValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value) // Remove if already selected
          : [...currentValues, value]; // Add new selection

        return { ...prev, [key]: updatedValues };
      }

      return { ...prev, [key]: value };
    });

    // ✅ Reset validation error on input change
    setErrors((prev) => ({
      ...prev,
      [`${rowId}-${columnId}`]: "",
    }));
  };

  // ✅ **Validate Form Before Submission**
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
          if (
            validation.type === "Min Length" &&
            value.length < validation.value
          ) {
            newErrors[
              `${row.id}-${column.id}`
            ] = `Minimum length is ${validation.value}`;
            valid = false;
          }
          if (
            validation.type === "Max Length" &&
            value.length > validation.value
          ) {
            newErrors[
              `${row.id}-${column.id}`
            ] = `Maximum length is ${validation.value}`;
            valid = false;
          }
          if (
            validation.type === "Pattern" &&
            !new RegExp(validation.value).test(value)
          ) {
            newErrors[`${row.id}-${column.id}`] = "Invalid format";
            valid = false;
          }
          if (
            validation.type === "Min Value" &&
            Number(value) < validation.value
          ) {
            newErrors[
              `${row.id}-${column.id}`
            ] = `Value must be at least ${validation.value}`;
            valid = false;
          }
          if (
            validation.type === "Max Value" &&
            Number(value) > validation.value
          ) {
            newErrors[
              `${row.id}-${column.id}`
            ] = `Value must be at most ${validation.value}`;
            valid = false;
          }
        });
      });
    });

    setErrors(newErrors);
    return valid;
  };

  // ✅ **Extract values from collection data**
  // const getCollectionOptions = (collectionId) => {
  //   const collectionItems = collectionsData[collectionId] || [];
  //   return collectionItems.map((item) => {
  //     const submittedValues = Object.values(item.submittedData);
  //     return submittedValues.length ? submittedValues[0] : "";
  //   });
  // };
  const getCollectionOptions = (collectionId) => {
    const collectionItems = collectionsData[collectionId] || [];
    return collectionItems.map((item) => {
      const entryId = item._id;
      const entryValue = Object.values(item.submittedData)[0]; // Extract the first field value
      return { id: entryId, name: entryValue };
    });
  };

  // ✅ **Handle Form Submission (Create or Update Submission)**
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const endpoint = submissionId
      ? `${apiUrl}/forms/${id}/submissions/${submissionId}`
      : `${apiUrl}/forms/${id}/submit`;

    const method = submissionId ? "PUT" : "POST"; // ✅ Update if submission exists

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submittedData: formValues }),
      });

      const result = await response.json();
      if (response.ok) {
        alert(
          `✅ Form ${submissionId ? "updated" : "submitted"} successfully!`
        );
      } else {
        console.error("❌ Error saving form:", result.message);
      }
    } catch (error) {
      console.error("❌ Error saving form:", error);
    }
  };
  console.log("collection data", collectionsData);
  console.log("formData", formData);
  console.log("formValues", formValues);
  if (!isMounted) return null; // ✅ Prevents hydration error

  return (
    <Container style={{ flex: 1, marginLeft: "-200px" }}>
      <Typography variant="h4" gutterBottom>
        {formName}
      </Typography>
      <form onSubmit={handleSubmit}>
        {formData.map((row, index) => (
          <div
            key={row.id}
            style={{
              marginBottom: "20px",
              padding: "10px",
              border: "1px solid #ccc",
            }}
          >
            <div style={{ display: "flex", gap: "20px" }}>
              {row.columns.map((column) => (
                <FormControl key={column.id} style={{ flex: 1 }}>
                  {column.type === "Text" && (
                    <TextField
                      label={column.label}
                      value={formValues[`${row.id}-${column.id}`] || ""}
                      onChange={(e) =>
                        handleChange(row.id, column.id, e.target.value)
                      }
                      fullWidth
                      error={!!errors[`${row.id}-${column.id}`]}
                      helperText={errors[`${row.id}-${column.id}`]}
                    />
                  )}
                  {column.type === "Dropdown" && column.source === "manual" && (
                    <>
                      <InputLabel id={`label-${row.id}-${column.id}`}>
                        {column.label}
                      </InputLabel>
                      <Select
                        labelId={`label-${row.id}-${column.id}`}
                        id={`select-${row.id}-${column.id}`}
                        label={column.label} // ✅ Ensures label appears in fieldset style
                        value={formValues[`${row.id}-${column.id}`] || ""}
                        onChange={(e) =>
                          handleChange(row.id, column.id, e.target.value)
                        }
                        fullWidth
                        error={!!errors[`${row.id}-${column.id}`]}
                      >
                        <MenuItem value="">Select an option</MenuItem>
                        {column.options
                          .map((opt) => opt.value)
                          .map((opt, index) => (
                            <MenuItem key={index} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                      </Select>
                    </>
                  )}
                  {/* {column.type === "Dropdown" && (
                    <Select
                      value={formValues[`${row.id}-${column.id}`] || ""}
                      onChange={(e) => handleChange(row.id, column.id, e.target.value)}
                      fullWidth
                      error={!!errors[`${row.id}-${column.id}`]}
                    >
                      <MenuItem value="">Select an option</MenuItem>
                      {column.source === "manual"
                        ? column.options.map((opt) => <MenuItem key={opt.value} value={opt.value}>{opt.value}</MenuItem>)
                        : (collectionsData[column.collection] || []).map((opt) => <MenuItem key={opt._id} value={opt._id}>{opt["submittedData"]}</MenuItem>)
                      }
                    </Select>
                  )} */}

                  {column.type === "Dropdown" &&
                    column.source === "collection" && (
                      // <Select
                      //   value={formValues[`${row.id}-${column.id}`] || ""}
                      //   onChange={(e) => handleChange(row.id, column.id, e.target.value)}
                      //   fullWidth
                      //   error={!!errors[`${row.id}-${column.id}`]}
                      // >
                      //   <MenuItem value="">Select an option</MenuItem>
                      //   {(column.source === "manual"
                      // {? column.options.map((opt) => opt.value)}
                      //     : getCollectionOptions(column.collection)
                      //   ).map((opt, index) => (
                      //     <MenuItem key={index} value={opt}>{opt}</MenuItem>
                      //   ))}
                      // </Select>
                      <>
                        <InputLabel id={`label-${row.id}-${column.id}`}>
                          {column.label}
                        </InputLabel>
                        <Select
                          key={`${index}-${row - id}`}
                          labelId={`label-${row.id}-${column.id}`}
                          id={`select-${row.id}-${column.id}`}
                          label={column.label} // ✅ Ensures label appears in fieldset style
                          value={formValues[`${row.id}-${column.id}`] || ""}
                          onChange={(e) =>
                            handleChange(row.id, column.id, e.target.value)
                          }
                          fullWidth
                          error={!!errors[`${row.id}-${column.id}`]}
                        >
                          <MenuItem value="">Select an option</MenuItem>
                          {getCollectionOptions(column.collection).map(
                            (opt) => (
                              <MenuItem key={opt.id} value={opt.id}>
                                {opt.name}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </>
                    )}

                  {column.type === "Checkbox" && (
                    <>
                      <Typography variant="subtitle1">
                        {column.label}
                      </Typography>
                      {column.options.map((option) => {
                        const key = `${row.id}-${column.id}`;
                        const isChecked = Array.isArray(formValues[key])
                          ? formValues[key].includes(option.value)
                          : false;

                        return (
                          <FormControlLabel
                            key={`${row.id}-${column.id}-${option.id}`} // Ensure unique key
                            control={
                              <Checkbox
                                checked={isChecked}
                                onChange={() =>
                                  handleChange(
                                    row.id,
                                    column.id,
                                    option.value,
                                    true
                                  )
                                }
                              />
                            }
                            label={option.value}
                          />
                        );
                      })}
                    </>
                  )}

                  {/* ✅ Render Radio Buttons */}
                  {column.type === "Radio" && (
                    <FormControl component="fieldset">
                      <Typography variant="subtitle1">
                        {column.label}
                      </Typography>
                      <RadioGroup
                        value={formValues[`${row.id}-${column.id}`] || ""}
                        onChange={(e) =>
                          handleChange(row.id, column.id, e.target.value)
                        }
                      >
                        {column.options.map((option) => (
                          <FormControlLabel
                            key={option.id}
                            value={option.value}
                            control={<Radio />}
                            label={option.value}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  )}

                  {column.type === "TextArea" && (
                    <TextField
                      label={column.label}
                      multiline
                      rows={4} // ✅ Set the number of rows
                      value={formValues[`${row.id}-${column.id}`] || ""}
                      onChange={(e) =>
                        handleChange(row.id, column.id, e.target.value)
                      }
                      fullWidth
                      error={!!errors[`${row.id}-${column.id}`]}
                      helperText={errors[`${row.id}-${column.id}`]}
                    />
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
