const JWT_SECRET="secret";
var jwt = require('jsonwebtoken');

module.exports={
    auth:(req,res,next)=>{
        const authHeader=req.headers["authorization"];
        console.log(authHeader+" this came from middleware");
        if(!authHeader){
            return res.status(401).send({message:"Missing auth header"})
        }
        const decoded=jwt.verify(authHeader,JWT_SECRET);
/*         console.log(decoded)
 */     
        console.log(decoded)
        if(decoded && decoded.id){
            console.log("authentication succesful => Came from middleware")
            req.userId=decoded.id;
            next();
        }
        else{
            console.log("invalid token => from middleware")
            return res.status(400).send({message:"Invalid token"})
        }
    }
}