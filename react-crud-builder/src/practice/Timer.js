import React from 'react'
import { useRef } from 'react'
import { useState } from 'react'

export default function Timer() {
    const [clock, setClock] = useState(0)
    // let timerref = useRef(null)
    // function startTimer(e){
    //     if (timerref.current !== null) return; // Prevent multiple intervals

    //     timerref.current = setInterval(()=>{ setClock(d => d+1)}, 1000)
    // }

    // function stopTimer(){
    //     if (timerref.current !== null) 
    //     {
    //     clearInterval(timerref.current)
    //     // setClock(d => 0)
    //     timerref.current = null
    //     }


    // }

    // function resetTimer(){
    //     clearInterval(timerref.current)
    //     timerref.current = null
    //     setClock(d => 0)
        
    // }

    // using state only
    

    function startTimer(e){


    }

    function stopTimer(){

    }

    function resetTimer(){

        
    }

  return (
<>
    <div>Timer</div>
    <p>{clock}</p>
    <button onClick={startTimer}>start Timer</button>
    <button onClick={stopTimer}>stop Timer</button>
    <button onClick={resetTimer}>reset Timer</button>
</>

  )
}
