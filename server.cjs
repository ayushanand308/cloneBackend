
const express = require("express");
const app = express();
const PORT = 8000;
var jwt = require("jsonwebtoken");
const { auth } = require("./middleware.cjs");
const JWT_SECRET = "secret";
const bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const cors = require("cors");
app.use(cors());
app.use(jsonParser);
const User=require("./Employee.cjs")
const bcrypt = require("bcrypt");
const mongoose=require('mongoose');
const connectDb=require('./dbCon.cjs')
connectDb();
const dotenv = require("dotenv")

dotenv.config()



let USER_ID_COUNTER = 0;
const API_KEY = process.env.REACT_APP_API_KEY;


app.post('/completions',auth,async (req, res) => {
  const options = {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: req.body.message }],
      max_tokens: 1000
    })
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", options);
    const data = await response.json();
    res.send(data);
  } catch (error) {
    console.error(error);
  }
});

app.post('/generations',auth,async (req, res) => {
  const { prompt } = req.body;

  const options = {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt: prompt,
      n: 2,
      size: "1024x1024"
    })
  };

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", options);
    const data = await response.json();
    res.send(data);
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



app.get("/download-image", async (req, res) => {
  try {
    const imageUrl = req.query.url;
    const response = await fetch(imageUrl);
    const buffer = await response.buffer();
    res.set("Content-Type", response.headers.get("content-type"));
    res.set("Content-Disposition", "attachment; filename=image.png");
    res.send(buffer);
  } catch (error) {
    console.error("Error proxying image:", error);
    res.status(500).send("Error proxying image");
  }
});

mongoose.connection.once('open',()=>{
  console.log('connected to mongodb');
  app.listen(PORT, () => console.log("Your server is running on port " + PORT));

})




