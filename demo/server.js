const express = require("express");
const app = express();

const  {validationRule} =  require('./validationRule');

const  {validationResult, body, param, query} =  require('express-validator');

const globalErrorCatch = (e, req, res, next)=>{
    // if(req || )
    console.log("globalError", e.message, e.StatusCode)
    // next();
   return res.status(500).json({
        type: "error",
        messageasdf: e.message,
    })
  
    }

    // const validationRule =  [
    //         query('name').notEmpty().withMessage('please enter the name'),
    //         query('age').notEmpty().withMessage('please enter the age')

    //     ]

    const validate = (req, res, next) =>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
           return res.status(400).json({
                StatusCode:400,
                errors,
            })
        }
        next();
    }

app.get('/:name',validationRule, validate, (req, res, next)=>{
    try{
        // throw new Error("custom error")
        res.status(200).json({message: req.params.name})

    }catch(err){
        console.log(err.message);
        next(err);
        // res.status(500).send({message: e.message})
    }
})

app.get('/childprocess', (req, res)=>{
    

})

app.use(globalErrorCatch)


const PORT = 3000;
app.listen(PORT, ()=>{
    console.log(`server get started on port ${PORT}`)
})