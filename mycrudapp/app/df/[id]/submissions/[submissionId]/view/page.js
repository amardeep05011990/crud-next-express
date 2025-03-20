"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
} from "@mui/material";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function SubmissionDetails() {
  const { id, submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fieldMappings, setFieldMappings] = useState({});

  useEffect(() => {
    async function fetchData() {
      try {
        // ✅ Fetch Form Structure (Field Labels)
        const formResponse = await fetch(`${apiUrl}/forms/${id}`);
        const formResult = await formResponse.json();

        if (formResult.status === "success" && formResult.data.structure) {
          const fieldMap = {};
          formResult.data.structure.forEach((row) =>
            row.columns.forEach((col) => {
              fieldMap[`${row.id}-${col.id}`] = col.label;
            })
          );
          setFieldMappings(fieldMap);
        }

        // ✅ Fetch Submission Data
        const submissionResponse = await fetch(`${apiUrl}/forms/${id}/submissions/${submissionId}`);
        const submissionResult = await submissionResponse.json();

        if (submissionResult.status === "success") {
          setSubmission(submissionResult.data);
        } else {
          alert("❌ Error fetching submission: " + submissionResult.message);
        }
      } catch (error) {
        console.error("❌ Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, submissionId]);

  if (loading) return <Box sx={{ textAlign: "center", mt: 5 }}><CircularProgress /></Box>;
  if (!submission) return <Typography sx={{ textAlign: "center", mt: 5 }}>No Submission Found</Typography>;

  return (
    <Box sx={{ p: 3 }} style={{ flex: 1, marginLeft: "-200px" }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Submission Details</Typography>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Grid container spacing={3}>
          {/* ✅ Render Form Fields */}
          {Object.entries(submission.submittedData).map(([key, value], index) => (
            <Grid item xs={12} md={6} key={index}>
              <Typography variant="subtitle2" color="textSecondary">
                {fieldMappings[key] || `Field ${key}`}:
              </Typography>

              {/* ✅ Check if value is an image URL */}
              {typeof value === "string" && value.match(/\.(jpeg|jpg|gif|png)$/) ? (
                <Card sx={{ maxWidth: 200, mt: 1 }}>
                  <CardMedia component="img" height="150" image={value} alt="Uploaded Image" />
                  <CardContent>
                    <Typography variant="body2" color="textSecondary">Uploaded Image</Typography>
                  </CardContent>
                </Card>
              ) : (
                <Typography variant="body1">{Array.isArray(value) ? value.join(", ") : value}</Typography>
              )}
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
