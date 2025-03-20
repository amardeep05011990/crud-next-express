"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Table, TableHead, TableBody, TableRow, TableCell, Button, Typography } from "@mui/material";

export default function SubmissionsList() {
  const { id } = useParams();
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fieldMappings, setFieldMappings] = useState({}); // ✅ Map field IDs to Labels

  useEffect(() => {
    async function fetchData() {
      try {
        // ✅ Fetch form structure
        const formResponse = await fetch(`http://localhost:3000/api/forms/${id}`);
        const formResult = await formResponse.json();

        if (formResult.status === "success" && formResult.data.structure) {
          const fieldMap = {};
          formResult.data.structure.forEach((row) => {
            row.columns.forEach((col) => {
              fieldMap[`${row.id}-${col.id}`] = col.label; // ✅ Map field ID to label
            });
          });
          setFieldMappings(fieldMap);
        }

        // ✅ Fetch submissions
        const submissionResponse = await fetch(`http://localhost:3000/api/forms/${id}/submissions`);
        const submissionResult = await submissionResponse.json();

        if (submissionResult.status === "success") {
          setSubmissions(submissionResult.data);
        } else {
          alert("❌ Error fetching submissions: " + submissionResult.message);
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  if (loading) return <Typography>Loading submissions...</Typography>;

  // ✅ Extract unique field labels from the form structure
  const fieldLabels = Object.values(fieldMappings);

  return (
    <Container>
      <Typography variant="h4">Submissions for Form {id}</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            {fieldLabels.map((label) => (
              <TableCell key={label}>{label}</TableCell>
            ))}
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission._id}>
              <TableCell>{submission._id}</TableCell>
              {Object.keys(fieldMappings).map((fieldId) => (
                <TableCell key={`${submission._id}-${fieldId}`}>
                  {/* {console.log("submission", submission)} */}
                  { Array.isArray(submission?.submittedData?.[fieldId]) ? submission?.submittedData?.[fieldId].join(",") : submission?.submittedData?.[fieldId] || "-"} {/* ✅ Display submitted values */}
                </TableCell>
              ))}
              <TableCell>
                <Button variant="contained" onClick={() => router.push(`/df/${id}/submissions/${submission._id}`)}>
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Container>
  );
}
