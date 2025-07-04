"use client"; 

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Table, TableHead, TableBody, TableRow, TableCell, Button, Typography } from "@mui/material";

export default function SubmissionsList() {
  const { id } = useParams(); 
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubmissions() {
      try {
        const response = await fetch(`http://localhost:3000/api/forms/${id}/submissions`);
        const result = await response.json();

        if (result.status === "success") {
          setSubmissions(result.data);
        } else {
          alert("❌ Error fetching submissions: " + result.message);
        }
      } catch (error) {
        console.error("❌ Error fetching submissions:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubmissions();
  }, [id]);

  if (loading) return <Typography>Loading submissions...</Typography>;

  return (
    <Container>
      <Typography variant="h4">Submissions for Form {id}</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission._id}>
              <TableCell>{submission._id}</TableCell>
              <TableCell>
                {JSON.stringify(submission.submittedData, null, 2)}
              </TableCell>
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
