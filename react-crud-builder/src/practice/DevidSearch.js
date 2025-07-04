// 1. Create a Component that retrieves data from the Open Library api search endpoint and builds a table of 'Title' 'Author' 'First Publish Year' for each of the books based on the search.

// 2. Make table row clickable to show book details in a pop-up window (virtual pop-up with close button) by querying with OLID (cover_edition_key)
//    https://openlibrary.org/books/OL51711484M.json

//    and show Title, Edition Name, Revision, and Last Modified.

// Feel free to google, but you'll need to be able to explain your solution.



import React, { useEffect, useState } from 'react';


export function DevidSearch(){
    const [searchKey, setSearchKey] = useState([]);
  const [data, setData] = useState([]);
  useEffect(() => {
    // fetch('https://openlibrary.org/search.json?q=the+lord+of+the+rings').then(
    //   (data) => {
    //     console.log(data.json());
    //   }
    // );
    fetch(`https://openlibrary.org/search.json?q=the+lord+of+the+rings`)
      // Fetch data based on the current page
      .then((response) => {
        console.log("response.json()", response);
        return response.json();
      }) // Parse the response as JSON
      .then((data) => {
        console.log('data', data.docs);
        setData(data.docs); // Set the fetched data
      });
  }, []);

  function search() {
    fetch('https://openlibrary.org/search.json?q=' + searchKey) // Fetch data based on the current page
      .then((response) => response.json()) // Parse the response as JSON
      .then((data) => {
        console.log('data searched', data.docs);
        setData(data.docs); // Set the fetched data
      });
  }

  useEffect(() => {
    if(!searchKey) return;
    // if (setSearchKey) {
    const timer = setTimeout(() => {
      
        search();
     
    },200);
    return clearTimeout(timer);
    //  }
  }, [searchKey]);

  return (
    <div>
      <input
        type="text"
        onChange={(e) => setSearchKey(e.target.value)}
        placeholder="Search"
      />
      <button type="button">Get Results!</button>
      <table>
        {data?.map((ele, ind) => {
          return (
            <tr key={ind}>
              <td>{ele.title}</td>
              <td>{ele.author_name}</td>
              <td>{ele.first_publish_year}</td>
            </tr>
          );
        })}

        {/* Build your table here */}
      </table>
    </div>
  );
}