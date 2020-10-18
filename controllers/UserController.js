import express from 'express';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import User from './../models/user.js';
import Conf from './../utils/config.js';
import jbtn from './../utils/jabatan.js';
//import verify from './../utils/verifyToken.js';

import dotenv from 'dotenv';
dotenv.config();
const userRouter = express.Router();

userRouter.use(bodyParser.urlencoded({ extended: false }));
userRouter.use(bodyParser.json());

//cek token
//GET /api/user/check
userRouter.get('/check', function(req, res) {
    //header apabila akan melakukan akses
    var token = req.headers['x-access-token'];
    if (!token) 
        return res.status(401).send({ 
            auth: false, 
            message: 'No token provided.' 
        });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, function(err, decoded) {
        if (err) 
            return res.status(500).send({ 
                auth: false, 
                message: 'Failed to authenticate token.' });
    
      res.status(200).send(decoded);
    });
});

//add new user
//POST /api/user/add
userRouter.post ('/add', async (req, res) => {
    try {
        const { username, namaBelakang, password, jabatan } = req.body;
        const user = await User.findOne({username});
        
        if(user){
            res.status(201).json({
                message: 'User sudah ada'
            });
        } else {
            //digit mau berapa banyak
            var saltRounds = 12;
            const hashedPw = await bcrypt.hash(password, saltRounds);
            
            //console.log(jbt);
            if(jbtn.includes(jabatan)){
                const createdUser = new User({
                    "username": username,
                    "namaBelakang": namaBelakang,
                    "password": hashedPw,
                    "jabatan": jabatan
                });
                const savedUser = await createdUser.save();
                res.status(201).json(savedUser);
                
            } else {
                res.status(201).json({
                    message: 'Jabatan tidak sesuai. Silahkan pilih jabatan diantara berikut: bos, manager, atau kasir'
                });
            }
        };
    } catch (error) {
        res.status(500).json({
            error: error
        })
    }
})

//Get all users
//GET /api/user
userRouter.get('/', async(req, res) => {
    const users = await User.find({});
    
    if(users && users.length !==0){
        res.json(users)
    } else {
        res.status(404).json({
            message: 'User not found'
        });
    }
});

//Get an user
//GET /api/user/:id
userRouter.get('/:id', async(req, res) => {
    const user = await User.findById(req.params.id);

    if(user){
        res.json(user);
    } else {
        res.status(404).json({
            message: 'User not found'
        });
    };
});


//Update an user
//PUT /api/user/:id
userRouter.put('/:id', async(req, res) =>{
    const { jabatan } = req.body;
    const user = await User.findById(req.params.id);
    const jbt = process.env.JABATAN.split(' ');

    //digit mau berapa banyak
    // var saltRounds = 12;
    // const hashedPw = await bcrypt.hash(password, saltRounds);

    //console.log(jbt[2])
    if(user){
        if(user.jabatan !== jbt[2]){
            user.jabatan = jabatan;

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(201).json({
                message: 'jabatan kasir tidak bisa diubah'
            });
        }
    } else {
        res.status(404).json({
            message: 'User not found'
        });
    };
    
});

//delete an user
//DELETE /api/user/delete/:id
userRouter.delete('/delete/:id', async(req, res) => {
    const user = await User.findById(req.params.id);

    if(user){
        await user.remove();
        res.json({
            message: 'User removed'
        });
    } else {
        res.status(404).json({
            message: 'User not found'
        });
    };
});

//delete all users
//DELETE /api/user/delete
userRouter.delete('/delete', async(req, res) => {
    const users = await User.find({});

    if(users && users.length !== 0){
        await User.remove();
        res.json({
            message: 'All user removed!'
        });
    } else {
        res.status(404).json({
            message: 'User not found'
        });
    };
});


//login dengan generate token
//POST /api/user/login
userRouter.post('/login', async(req, res) => {
    try {
        
        const { username, password } = req.body;

        const currentUser = await new Promise((resolve, reject) => {
            User.find({ "username": username }, function (err, user){
                if(err)
                    reject(err);
                resolve(user);
            });
        });
        
        //cek apakah ada user?
        if(currentUser[0]){
            //cek password
            bcrypt.compare(password, currentUser[0].password).then (function(result, err){
                if(result){
                    //urus token disini
                    if (err) return res.status(500).send("There was a problem registering the user.")
                    // create a token
                    const user = currentUser[0];
                    var token = jwt.sign({ user }, Conf.secret, {
                    expiresIn: '1m' // expires in 24 hours
                    });
                    res.status(200).send({ auth: true, "status": "logged in!", token: token});
                    
                } else {
                    res.status(201).json({
                        "status": "wrong password"
                    });
                };
            });
        } else {
            res.status(201).json({
                "status": "username not found"
            });
        };
    } catch (error) {
        res.status(500).json({ error: error});
    }
})
export default userRouter;