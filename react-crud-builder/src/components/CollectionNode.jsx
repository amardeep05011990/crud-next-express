// // src/CollectionNode.jsx
// import React from 'react';
// import { Handle, Position } from 'reactflow';

// const CollectionNode = ({ data }) => {
//   return (
//     <div style={{ border: '1px solid #444', padding: 10, borderRadius: 6, backgroundColor: '#fff' }}>
//       <strong>{data.label}</strong>
//       <Handle type="target" position={Position.Left} style={{ background: '#555' }} />
//       <Handle type="source" position={Position.Right} style={{ background: '#555' }} />
//     </div>
//   );
// };

// export default CollectionNode;


// import React, { useState } from "react";
// import { Handle, Position } from "reactflow";

// const CollectionNode = ({ data, id }) => {
//   const [editing, setEditing] = useState(false);
//   const [fields, setFields] = useState(data.fields || []);
//   const [name, setName] = useState(data.name || `Collection-${id}`);
//   const [newField, setNewField] = useState({ name: "", type: "string" });

//   const addField = () => {
//     if (newField.name) {
//       const updatedFields = [...fields, newField];
//       setFields(updatedFields);
//       data.fields = updatedFields;
//       setNewField({ name: "", type: "string" });
//     }
//   };

//   return (
//     <div style={{ padding: 10, border: "1px solid #333", background: "#f0f0f0" }}>
//       <Handle type="target" position={Position.Left} />
//       <Handle type="source" position={Position.Right} />

//       {editing ? (
//         <input
//           value={name}
//           onChange={(e) => {
//             setName(e.target.value);
//             data.name = e.target.value;
//             data.label = e.target.value;
//           }}
//           onBlur={() => setEditing(false)}
//           autoFocus
//         />
//       ) : (
//         <h4 onClick={() => setEditing(true)} style={{ cursor: "pointer" }}>
//           {name}
//         </h4>
//       )}

//       <ul style={{ listStyle: "none", paddingLeft: 0 }}>
//         {fields.map((f, i) => (
//           <li key={i}>
//             {f.name} : {f.type}
//           </li>
//         ))}
//       </ul>

//       <div>
//         <input
//           placeholder="Field name"
//           value={newField.name}
//           onChange={(e) => setNewField({ ...newField, name: e.target.value })}
//           style={{ width: "60%" }}
//         />
//         <select
//           value={newField.type}
//           onChange={(e) => setNewField({ ...newField, type: e.target.value })}
//           style={{ width: "38%", marginLeft: "2%" }}
//         >
//           <option value="string">string</option>
//           <option value="number">number</option>
//           <option value="boolean">boolean</option>
//           <option value="date">date</option>
//           <option value="object">object</option>
//           <option value="array">array</option>
//         </select>
//         <button onClick={addField}>➕</button>
//       </div>
//     </div>
//   );
// };

// export default CollectionNode;

import React, { useState } from "react";
import { Handle, Position } from "reactflow";

const CollectionNode = ({ data, id }) => {
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(data.name || `Collection-${id}`);
  const [fields, setFields] = useState(data.fields || []);
  const [newField, setNewField] = useState({ name: "", type: "String" });
const validationOptions = ["required", "min", "max", "minLength", "maxLength"];

  const updateParent = (updatedFields) => {
    setFields(updatedFields);
    data.fields = updatedFields;
  };

  const addField = () => {
    if (newField.name) {
      const updated = [...fields, newField];
      updateParent(updated);
      setNewField({ name: "", type: "String" });
    }
  };

  const updateField = (index, key, value) => {
    const updated = [...fields];
    updated[index][key] = value;
    updateParent(updated);
  };

  const deleteField = (index) => {
    const updated = [...fields];
    updated.splice(index, 1);
    updateParent(updated);
  };

  return (
    <div style={{ padding: 10, border: "1px solid #333", background: "#f0f0f0", width: 220 }}>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />

      {editingName ? (
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            data.name = e.target.value;
            data.label = e.target.value;
          }}
          onBlur={() => setEditingName(false)}
          autoFocus
        />
      ) : (
        <h4 onClick={() => setEditingName(true)} style={{ cursor: "pointer" }}>
          {name}
        </h4>
      )}

      <ul style={{ listStyle: "none", paddingLeft: 0 }}>
        {fields.map((f, i) => (
          <li key={i} style={{ marginBottom: 4 }}>
            <input
              value={f.name}
              onChange={(e) => updateField(i, "name", e.target.value)}
              placeholder="Field"
              style={{ width: "50%" }}
            />
            <select
              value={f.type}
              onChange={(e) => updateField(i, "type", e.target.value)}
              style={{ width: "35%", marginLeft: "2%" }}
            >
              <option value="String">String</option>
              <option value="Number">Number</option>
              <option value="Boolean">boolean</option>
              <option value="Date">date</option>
              <option value="Object">object</option>
              <option value="Array">array</option>
            </select>
            <button onClick={() => deleteField(i)} style={{ marginLeft: 4 }}>🗑️</button>


<details style={{ marginTop: 5 }}>
  <summary>🛡️ Validations</summary>
  {validationOptions.map((rule) => {
    const val = f.validation?.[rule]?.value ?? (rule === "required" ? false : "");
    const msg = f.validation?.[rule]?.message ?? "";

    return (
      <div key={rule} style={{ marginTop: 5 }}>
        <label style={{ display: "block", fontWeight: "bold" }}>{rule}</label>
        {rule === "required" ? (
          <>
            <label>
              <input
                type="checkbox"
                checked={val}
                onChange={(e) =>
                  updateField(i, "validation", {
                    ...f.validation,
                    [rule]: {
                      value: e.target.checked,
                      message: f.validation?.[rule]?.message || "",
                    },
                  })
                }
              />{" "}
              Enabled
            </label>
          </>
        ) : (
          <>
            <input
              type="number"
              placeholder="Value"
              value={val}
              onChange={(e) =>
                updateField(i, "validation", {
                  ...f.validation,
                  [rule]: {
                    value: e.target.value === "" ? "" : parseInt(e.target.value),
                    message: f.validation?.[rule]?.message || "",
                  },
                })
              }
              style={{ width: 60, marginRight: 6 }}
            />
          </>
        )}
        <input
          type="text"
          placeholder="Message"
          value={msg}
          onChange={(e) =>
            updateField(i, "validation", {
              ...f.validation,
              [rule]: {
                value: val,
                message: e.target.value,
              },
            })
          }
          style={{ width: "60%", marginLeft: 4 }}
        />
      </div>
    );
  })}
</details>


<details style={{ marginTop: 5 }}>
  <summary>🧾 Form Config</summary>

  <div style={{ marginTop: 6 }}>
    <label>Input Type:</label>
    <select
      value={f.form?.input || "text"}
      onChange={(e) =>
        updateField(i, "form", {
          ...f.form,
          input: e.target.value,
          options: ["select", "radio", "multiselect"].includes(e.target.value)
            ? f.form?.options || ["Option 1", "Option 2"]
            : [],
        })
      }
    >
      <option value="text">Text</option>
      <option value="select">Select</option>
      <option value="autocomplete">Autocomplete</option>
      <option value="multiselect">Multi Select</option>
      <option value="radio">Radio</option>
      <option value="checkbox">Checkbox</option>
    </select>
  </div>

  {["select", "radio", "multiselect"].includes(f.form?.input) && (
    <div style={{ marginTop: 6 }}>
      <label>Options (comma-separated):</label>
      <input
        type="text"
        value={f.form?.options?.join(", ") || ""}
        onChange={(e) =>
          updateField(i, "form", {
            ...f.form,
            options: e.target.value.split(",").map((opt) => opt.trim()),
          })
        }
        style={{ width: "100%" }}
      />
    </div>
  )}

  <div style={{ marginTop: 6 }}>
    <label>Grid (12-based):</label>
    <input
      type="number"
      value={f.form?.grid || 12}
      min={1}
      max={12}
      onChange={(e) =>
        updateField(i, "form", {
          ...f.form,
          grid: parseInt(e.target.value),
        })
      }
    />
  </div>
</details>




          </li>
        ))}
      </ul>

      <div style={{ marginTop: 5 }}>
        <input
          placeholder="Field name"
          value={newField.name}
          onChange={(e) => setNewField({ ...newField, name: e.target.value })}
          style={{ width: "50%" }}
        />
        <select
          value={newField.type}
          onChange={(e) => setNewField({ ...newField, type: e.target.value })}
          style={{ width: "38%", marginLeft: "2%" }}
        >
              <option value="String">String</option>
              <option value="Number">Number</option>
              <option value="Boolean">boolean</option>
              <option value="Date">date</option>
              <option value="Object">object</option>
              <option value="Array">array</option>
        </select>
        <button onClick={addField}>➕</button>
      </div>
    </div>
  );
};

export default CollectionNode;

