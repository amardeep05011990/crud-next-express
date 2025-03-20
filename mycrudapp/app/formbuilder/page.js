"use client";
import FormBuilder from "./components/FormBuilder";
import SideMenu from "./../SideMenu";
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
export default function FormBuilderPage() {

  const handleSave = async (formData) => {
    try {
      const response = await fetch(`${apiUrl}/forms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // ✅ Send dynamic name
      });

      const result = await response.json();
      if (response.ok) {
        alert("✅ Form saved successfully!");
        console.log("Saved Form:", result);
      } else {
        alert("❌ Error saving form: " + result.message);
      }
    } catch (error) {
      console.error("❌ Error:", error);
    }
  };

  return (
    <>
 {/* <SideMenu> */}
    <FormBuilder onSave={handleSave} />
  {/* </SideMenu> */}
  </>
  );
}
