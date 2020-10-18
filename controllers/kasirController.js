import express from 'express';
import Kasir from '../models/kasir.js';
import User from './../models/user.js';
import jbtn from './../utils/jabatan.js';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import Conf from './../utils/config.js';

const router = express.Router();

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

//memasukkan uang ke kasir berdasarkan userId
//POST /api/kasir/memasukkan-uang
router.post('/kasir/memasukkan-uang', async(req, res) =>{
    try {
        const { nominal } = req.body;
        //const user = await User.findById(req.params.id);

        //mengambil token dari header
        var token = req.headers['x-access-token'];
        if (!token) 
            return res.status(401).send({ 
                auth: false, 
                message: 'No token provided.' 
            });
        
        //verifikasi jwt
        jwt.verify(token, Conf.secret, async(err, decoded) => {
            if (err) 
                return res.status(500).send({ 
                    auth: false, 
                    message: 'Failed to authenticate token.' });
            const karyawanId = decoded.user._id;
            const jabatan = decoded.user.jabatan;
            const transaksi = 'Memasukkan uang ke kasir';

            const kasir = new Kasir({
                karyawanId,
                jabatan,
                transaksi,
                nominal,
            });

            const createdKasir = await kasir.save();
            res.status(201).json(createdKasir);
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({error: err});
    };
});

//Melihat semua aktifitas kasir dan cek total saldo
//GET /api/manager/aktivitas-kasir
router.get('/manager/aktivitas-kasir', async(req, res) => {
    const kasirs = await Kasir.find({});
    
    //mengambil token dari header
    var token = req.headers['x-access-token'];
    if (!token) 
        return res.status(401).send({ 
            auth: false, 
            message: 'No token provided.' 
        });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, decoded) => {
        if (err) 
            return res.status(500).send({ 
                auth: false, 
                message: 'Failed to authenticate token.' });

        if(kasirs && kasirs.length !==0){
            res.json(kasirs)
        } else {
            res.status(404).json({
                message: 'Aktifitas kasir tidak ditemukan'
            });
        };
    });
});

//memasukkan uang dari kasir berdasarkan userId oleh manager
//POST /api/manager/memasukkan-uang
router.post('/manager/memasukkan-uang', async(req, res) =>{
    try {
        const { saldoTotal } = req.body;
        //const user = await User.findById(req.params.id);

        //mengambil token dari header
        var token = req.headers['x-access-token'];
        if (!token) 
            return res.status(401).send({ 
                auth: false, 
                message: 'No token provided.' 
            });
        
        //verifikasi jwt
        jwt.verify(token, Conf.secret, async(err, decoded) => {
            if (err) 
                return res.status(500).send({ 
                    auth: false, 
                    message: 'Failed to authenticate token.' });
            const karyawanId = decoded.user._id;
            const jabatan = decoded.user.jabatan;
            const transaksi = 'Memasukkan uang dari kasir';

            if(jabatan === jbtn[0] || jabatan === jbtn[1]){
                const kasir = new Kasir({
                    karyawanId,
                    jabatan,
                    transaksi,
                    saldoTotal,
                });
                const createdKasir = await kasir.save();
                res.status(201).json(createdKasir);
            } else {
                res.status(201).json('Tidak memiliki hak akses');
            } 
        });       

    } catch (err) {
        console.log(err);
        res.status(500).json({error: err});
    }
});

//mengambil uang oleh bos3
//PUT /api/bos/mengambil-uang/:idUser/:idKasir
router.put('/bos/mengambil-uang/:id', async(req, res) =>{
    const { saldoTotal } = req.body;
    //const user = await User.findById(req.params.idUser);
    const kasir = await Kasir.findById(req.params.id);
    
    //mengambil token dari header
    var token = req.headers['x-access-token'];
    if (!token) 
        return res.status(401).send({ 
            auth: false, 
            message: 'No token provided.' 
        });
    
    //verifikasi jwt
    jwt.verify(token, Conf.secret, async(err, decoded) => {
        if (err) 
            return res.status(500).send({ 
                auth: false, 
                message: 'Failed to authenticate token.' });
        //res.status(200).send(decoded);
        const userId = decoded.user._id;
        const jabatan = decoded.user.jabatan;

        if(jabatan === jbtn[0]){
            if(kasir){
                kasir.karyawanId = userId;
                kasir.jabatan = jabatan;
                kasir.transaksi = 'Mengambil uang';
                kasir.saldoTotal = saldoTotal;
    
                const updatedUser = await kasir.save();
                res.status(200).send(updatedUser);
            }
            res.status(404).json({
                message: 'Transaksi tidak ditemukan'
            });
        } else {
            res.status(404).json({
                message: 'Tidak memiliki hak akses'
            });
        };
    });
    
});
export default router;