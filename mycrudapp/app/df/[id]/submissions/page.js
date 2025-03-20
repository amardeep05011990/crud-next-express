"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Container,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Typography,
  TextField,
  TablePagination,
} from "@mui/material";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export default function SubmissionsList() {
  const { id } = useParams();
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fieldMappings, setFieldMappings] = useState({});
  const [searchQuery, setSearchQuery] = useState(""); // ✅ Search input
  const [page, setPage] = useState(0); // ✅ Pagination
  const [rowsPerPage, setRowsPerPage] = useState(2);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        // ✅ Fetch form structure
        const formResponse = await fetch(`${apiUrl}/forms/${id}`);
        const formResult = await formResponse.json();

        if (formResult.status === "success" && formResult.data.structure) {
          const fieldMap = {};
          formResult.data.structure.forEach((row) => {
            row.columns.forEach((col) => {
              fieldMap[`${row.id}-${col.id}`] = col.label;
            });
          });
          setFieldMappings(fieldMap);
        }

        // ✅ Fetch submissions (server-side pagination + search)
        const submissionResponse = await fetch(
          `${apiUrl}/forms/${id}/submissions?page=${page + 1}&limit=${rowsPerPage}&search=${searchQuery}`
        );
        const submissionResult = await submissionResponse.json();

        if (submissionResult.status === "success") {
          setSubmissions(submissionResult.data);
          console.log("submissionResult.total",submissionResult.total)
          setTotalCount(submissionResult.total); // ✅ Store total count for pagination
                  // ✅ If current page is beyond available results, reset to page 0
        if (page > 0 && submissionResult.data.length === 0) {
          setPage(0);
        }
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
  }, [id, page, rowsPerPage, searchQuery]); // ✅ Fetch data when search/page changes

  if (loading) return <Typography>Loading submissions...</Typography>;

  const fieldLabels = Object.values(fieldMappings);
  console.log("submissions==>>>", submissions)

  return (
    <Container style={{ flex: 1, marginLeft: "-200px" }}>
      <Typography variant="h4">View Form {id}</Typography>

      {/* ✅ Search Input */}
      <TextField
        label="Search Submissions"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            {Object.entries(fieldMappings).map(([fieldId, label], index) => (
              <TableCell key={`${fieldId}-${label}-${index}`}>{label}</TableCell>
              ))}
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.map((submission,  index) => (
            <TableRow key={`${submission._id}-${index}`}>
              <TableCell>{submission._id}</TableCell>
              {Object.keys(fieldMappings).map((fieldId, index) => (
                <TableCell key={`${submission._id}-${fieldId}-${index}`}>
                  {Array.isArray(submission?.submittedData?.[fieldId])
                    ? submission?.submittedData?.[fieldId].join(", ")
                    : submission?.submittedData?.[fieldId] || "-"}
                </TableCell>
              ))}
              <TableCell>
                <Button
                  variant="contained"
                  onClick={() => router.push(`/df/${id}/submissions/${submission._id}`)}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.push(`/df/${id}/submissions/${submission._id}/view`)}
                >
                  view
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ✅ Server-Side Pagination */}
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0); // Reset to first page
        }}
      />
    </Container>
  );
}
