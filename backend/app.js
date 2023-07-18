const express= require("express");
const app = express();
const mongoose = require("mongoose")
app.use(express.json());
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcryptjs");

const jwt=require("jsonwebtoken");

const JWT_SECRET= "ishiii"

const mongoUrl="mongodb+srv://mern2:mern22@cluster0.tftlctq.mongodb.net/?retryWrites=true&w=majority";

mongoose
.connect(mongoUrl,{
    useNewUrlParser:true,
})
.then(()=>{
    console.log("Connected to database");
})
.catch((e) => console.log(e));

require("./userDetails");

const User = mongoose.model("UserInfo");
app.post("/register",async(req,res)=>{
    const { fname, lname, email, password } = req.body;
    
    const encryptePassword = await bcrypt.hash(password, 10);
    try {
        const oldUser = await User.findOne({ email});

        if(oldUser){
          return  res.json({ err: "User Exists"});
        }
        await User.create({
            fname,
            lname,
            email,
            password:encryptePassword,
        });
        res.send({ status:"ok"});
    } catch (error) {
        res.send({ status:"err"});
    }
});

app.post("/login-user", async (req,res) =>{
    const { email,password } = req.body;

    const user=await User.findOne({ email });
    if(!user){
        return  res.json({ err: "User Not Found"});
      }
      if(await bcrypt.compare(password,user.password)){
        const token = jwt.sign({email:user.email}, JWT_SECRET, {
            expiresIn:10,
        });

        if(res.status(201)) {
            return res.json({ status: "Ok", data: token });
        }else{
            return res.json({ err: "err"});
        }
      }
      res.json({ status: "err", err: "Invalid Password"});
});
app.post("/userData", async (req,res) => {
    const { token } = req.body;
    try {
        const user = jwt.verify(token,JWT_SECRET,(err,res)=> {
            if (err) {
                return "token expired";
            }
            return res;
        });
        console.log(user);
        if (user==="token expired"){
            return res.send({ status: "error", data: "token expired"});
        }

        const useremail = user.email;
        User.findOne({ email: useremail })
        .then((data) => {
            res.send({ status: "ok", data: data });
        }).catch((err) => {
            res.send({ status: "err", data: err });
        });
    } catch (error) {}
});

app.listen(8000,()=>{
    console.log("Server Started")
});

