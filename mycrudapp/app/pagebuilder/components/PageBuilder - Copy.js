"use client";

import { useState } from "react";
import {
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const widgetTypes = ["Text", "Image", "Button", "Video"];

export default function PageBuilder({ onSave, initialData }) {
  const [pageTitle, setPageTitle] = useState(initialData?.title || "New Page");
  const [sections, setSections] = useState(initialData?.sections || []);

  // ✅ Add New Section
  const addSection = () => {
    setSections([
      ...sections,
      { id: Date.now(), columns: [{ id: Date.now(), widgets: [] }] },
    ]);
  };

  // ✅ Remove Section
  const removeSection = (sectionId) => {
    setSections(sections.filter((section) => section.id !== sectionId));
  };

  // ✅ Add Column to a Section
  const addColumn = (sectionId) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, columns: [...section.columns, { id: Date.now(), widgets: [] }] }
          : section
      )
    );
  };

  // ✅ Remove Column from a Section
  const removeColumn = (sectionId, columnId) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? { ...section, columns: section.columns.filter((col) => col.id !== columnId) }
          : section
      )
    );
  };

  // ✅ Add Widget to a Column
  const addWidget = (sectionId, columnId, widgetType) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              columns: section.columns.map((col) =>
                col.id === columnId
                  ? { ...col, widgets: [...col.widgets, { id: Date.now(), type: widgetType, content: "" }] }
                  : col
              ),
            }
          : section
      )
    );
  };

  // ✅ Remove Widget from a Column
  const removeWidget = (sectionId, columnId, widgetId) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              columns: section.columns.map((col) =>
                col.id === columnId
                  ? { ...col, widgets: col.widgets.filter((widget) => widget.id !== widgetId) }
                  : col
              ),
            }
          : section
      )
    );
  };

  // ✅ Update Widget Content
  const handleWidgetChange = (sectionId, columnId, widgetId, content) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              columns: section.columns.map((col) =>
                col.id === columnId
                  ? {
                      ...col,
                      widgets: col.widgets.map((widget) =>
                        widget.id === widgetId ? { ...widget, content } : widget
                      ),
                    }
                  : col
              ),
            }
          : section
      )
    );
  };

  // ✅ Save Page Data
  const handleSave = () => {
    onSave({ title: pageTitle, sections });
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Page Builder
      </Typography>

      <TextField
        label="Page Title"
        value={pageTitle}
        onChange={(e) => setPageTitle(e.target.value)}
        fullWidth
        margin="normal"
      />

      {sections.map((section) => (
        <Paper key={section.id} sx={{ padding: 2, marginBottom: 2 }}>
          <Typography variant="h6">Section</Typography>

          <Grid container spacing={2}>
            {section.columns.map((column) => (
              <Grid item xs={12 / section.columns.length} key={column.id}>
                <Paper sx={{ padding: 2 }}>
                  <Typography variant="subtitle1">Column</Typography>

                  {column.widgets.map((widget) => (
                    <div key={widget.id} style={{ marginBottom: "10px" }}>
                      <Typography variant="body2">Widget: {widget.type}</Typography>

                      {/* Text Widget */}
                      {widget.type === "Text" && (
                        <TextField
                          label="Text Content"
                          value={widget.content}
                          onChange={(e) => handleWidgetChange(section.id, column.id, widget.id, e.target.value)}
                          fullWidth
                          margin="normal"
                        />
                      )}

                      {/* Image Widget */}
                      {widget.type === "Image" && (
                        <TextField
                          label="Image URL"
                          value={widget.content}
                          onChange={(e) => handleWidgetChange(section.id, column.id, widget.id, e.target.value)}
                          fullWidth
                          margin="normal"
                        />
                      )}

                      {/* Video Widget */}
                      {widget.type === "Video" && (
                        <TextField
                          label="Video URL"
                          value={widget.content}
                          onChange={(e) => handleWidgetChange(section.id, column.id, widget.id, e.target.value)}
                          fullWidth
                          margin="normal"
                        />
                      )}

                      {/* Button Widget */}
                      {widget.type === "Button" && (
                        <TextField
                          label="Button Text"
                          value={widget.content}
                          onChange={(e) => handleWidgetChange(section.id, column.id, widget.id, e.target.value)}
                          fullWidth
                          margin="normal"
                        />
                      )}

                      <IconButton onClick={() => removeWidget(section.id, column.id, widget.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  ))}

                  {/* Add Widget */}
                  <Select
                    value=""
                    onChange={(e) => addWidget(section.id, column.id, e.target.value)}
                    fullWidth
                    margin="normal"
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Add Widget
                    </MenuItem>
                    {widgetTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>

                  <IconButton onClick={() => removeColumn(section.id, column.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Button onClick={() => addColumn(section.id)} variant="outlined" startIcon={<AddIcon />} sx={{ marginTop: 1 }}>
            Add Column
          </Button>

          <Button onClick={() => removeSection(section.id)} variant="outlined" color="error" startIcon={<DeleteIcon />} sx={{ marginTop: 1, marginLeft: 1 }}>
            Remove Section
          </Button>
        </Paper>
      ))}

      <Button onClick={addSection} variant="contained" startIcon={<AddIcon />} sx={{ marginBottom: 2 }}>
        Add Section
      </Button>

      <Button onClick={handleSave} variant="contained" color="primary" sx={{ marginLeft: 1 }}>
        Save Page
      </Button>
    </Container>
  );
}
