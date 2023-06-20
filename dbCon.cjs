const mongoose=require("mongoose")
const URI="mongodb+srv://mongoTut:%231234Abcd@cluster0.i74ieuk.mongodb.net/?retryWrites=true&w=majority"
const connectDb=async()=>{
    try{
        await mongoose.connect(URI,{
            useUnifiedTopology:true,
            useNewUrlParser:true,
        })
    }catch(err){
        console.error(err)
    }
}

module.exports=connectDb