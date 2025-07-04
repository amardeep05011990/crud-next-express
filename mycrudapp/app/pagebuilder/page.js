"use client";

import PageBuilder from "./components/PageBuilder";

export default function PageBuilderPage() {
//   return <PageBuilder onSave={(data) => console.log("Page Data:", data)} />;
// const [savedData, setSavedData] = useState(null);

// ✅ Handle Save Function (Runs in Client)
const handleSave = async (data) => {
  try {
    console.log("📌 Saving Page Data:", data);

    const response = await fetch("http://localhost:3000/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (response.ok) {
      alert("✅ Page saved successfully!");
    //   setSavedData(result);
    } else {
      alert("❌ Error saving page: " + result.message);
    }
  } catch (error) {
    console.error("❌ Error saving page:", error);
  }
};

return <PageBuilder onSave={handleSave} />;
}
