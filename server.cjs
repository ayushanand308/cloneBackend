
const express = require("express");
const app = express();
const PORT =8002;
var jwt = require("jsonwebtoken");
const JWT_SECRET = "secret";
const bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
const cors = require("cors");
app.use(cors());
app.use(jsonParser);
const User=require("./Employee.cjs")
const bcrypt = require("bcrypt");
const mongoose=require('mongoose');
const connectDb=require('./dbCon.cjs')
connectDb();
const dotenv = require("dotenv")
const multer=require('multer')
const axios = require('axios');
const {Configuration,OpenAIApi}=require("openai");
const fs=require('fs');


dotenv.config()



let USER_ID_COUNTER = 0;
const configuration=new Configuration({
  apiKey:process.env.REACT_APP_API_KEY
})
const openai=new OpenAIApi(configuration);

const API_KEY = process.env.REACT_APP_API_KEY;


app.post('/completions', async (req, res) => {
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    data: {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: req.body.message }],
      max_tokens: 1000,
    },
  };

  try {
    const response = await axios('https://api.openai.com/v1/chat/completions', options);
    res.send(response.data);
  } catch (error) {
    console.error(error);
  }
});


app.post('/generations',async (req, res) => {
  const { prompt } = req.body;

  const options = {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    data:{
      prompt: prompt,
      n: 2,
      size: "1024x1024"
    }
  };

  try {
    const response = await axios("https://api.openai.com/v1/images/generations", options);
    res.send(response.data);
  } catch (error) {
    console.error(error);
  }
});


app.post('/signup',async function(req, res) {
  const { email, password } = req.body;
/*   const userExists = USERS.find(user => user.email === email);
 */

  const  userExists=await User.findOne({email:email}).exec();
  if (userExists) {
    res.status(400).send({ message: "User already exists" });
    
  } else {
    bcrypt.hash(password, 10,async function(err, hash) {
      if (err) {
        res.status(500).send({ message: "Internal server error" });
      } else {
        
        /* USERS.push({ email, password: hash, id: USER_ID_COUNTER+1});
        USER_ID_COUNTER++; */
/*         console.log(USER_ID_COUNTER)
 */        
        const result=await User.create({
          "email":email,
          "password":hash,
          "id":USER_ID_COUNTER+1
        })
        USER_ID_COUNTER++;
        console.log(result)
        res.status(200).send({ message: "User created" });
      }
    });
  }
});

app.post('/login',async function(req, res) {
  const { email, password } = req.body;
/*   const userExists = USERS.find(user => user.email === email);
 */  
  const userExists = await User.findOne({ email: email }).exec();
  console.log(userExists);
  if (userExists===null) {
    res.status(400).send({ message: "User does not exist" });
  } else {
    bcrypt.compare(password, userExists.password, function(err, result) {
      if (err) {
        res.status(500).send({ message: "Internal server error" });
      } else if (result) {
        const token = jwt.sign({ id: userExists.id }, JWT_SECRET);
        console.log(token+"came from login endpoint");
        console.log("logged in")
        res.status(200).send({ message: "User logged in", token });
      } else {
        res.status(400).send({ message: "Invalid credentials" });
      }
    });
  }
});

const  storage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,"")
  },
  filename:(req,file,cb)=>{
    console.log('file',file)
    cb(null,file.originalname)
  }
})
const upload=multer({storage:storage}).single('file')





let filePath


app.post('/upload', async (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    } else if (err) {
      return res.status(500).json(err);
    }
    // Process the uploaded file or perform any other desired operations
    // without sending a response here
    console.log(req.file) 
    filePath=req.file.path
  });
});


app.post('/variations',async (req, res) => {
  try{
    const response = await openai.createImageVariation(
      fs.createReadStream(filePath),
      3,
      "512x512"
    );
    res.send(response.data.data);

  }catch(error){
    console.error(error)
  }
});




mongoose.connection.on('open', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => console.log("Your server is running on port " + PORT));
});







