import React, {useState}from 'react'

export default function FormDemo() {
  const [formdata, setFormdata] = useState({
    name: '',
    email: '',
    citydata: '',
    citydataname: '',
    country: ''
  })

  const [cityDropDown, setCityDropDown] = useState([]);
  

  const data = [
    {name: "amar", id: 1, city:"jaipur"},
  {name: "yamini", id: 1, city:"delhi"},
  {name: "saurab", id: 1, city:"delhi"}
]
const cityArray =[{cityname: "jaipur", id: 111}, {cityname: "delhi", id: 112}]

  function add(e){
  
    const {name, value, type, checked} = e.target;
      console.log(e.target, name, value, type, checked)
    setFormdata(prev=>{
     return {
      ...prev,
      [name]: value
    }
    })
    // setFormdata()
    console.log("form data", formdata)
  }

  function submit(e){
    e.preventDefault();
console.log("form data", formdata)
  }

  function ChangeFirstDropDown(e){
    console.log(e.target)

    const getCityData = data.filter((ele)=>ele.city == e.target.value)
    setCityDropDown(getCityData)
  }
  console.log(cityDropDown)

  function handleCitydataname(e){
console.log(e.target)
  }
  

  return (
    <div>
      <h2>Form Demo</h2>
      <p>This is a demo for form handling in React.</p>
      {/* You can add your form components here */}
      <form onSubmit={submit}>
        <label>
          Name:
          <input type="text" name="name" onChange={add} />
        </label>
        <br />
        <label>
          Email:
          <input type="text" name="email" onChange={add} />
        </label>
        <br />

        <label>
          County:
          <input type="checkbox" name="country" checked={formdata.country} onChange={add} />
          <input type="checkbox" name="country" checked={formdata.country} onChange={add} />
          <input type="checkbox" name="country" checked={formdata.country} onChange={add} />
        </label>
        <br />
              <select onChange={ChangeFirstDropDown} name="city">
        {cityArray ? 
        
          cityArray.map((citydata)=>{

            return (<option key={citydata.id} value={citydata.id}>{citydata.cityname}</option>)
          })
           : (
            <option>no data</option>
          ) }
      </select>
      <br/>

            <select onChange={handleCitydataname} name="citydataname">
        {cityDropDown ? 
        cityDropDown.map((d, index)=>{

            return (<option key={index} value={d.name}>{d.name}</option>)
          }
          ) : (
            <option>no city selected</option>
          ) }
      </select>
        <button type="submit">Submit</button>
      </form>

    </div>
  )
}
