"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Container, Typography, Button, Grid, Paper } from "@mui/material";

export default function PageRenderer() {
  const { id } = useParams(); // Get page ID from URL
  const [page, setPage] = useState(null);

  useEffect(() => {
    fetchPage();
  }, [id]);

  async function fetchPage() {
    try {
      const response = await fetch(`http://localhost:3000/api/pages/${id}`);
      const result = await response.json();

      if (result.status === "success") {
        setPage(result.data);
      }
    } catch (error) {
      console.error("❌ Error fetching page:", error);
    }
  }

  if (!page) return <Typography>Loading...</Typography>;

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        {page.title}
      </Typography>

      {page.sections.map((section) => (
        <Paper key={section.id} sx={{ padding: 2, marginBottom: 2 }}>
          <Grid container spacing={2}>
            {section.columns.map((column) => (
              <Grid item xs={12 / section.columns.length} key={column.id}>
                <Paper sx={{ padding: 2 }}>
                  {column.widgets.map((widget) => (
                    <div key={widget.id} style={{ marginBottom: "10px" }}>
                      {widget.type === "Text" && (
                        // <Typography variant="body1">{widget.content}</Typography>
                        <div dangerouslySetInnerHTML={{ __html: widget.content }} />
                      )}
                      {widget.type === "Image" && (
                        <img src={widget.content} alt="Widget" style={{ width: "100%", height: "auto" }} />
                      )}
                      {widget.type === "Video" && (
                        <iframe
                          width="100%"
                          height="315"
                          src={widget.content}
                          title="Video"
                          frameBorder="0"
                          allowFullScreen
                        ></iframe>
                      )}
                      {widget.type === "Button" && (
                        <Button variant="contained" color="primary">
                          {widget.content}
                        </Button>
                      )}
                    </div>
                  ))}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      ))}
    </Container>
  );
}
