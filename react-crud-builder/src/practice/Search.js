
import React, {useState, useEffect, useRef} from "react"
export default function Search() {

    const earndata = [
        {month: "jan", earn: 100},
        {month: "feb", earn: 50},
        {month: "mar", earn: 150},
    ];

    const tref = useRef('');
    const [data, setData] = useState([])
    const [searchKey, setSearchKey]= useState("");

        useEffect(()=>{
            setData(earndata);
        }, []);


        // console.log("data", data);

        function getTable(e){
            
            const table = tref.current;
            const rows = table.querySelectorAll("tbody tr");
            console.log(table)
            rows[0].style.backgroundColor = "red";
            console.log()
            console.log(rows[0].querySelectorAll('td')[0].textContent)
        }

        function getRowRed(e){
            console.log( e.currentTarget)
            const row = e.currentTarget;
            //  const table = tref.current;
            // const rows = table.querySelectorAll("tbody tr");
            // console.log(table)
            // rows[0].style.backgroundColor = "red";
            // Clear background from all rows
            const rows = tref.current.querySelectorAll("tbody tr");
            rows.forEach((r) => (r.style.backgroundColor = ""));

            // Set background for selected row
            row.style.backgroundColor = "red";
        }

        useEffect(()=>{
            // searchData()

            if(searchKey){

            const timer = setTimeout(()=>{
                console.log("searchKey", searchKey)
                const filterdata = earndata.filter(ele=> ele.month == searchKey)
                // console.log("filtered data", filterdata)
                setData(filterdata)
            }, 400)

            return ()=> clearTimeout(timer)

            }


        }, [searchKey])

        function searchData(){
            console.log(searchKey)
        }
        
    return (
    <>
    <h1>search </h1>
    <form>
        <input type="text" name="search" value={searchKey} onChange={(e)=> setSearchKey(e.target.value)}/>
        <button onClick={searchData}> search</button>
    </form>

        <table>
    <thead>
        <tr>
        <th>Month</th>
        <th>Savings</th>
        </tr>
    </thead>
    <tbody ref={tref}>
        {data && data.map((ele, ind)=>{
            return (
        <tr onClick={getRowRed} key={ind}>
        <td>{ele.month}</td>
        <td>${ele.earn}</td>
        </tr>
            )
        })}

    </tbody>
    <tfoot>
        <tr>
        <td>Sum</td>
        <td>$180</td>
        </tr>
    </tfoot>
    </table>
    <div><button onClick={getTable}>click </button></div>

    {/* <table>
    <thead>
        <tr>
        <th>Month</th>
        <th>Savings</th>
        </tr>
    </thead>
    <tbody>
        <tr>
        <td>January</td>
        <td>$100</td>
        </tr>
        <tr>
        <td>February</td>
        <td>$80</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
        <td>Sum</td>
        <td>$180</td>
        </tr>
    </tfoot>
    </table> */}
    </>
    )
}