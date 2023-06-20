const mongoose=require('mongoose');
const Schema=mongoose.Schema;


const employeeSchema=new Schema({
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    id:{
        type:Number,
        required:true
    }
})

module.exports=mongoose.model("Employee",employeeSchema);