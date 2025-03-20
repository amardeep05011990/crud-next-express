"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const fieldTypes = ["Text", "Number", "Dropdown", "Checkbox"];

export default function FormBuilder({ onSave }) {
  const { control, handleSubmit, reset } = useForm();
  const [formFields, setFormFields] = useState([]);

  // ✅ Drag & Drop Sorting Hook
  const DraggableItem = ({ field, index }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: field.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      padding: "8px",
      border: "1px solid #ccc",
      marginBottom: "8px",
      background: "#fff",
      cursor: "grab",
    };

    return (
      <Box ref={setNodeRef} {...attributes} {...listeners} style={style}>
        <Typography>{field.label} ({field.type})</Typography>
      </Box>
    );
  };

  // ✅ Handle Drag End
  const onDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFormFields((prev) => {
        const oldIndex = prev.findIndex((f) => f.id === active.id);
        const newIndex = prev.findIndex((f) => f.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  // ✅ Add New Field
  const addField = (type) => {
    const newField = {
      id: `field-${formFields.length + 1}`,
      label: `Field ${formFields.length + 1}`,
      type,
    };
    setFormFields([...formFields, newField]);
  };

  // ✅ Submit Form
  const onSubmit = (data) => {
    console.log("Form Data Submitted:", data);
    onSave(data);
    reset();
  };

  return (
    <Box p={3} sx={{ maxWidth: 500, margin: "auto", textAlign: "center" }}>
      <Typography variant="h5">Drag & Drop Form Builder</Typography>

      {/* 🔹 Drag & Drop Area */}
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={formFields.map((f) => f.id)}>
          {formFields.map((field, index) => (
            <DraggableItem key={field.id} field={field} index={index} />
          ))}
        </SortableContext>
      </DndContext>

      {/* 🔹 Field Type Buttons */}
      <Box display="flex" justifyContent="center" gap={2} mt={2}>
        {fieldTypes.map((type) => (
          <Button key={type} variant="contained" onClick={() => addField(type)}>
            {type}
          </Button>
        ))}
      </Box>

      {/* 🔹 Render Dynamic Form */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ marginTop: "16px" }}>
        {formFields.map((field) => (
          <Controller
            key={field.id}
            name={field.id}
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                label={field.label}
                variant="outlined"
                fullWidth
                margin="normal"
                onChange={onChange}
                value={value || ""}
              />
            )}
          />
        ))}
        <Button type="submit" variant="contained" color="primary">
          Submit Form
        </Button>
      </form>
    </Box>
  );
}
