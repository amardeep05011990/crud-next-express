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
  RadioGroup,
  Radio,
  Box
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const fieldTypes = ["Text", "Number", "Dropdown", "Checkbox", "Radio", "TextArea", "Spacer"];
const validationTypes = ["Required", "Min Length", "Max Length", "Pattern", "Min Value", "Max Value"];
const relationTypes = ["One-to-One", "One-to-Many", "Many-to-Many"];


export default function FormBuilder({ onSave, initialData }) {
  const [formName, setFormName] = useState("");
  const [formRows, setFormRows] = useState([]);
  const [collections, setCollections] = useState([]); // ✅ Store available collections

  useEffect(() => {
    if (initialData) {
      setFormName(initialData.name);
      setFormRows(initialData.structure);
    }
    fetchCollections();
  }, [initialData]);

  // ✅ Fetch available collections for dynamic dropdowns
  const fetchCollections = async () => {
    try {
      const response = await fetch(`${apiUrl}/collections`);
      const data = await response.json();
      if (data.status === "success") {
        setCollections(data.collections);
      }
    } catch (error) {
      console.error("❌ Error fetching collections:", error);
    }
  };

  // ✅ Add New Row
  // const addRow = () => {
  //   setFormRows([
  //     ...formRows,
  //     {
  //       id: Date.now(),
  //       columns: [
  //         { id: Date.now(), type: "Text", label: "", validations: [], options: [], collection: "" },
  //       ],
  //     },
  //   ]);
  // };

  const addRow = () => {
    // ✅ Find the highest column position across all rows
    const highestPosition = formRows.flatMap(row => row.columns)
      .reduce((max, col) => Math.max(max, col.position ?? 0), 0);
  
    // ✅ Add new row with a column having the next position
    setFormRows([
      ...formRows,
      {
        id: Date.now(),
        columns: [
          {
            id: Date.now(),
            type: "Text", 
            label: "New Field",
            validations: [],
            position: highestPosition + 1, // ✅ Next available position
          },
        ],
      },
    ]);
  };

  // ✅ Remove a Row
  const removeRow = (rowId) => {
    setFormRows(formRows.filter((row) => row.id !== rowId));
  };

  // ✅ Add Column to a Row
  // const addColumn = (rowId) => {
  //   setFormRows(
  //     formRows.map((row) =>
  //       row.id === rowId
  //         ? {
  //             ...row,
  //             columns: [
  //               ...row.columns,
  //               { id: Date.now(), type: "Text", label: "", validations: [], options: [], collection: "" },
  //             ],
  //           }
  //         : row
  //     )
  //   );
  // };
  const addColumn = (rowId, fieldType = "Text") => {
    setFormRows(
      formRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              columns: [
                ...row.columns,
                {
                  id: Date.now(),
                  type: fieldType,
                  label: fieldType === "Spacer" ? "" : "New Field",
                  validations: [],
                  position: row.columns.length > 0
                    ? Math.max(...row.columns.map((col) => col.position ?? 0)) + 1
                    : 1, // Start from 1 if no columns exist
                },
              ],
            }
          : row
      )
    );
  };
  
  // ✅ Remove Column from a Row
  const removeColumn = (rowId, columnId) => {
    setFormRows(
      formRows.map((row) =>
        row.id === rowId
          ? { ...row, columns: row.columns.filter((col) => col.id !== columnId) }
          : row
      )
    );
  };

  // ✅ Handle Field Updates
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

  // ✅ Add Dropdown Option
  const addDropdownOption = (rowId, columnId) => {
    setFormRows(
      formRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              columns: row.columns.map((col) =>
                col.id === columnId
                  ? { ...col, options: [...col.options, { id: Date.now(), value: "" }] }
                  : col
              ),
            }
          : row
      )
    );
  };

  // ✅ Remove Dropdown Option
  const removeDropdownOption = (rowId, columnId, optionId) => {
    setFormRows(
      formRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              columns: row.columns.map((col) =>
                col.id === columnId
                  ? { ...col, options: col.options.filter((opt) => opt.id !== optionId) }
                  : col
              ),
            }
          : row
      )
    );
  };

  // ✅ Update Dropdown Option Value
  const updateDropdownOption = (rowId, columnId, optionId, value) => {
    setFormRows(
      formRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              columns: row.columns.map((col) =>
                col.id === columnId
                  ? {
                      ...col,
                      options: col.options.map((opt) =>
                        opt.id === optionId ? { ...opt, value } : opt
                      ),
                    }
                  : col
              ),
            }
          : row
      )
    );
  };

    // ✅ Handle Dropdown Source Selection (Manual or Collection)
    const handleDropdownSourceChange = (rowId, columnId, sourceType) => {
      setFormRows(
        formRows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                columns: row.columns.map((col) =>
                  col.id === columnId
                    ? { ...col, source: sourceType, options: sourceType === "manual" ? col.options : [], collection: sourceType === "collection" ? col.collection : "" }
                    : col
                ),
              }
            : row
        )
      );
    };

    const addCheckboxOption = (rowId, columnId) => {
      setFormRows(
        formRows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                columns: row.columns.map((col) =>
                  col.id === columnId
                    ? {
                        ...col,
                        options: Array.isArray(col.options) ? [...col.options, { id: Date.now(), value: "" }] : [{ id: Date.now(), value: "" }]
                      }
                    : col
                ),
              }
            : row
        )
      );
    };
    

    const updateCheckboxOption = (rowId, columnId, optionId, value) => {
      setFormRows(
        formRows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                columns: row.columns.map((col) =>
                  col.id === columnId
                    ? {
                        ...col,
                        options: Array.isArray(col.options)
                          ? col.options.map((opt) =>
                              opt.id === optionId ? { ...opt, value } : opt
                            )
                          : [], // Ensure it's always an array
                      }
                    : col
                ),
              }
            : row
        )
      );
    };
    
    const removeCheckboxOption = (rowId, columnId, optionId) => {
      setFormRows(
        formRows.map((row) =>
          row.id === rowId
            ? {
                ...row,
                columns: row.columns.map((col) =>
                  col.id === columnId
                    ? {
                        ...col,
                        options: Array.isArray(col.options) ? col.options.filter((opt) => opt.id !== optionId) : []
                      }
                    : col
                ),
              }
            : row
        )
      );
    };
    
    
  // ✅ Save Form
  const handleSave = () => {
    onSave({ name: formName, structure: formRows });
  };

  return (
    <>
      <Box
  style={{ flex: 1, marginLeft: "-200px" }}
>
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
            {row.columns.map((column, index) => (
              <Grid item xs={12 / row.columns.length} key={column.id+ "-"+ index}>
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
                  {fieldTypes.map((type, ind) => (
                    <MenuItem key={type+ ind} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>

                <TextField
                  label="Position"
                  type="number"
                  value={column.position ?? ""}
                  onChange={(e) => handleFieldChange(row.id, column.id, "position", parseInt(e.target.value, 10) || 0)}
                  fullWidth
                  margin="normal"
                />


                {/* ✅ Dropdown Options */}
                {/* {column.type === "Dropdown" && (
                  <>
                    <Typography variant="subtitle1">Dropdown Options</Typography>
                    {column?.options?.map((option) => (
                      <div key={option.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <TextField
                          label="Option Value"
                          value={option.value}
                          onChange={(e) => updateDropdownOption(row.id, column.id, option.id, e.target.value)}
                        />
                        <IconButton onClick={() => removeDropdownOption(row.id, column.id, option.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    ))}
                    <Button onClick={() => addDropdownOption(row.id, column.id)}>+ Add Option</Button>
                  </>
                )} */}

                {/* ✅ Fetch From Collection Option */}
                {/* {column.type === "Dropdown" && (
                  <>
                    <Typography variant="subtitle1">Fetch Options From Collection</Typography>
                    <Select
                      value={column.collection}
                      onChange={(e) => handleFieldChange(row.id, column.id, "collection", e.target.value)}
                      fullWidth
                      margin="normal"
                    >
                      <MenuItem value="">None</MenuItem>
                      {collections.map((col) => (
                        <MenuItem key={col.name} value={col.name}>
                          {col.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </>
                )} */}
                
                {/* ✅ Radio Group to Select Source */}
                {/* {column.type === "Dropdown" && (
                  <RadioGroup
                    row
                    value={column.source}
                    onChange={(e) => handleDropdownSourceChange(row.id, column.id, e.target.value)}
                  >
                    <FormControlLabel value="manual" control={<Radio />} label="Manual Input" />
                    <FormControlLabel value="collection" control={<Radio />} label="From Collection" />
                  </RadioGroup>
                )} */}

                {/* ✅ Dropdown Options (Manual) */}
                {/* {column.type === "Dropdown" && column.source === "manual" && (
                  <>
                    <Typography variant="subtitle1">Drop          down Options</Typography>
                    {column?.options?.map((option) => (
                      <div key={option.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <TextField
                          label="Option Value"
                          value={option.value}
                          onChange={(e) => updateDropdownOption(row.id, column.id, option.id, e.target.value)}
                        />
                        <IconButton onClick={() => removeDropdownOption(row.id, column.id, option.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    ))}
                    <Button onClick={() => addDropdownOption(row.id, column.id)}>+ Add Option</Button>
                  </>
                )} */}

                {/* ✅ Fetch From Collection */}
                {/* {column.type === "Dropdown" && column.source === "collection" && (
                  <Select
                    value={column.collection}
                    onChange={(e) => handleFieldChange(row.id, column.id, "collection", e.target.value)}
                    fullWidth
                  >
                    <MenuItem value="">None</MenuItem>
                    {collections.map((col) => (
                      <MenuItem key={col.name} value={col.name}>
                        {col.name}
                      </MenuItem>
                    ))}
                  </Select>
                )} */}

{column.type === "Dropdown" && (
  <>
    {/* Choose Between "Manual Options" or "From Collection" */}
    <Typography variant="subtitle1">Dropdown Source</Typography>
    <Select
      value={column.source || "manual"}
      onChange={(e) => handleFieldChange(row.id, column.id, "source", e.target.value)}
      fullWidth
      margin="normal"
    >
      <MenuItem value="manual">Manual Options</MenuItem>
      <MenuItem value="collection">From Collection</MenuItem>
      <MenuItem value="relation">Create Relation</MenuItem>
    </Select>

    {/* ✅ Manual Dropdown Options */}
    {column.source === "manual" && (
      <>
        <Typography variant="subtitle1">Dropdown Options</Typography>
        {column.options.map((option) => (
          <div key={option.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <TextField
              label="Option Value"
              value={option.value}
              onChange={(e) => updateDropdownOption(row.id, column.id, option.id, e.target.value)}
            />
            <IconButton onClick={() => removeDropdownOption(row.id, column.id, option.id)} color="error">
              <DeleteIcon />
            </IconButton>
          </div>
        ))}
        <Button onClick={() => addDropdownOption(row.id, column.id)}>+ Add Option</Button>
      </>
    )}

    {/* ✅ Fetch Options from Collection */}
    {column.source === "collection" && (
      <>
        <Typography variant="subtitle1">Collection Name</Typography>
        <Select
          value={column.collection || ""}
          onChange={(e) => handleFieldChange(row.id, column.id, "collection", e.target.value)}
          fullWidth
          margin="normal"
        >
          <MenuItem value="">None</MenuItem>
          {collections?.map((col) => (
            <MenuItem key={col.name} value={col.id}>
              {col.name}
            </MenuItem>
          ))}
        </Select>
      </>
    )}
  </>
)}

              {column.source === "relation" && (
                  <Select
                    value={column.relationType}
                    onChange={(e) => handleFieldChange(row.id, column.id, "relationType", e.target.value)}
                    fullWidth
                    margin="normal"
                  >
                    {relationTypes.map((rel) => (
                      <MenuItem key={rel} value={rel}>
                        {rel}
                      </MenuItem>
                    ))}
                  </Select>
                )}
    {column.source === "relation" && (
      <>
        <Typography variant="subtitle1">Collection Name</Typography>
        <Select
          value={column.collection || ""}
          onChange={(e) => handleFieldChange(row.id, column.id, "collection", e.target.value)}
          fullWidth
          margin="normal"
        >
          <MenuItem value="">None</MenuItem>
          {collections?.map((col) => (
            <MenuItem key={col.name} value={col.id}>
              {col.name}
            </MenuItem>
          ))}
        </Select>
      </>
    )}
                

{column.type === "Radio" && (
  <>
    <Typography variant="subtitle1">Radio Options</Typography>
    {column.options.map((option, index) => (
      <div key={option.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <TextField
          label={`Option ${index + 1}`}
          value={option.value}
          onChange={(e) => updateDropdownOption(row.id, column.id, option.id, e.target.value)}
          fullWidth
        />
        <IconButton onClick={() => removeDropdownOption(row.id, column.id, option.id)} color="error">
          <DeleteIcon />
        </IconButton>
      </div>
    ))}
    <Button onClick={() => addDropdownOption(row.id, column.id)}>+ Add Option</Button>
  </>
)}

{column.type === "TextArea" && (
  <TextField
    label="Text Area"
    multiline
    rows={4} // ✅ Adjust the number of rows
    value={column.label}
    onChange={(e) => handleFieldChange(row.id, column.id, "label", e.target.value)}
    fullWidth
    margin="normal"
  />
)}

{/* ✅ Checkbox Options */}
{column.type === "Checkbox" && (
  <>
    <Typography variant="subtitle1">Checkbox Options</Typography>
    {column?.options?.map((option, index) => (
      <div key={`${column.id}-option-${option.id}-${index}`} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <TextField
          label={`Option ${index + 1}`}
          value={option.label}
          onChange={(e) => updateCheckboxOption(row.id, column.id, option.id, e.target.value)}
        />
        <IconButton onClick={() => removeCheckboxOption(row.id, column.id, option.id)} color="error">
          <DeleteIcon />
        </IconButton>
      </div>
    ))}
    <Button onClick={() => addCheckboxOption(row.id, column.id)}>+ Add Option</Button>
  </>
)}


{column.type === "Spacer" && (
  <div style={{ width: "100%", height: "40px", background: "#f5f5f5", border: "1px dashed #ccc" }}>
    {/* ✅ This is a placeholder for the spacer */}
  </div>
)}

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
                {column?.validations?.map((validation) => (
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
          <Button onClick={() => removeRow(row.id)} variant="outlined" color="error" startIcon={<DeleteIcon />} style={{ marginLeft: "10px" }}>
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
      </Box>
    </>
  );
}
