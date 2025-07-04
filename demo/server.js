const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const mongoose = require('mongoose')
mongoose.connect("mongodb://localhost:27017/demo-exp").then(()=>{
    console.log("connected to db")
}).catch((e)=>{
    console.log("error connecting to db", e.message)
})

const saveSchema = mongoose.Schema({
    name: {type: String, required: true},
    age: {type: Number, required: true},
    // email: {type: String, required: true},
    // password: {type: String, required: true},
    createdAt: {type: Date, default: Date.now}
})

const saveModal= mongoose.model("User", saveSchema)

app.use(bodyParser.json()) 
const  {validationRule, validationRuleForPost} =  require('./validationRule');

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

app.get('/:name',validationRule, validate, async (req, res, next)=>{
    try{
        const user = new Save({
            name: req.body.name,
            age: req.body.age,
        })
       const data = await User.save();
        console.log("data", data);
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

app.post("/save",validationRuleForPost, validate,  (req, res)=>{
    try{
        // throw new Error("custom error")
        res.status(200).json({message: req.body})

    }catch(err){
        console.log(err.message);
        next(err);
        // res.status(500).send({message: e.message})
    }
})

app.use(globalErrorCatch)


const PORT = 3000;
app.listen(PORT, ()=>{
    console.log(`server get started on port ${PORT}`)
})