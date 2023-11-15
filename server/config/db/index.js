import mongoose from "mongoose";

const connectDatabase = async() => {
    try {
        const connect = await mongoose.connect( 'mongodb://localhost:27017/watchstore',{
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
        console.log('mongo connected');
    } catch (error) {
        console.log(`connect failure`);
        process.exit(1);
    }
}

export default connectDatabase;