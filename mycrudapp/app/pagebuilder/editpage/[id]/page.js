"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PageBuilder from "./../../components/PageBuilder";

export default function EditPage() {
  const { id } = useParams(); // ✅ Get Page ID from URL
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch Page Data for Editing
  useEffect(() => {
    async function fetchPage() {
      try {
        const response = await fetch(`http://localhost:3000/api/pages/${id}`);
        const result = await response.json();

        if (response.ok) {
          setPageData(result.data); // ✅ Set the existing page data
        } else {
          alert("❌ Error fetching page: " + result.message);
        }
      } catch (error) {
        console.error("❌ Error fetching page:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) fetchPage();
  }, [id]);

  // ✅ Handle Save Function (Update Page)
  const handleUpdate = async (data) => {
    try {
      console.log("📌 Updating Page Data:", data);

      const response = await fetch(`http://localhost:3000/api/pages/${id}`, {
        method: "PUT", // ✅ Use PUT to update the page
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.ok) {
        alert("✅ Page updated successfully!");
      } else {
        alert("❌ Error updating page: " + result.message);
      }
    } catch (error) {
      console.error("❌ Error updating page:", error);
    }
  };

  if (loading) return <p>Loading page...</p>;

  return <PageBuilder onSave={handleUpdate} initialData={pageData} />;
}
