import { server } from './app.js';
import connectDb from './config/database.js';
import dotenv from 'dotenv';

dotenv.config({
    path: "./.env"
})

connectDb()
    .then(() => {
        server.listen(process.env.PORT, () => {
            console.log(`Server is running on port no ${process.env.PORT}`)
        });
    })
    .catch((err) => {
        console.log('Mongo DB Connection Failed!!', err)
    })
