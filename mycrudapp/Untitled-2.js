  // Auto Complete implementation

  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);

    // ✅ Fetch data from API (Server-side search)
    // useEffect(() => {
    //   if (searchTerm.length < 2) {
    //     setOptions([]); // Clear options if search term is too short
    //     return;
    //   }
  
    //   // ✅ Debounce API calls (reduce API calls while typing)
    //   const delayDebounceFn = setTimeout(() => {
    //     fetchOptions();
    //   }, 500); // 500ms delay
  
    //   return () => clearTimeout(delayDebounceFn); // Cleanup previous calls
    // }, [searchTerm]);


    const fetchOptions = async (formStructure) => {
      setLoading(true);
      // try {
      //   const response = await fetch(`${apiUrl}/forms/${id}/collections/search?query=${searchTerm}`);
      //   const result = await response.json();
      //   if (result.status === "success") {
      //     setOptions(result.data);
      //   }
      // } catch (error) {
      //   console.error("❌ Error fetching options:", error);
      // }
      let fetchedData = {};
      for (const row of formStructure) {
        for (const column of row.columns) {
          if (
            column.type === "Dropdown" &&
            column.source === "collection" &&
            column.collection
          ) {
            try {
              const response = await fetch(
                `${apiUrl}/forms/${column.collection}/submissions?search=${searchTerm}`
              );
              const result = await response.json();
              if (result.status === "success") {
                fetchedData[column.collection] = result.data;
              }
            } catch (error) {
              console.error(
                `❌ Error fetching collection ${column.collection}:`,
                error
              );
            }
          }
        }
      }
      setOptions(fetchedData);
      setLoading(false);
    };
  