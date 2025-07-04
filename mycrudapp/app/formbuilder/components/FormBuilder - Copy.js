"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Container,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
  IconButton,
  Paper,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const fieldTypes = ["Text", "Number", "Dropdown", "Checkbox"];
const validationTypes = ["Required", "Min Length", "Max Length", "Pattern", "Min Value", "Max Value"];

export default function FormBuilder({ onSave, initialData }) {
  const [formName, setFormName] = useState("");
  const [formRows, setFormRows] = useState([]);

  useEffect(() => {
    if (initialData) {
      setFormName(initialData.name);
      setFormRows(initialData.structure);
    }
  }, [initialData]);

  // ✅ **Add New Row**
  const addRow = () => {
    setFormRows([
      ...formRows,
      {
        id: Date.now(),
        columns: [
          { id: Date.now(), type: "Text", label: "", validations: [] },
        ],
      },
    ]);
  };

  // ✅ **Remove a Row**
  const removeRow = (rowId) => {
    setFormRows(formRows.filter((row) => row.id !== rowId));
  };

  // ✅ **Add Column to a Row**
  const addColumn = (rowId) => {
    setFormRows(
      formRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              columns: [
                ...row.columns,
                { id: Date.now(), type: "Text", label: "", validations: [] },
              ],
            }
          : row
      )
    );
  };

  // ✅ **Remove Column from a Row**
  const removeColumn = (rowId, columnId) => {
    setFormRows(
      formRows.map((row) =>
        row.id === rowId
          ? { ...row, columns: row.columns.filter((col) => col.id !== columnId) }
          : row
      )
    );
  };

  // ✅ **Handle Field Updates**
  const handleFieldChange = (rowId, columnId, field, value) => {
    setFormRows(
      formRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              columns: row.columns.map((col) =>
                col.id === columnId ? { ...col, [field]: value } : col
              ),
            }
          : row
      )
    );
  };

  // ✅ **Handle Adding a Validation**
  const addValidation = (rowId, columnId, validationType) => {
    setFormRows(
      formRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              columns: row.columns.map((col) =>
                col.id === columnId && !col.validations.find((v) => v.type === validationType)
                  ? { ...col, validations: [...col.validations, { type: validationType, value: "" }] }
                  : col
              ),
            }
          : row
      )
    );
  };

  // ✅ **Handle Removing a Validation**
  const removeValidation = (rowId, columnId, validationType) => {
    setFormRows(
      formRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              columns: row.columns.map((col) =>
                col.id === columnId
                  ? { ...col, validations: col.validations.filter((v) => v.type !== validationType) }
                  : col
              ),
            }
          : row
      )
    );
  };

  // ✅ **Handle Validation Value Change**
  const handleValidationChange = (rowId, columnId, validationType, value) => {
    setFormRows(
      formRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              columns: row.columns.map((col) =>
                col.id === columnId
                  ? {
                      ...col,
                      validations: col.validations.map((v) =>
                        v.type === validationType ? { ...v, value } : v
                      ),
                    }
                  : col
              ),
            }
          : row
      )
    );
  };

  // ✅ **Save Form**
  const handleSave = () => {
    onSave({ name: formName, structure: formRows });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Edit Form
      </Typography>

      <TextField
        label="Form Name"
        value={formName}
        onChange={(e) => setFormName(e.target.value)}
        fullWidth
        margin="normal"
      />

      {formRows.map((row) => (
        <Paper key={row.id} style={{ padding: "10px", marginBottom: "10px" }}>
          <Grid container spacing={2}>
            {row.columns.map((column) => (
              <Grid item xs={12 / row.columns.length} key={column.id}>
                <TextField
                  label="Field Label"
                  value={column.label}
                  onChange={(e) => handleFieldChange(row.id, column.id, "label", e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <Select
                  value={column.type}
                  onChange={(e) => handleFieldChange(row.id, column.id, "type", e.target.value)}
                  fullWidth
                  margin="normal"
                >
                  {fieldTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>

                {/* ✅ Dropdown to Select a Validation to Add */}
                <Select
                  value=""
                  onChange={(e) => addValidation(row.id, column.id, e.target.value)}
                  fullWidth
                  margin="normal"
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Add Validation
                  </MenuItem>
                  {validationTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>

                {/* ✅ Show Selected Validations */}
                {column.validations.map((validation) => (
                  <div key={validation.type} style={{ display: "flex", alignItems: "center", marginTop: "5px" }}>
                    {(validation.type === "Required" || validation.type === "Min Length" || validation.type === "Max Length" || validation.type === "Pattern") && (
                      <TextField
                        label={validation.type}
                        value={validation.value}
                        onChange={(e) => handleValidationChange(row.id, column.id, validation.type, e.target.value)}
                        fullWidth
                        margin="normal"
                      />
                    )}

                    {(validation.type === "Min Value" || validation.type === "Max Value") && column.type === "Number" && (
                      <TextField
                        type="number"
                        label={validation.type}
                        value={validation.value}
                        onChange={(e) => handleValidationChange(row.id, column.id, validation.type, e.target.value)}
                        fullWidth
                        margin="normal"
                      />
                    )}

                    <IconButton onClick={() => removeValidation(row.id, column.id, validation.type)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </div>
                ))}

                <IconButton onClick={() => removeColumn(row.id, column.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              </Grid>
            ))}
          </Grid>
          <Button onClick={() => addColumn(row.id)} variant="outlined" startIcon={<AddIcon />}>
            Add Column
          </Button>
          <Button
            onClick={() => removeRow(row.id)}
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            style={{ marginLeft: "10px" }}
          >
            Remove Row
          </Button>
        </Paper>
      ))}

      <Button onClick={addRow} variant="contained" startIcon={<AddIcon />}>
        Add Row
      </Button>

      <Button onClick={handleSave} variant="contained" color="primary" style={{ marginLeft: "10px" }}>
        Save Form
      </Button>
    </Container>
  );
}
