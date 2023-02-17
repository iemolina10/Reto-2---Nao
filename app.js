const express = require('express');
const path    = require('path');
const bodyParser = require('body-parser');
const app     = express();
var XLSX       = require('xlsx');
var multer     = require('multer');
const bcrypt  = require('bcrypt');
const mongoose = require('mongoose');
const User = require('./public/user');
    
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));


const mongo_uri = 'mongodb://127.0.0.1/test';

mongoose.connect(mongo_uri, function(err){
    if (err) {
        throw err;
    } else {
        console.log('Successfully connected');
    }
})

app.post('/authenticate', (req, res) => {
    const {username, password} = req.body;

    User.findOne({username}, (err, user) =>{
        if(err){
            res.status(500).send('ERROR AL AUTENTICAR AL USUARIO');
        } else if(!user){
            res.status(500).send('EL USUARIO NO EXISTE');
        } else {
            user.isCorrectPassword(password, (err, result) => {
                if(err){
                    res.status(500).send('ERROR AL AUTENTICAR CONTRASEÑA');
                } else if(result){
                    res.redirect("home.html");
                } else {
                    res.status(500).send('USUARIO Y/O CONTRASEÑA INCORRECTA');
                }
            });
        }
    })
    
});


app.post('/register', (req, res) => {
    const {username, password} = req.body;
    
    const user = new User({username, password});

    user.save(err => {
        if(err){
            res.status(500).send('ERROR AL REGISTRAR AL USUARIO');
        } else {
            res.status(200).send('USUARIO REGISTRADO');
        }
    });
    
});

//EXCEL PART -----

//multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  });
  
  var upload = multer({ storage: storage });

//collection schema
var excelSchema = new mongoose.Schema({
    nombre:String,
    ciudad:String,
    telefono:Number
});

var excelModel = mongoose.model('excelData',excelSchema);

//Render Index
app.get('/index', (req, res)=>{
    res.render('index');
});

//Render Home
app.get('/home',(req,res)=>{
    excelModel.find((err,data)=>{
        if(err){
            console.log(err)
        }else{
            if(data!=''){
                res.render('home',{result:data});
             
            }else{
                res.render('home',{result:{}});
            }
        }
    });
 });
 
 app.post('/home',upload.single('excel'),(req,res)=>{
   var workbook =  XLSX.readFile(req.file.path);
   var sheet_namelist = workbook.SheetNames;
   var x=0;
   sheet_namelist.forEach(element => {
       var xlData = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_namelist[x]]);
       excelModel.insertMany(xlData,(err,data)=>{
           if(err){
               console.log(err);
           }else{
               console.log(data);
           }
       })
       x++;
   });
   res.redirect("home.html");
 });



app.listen(8000, () => {
    console.log('server started');
})

module.exports = app;