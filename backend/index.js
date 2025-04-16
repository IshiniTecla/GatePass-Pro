// backend/index.js
import express from 'express';
import { PORT, mongoDBURL } from './config.js';
import mongoose from 'mongoose';
import visitorRoute from './routes/visitorRoute.js';
import cors from 'cors';


const app = express();

app.use(cors());


app.use(express.json());

app.get('/', (request, response) => {
    console.log(request);
    return response.status(200).send('Welcome to the Backend!'); 
});


app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.use('/visitors', visitorRoute);





// Connect to MongoDB and start the server
mongoose.connect(mongoDBURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connection successful!');
        app.listen(PORT, () => {
            console.log(`Backend server listening on port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
    });