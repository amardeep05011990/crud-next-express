"use client";

import { useState } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const fieldTypes = ["Text", "Number", "Dropdown", "Checkbox"];

export default function FormBuilder({ onSave }) {
  const [formRows, setFormRows] = useState([]);

  // ✅ **Sortable Row Component**
  function SortableRow({ row, index }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: row.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      border: "1px solid #ccc",
      padding: "10px",
      background: "#f9f9f9",
      marginBottom: "10px",
      cursor: "grab",
    };

    return (
      <Paper ref={setNodeRef} style={style} {...attributes} {...listeners}>
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
    );
  }

  // ✅ **Handle Drag & Drop Reordering**
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = formRows.findIndex((row) => row.id === active.id);
      const newIndex = formRows.findIndex((row) => row.id === over.id);
      setFormRows(arrayMove(formRows, oldIndex, newIndex));
    }
  };

  // ✅ **Add New Row**
  const addRow = () => {
    setFormRows([...formRows, { id: Date.now(), columns: [{ id: Date.now(), type: "Text", label: "" }] }]);
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
          ? { ...row, columns: [...row.columns, { id: Date.now(), type: "Text", label: "" }] }
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

  // ✅ **Handle Input Change for Labels**
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

  // ✅ **Save Form Structure**
  const handleSave = () => {
    console.log("Form Structure:", formRows);
    if (onSave) onSave(formRows);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Dynamic Form Builder (Sortable Rows)
      </Typography>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={formRows.map((row) => row.id)}>
          {formRows.map((row, index) => (
            <SortableRow key={row.id} row={row} index={index} />
          ))}
        </SortableContext>
      </DndContext>

      <Button onClick={addRow} variant="contained" startIcon={<AddIcon />}>
        Add Row
      </Button>

      <Button onClick={handleSave} variant="contained" color="primary" style={{ marginLeft: "10px" }}>
        Save Form
      </Button>
    </Container>
  );
}
