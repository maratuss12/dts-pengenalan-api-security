import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import userRouter from './controllers/UserController.js';
import router from './controllers/kasirController.js';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

//connect to db with dotenv
const uri = process.env.MONGODB_URI;
mongoose.connect(uri,
{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=> {
    console.log('Connect to db success')
}).catch(err => {
    console.log('Connect to db failed!!!');
    console.log(err)
})

//middleware
app.use(morgan('dev'));
app.use(express.json());

//routers
app.get('/', (req, res) => {
    res.json({
        message: 'success',
    });
})

//untuk memanggil router.js
app.use('/api/user', userRouter);
app.use('/api', router);

const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`App listens on port ${port}`)
});