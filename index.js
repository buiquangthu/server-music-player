const express = require('express');
const cors = require('cors');
const authRouter = require('./src/routers/authRouter');
const app = express();
require('dotenv').config();

const errorHandlingMiddleware = require('./src/middlewares/errorHandlingMiddleware');
const db = require('./src/configs/connectDb');

app.use(cors());
app.use(express.json());
const PORT = 3001;
// Connect to Db
db.connectDb();

app.use(errorHandlingMiddleware);

app.use('/auth', authRouter);


app.listen(PORT, (err) => {
    if(err){
        console.log(err);
    }
    console.log(`Server starting at http://localhost:${PORT}`);
});