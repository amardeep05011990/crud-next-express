import React, { useState } from 'react'

export default function Child({dataFromParentToChild, dataFromChildToParent}) {
    console.log("dataFromParentToChild", dataFromParentToChild)

    const [input, setInput] = useState("");

    const fromChildToParent =()=>{
        dataFromChildToParent("i am from child to parent")
    }
    const onDataChange = (e)=>{
        setInput(e.target.value)
        dataFromChildToParent(e.target.value);
    }
    console.log("input element", input)

  return (
    <>
    <div>Child {dataFromParentToChild}</div>
    <input type="text" onChange={onDataChange}/>
    <button onClick={fromChildToParent}>send data to parent</button>
    </>
  )
}
