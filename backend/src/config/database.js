import { connect } from 'mongoose';
import { DB_CONNECT, DB_NAME } from '../utils/Constant.js';


const connectDb = async ()=> {
    try {
        const connectionInstance = await connect(`${DB_CONNECT}/${DB_NAME}`)
        console.log(`\nMongoDb connected!! DB Host: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDb connection failed", error);
        process.exit(1);
    }
} 

export default connectDb;

