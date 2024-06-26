const express = require('express');
const cors = require('cors');
const app = express();


app.use(cors());
const PORT = 3001;

app.get('/auth/hello', (_req, res) => {
    res.send('Hello World');
});

app.listen(PORT, (err) => {
    if(err){
        console.log(err);
    }
    console.log(`Server starting at http://localhost:${PORT}`);
});