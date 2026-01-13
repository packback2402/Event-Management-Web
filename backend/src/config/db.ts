import Mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await Mongoose.connect(process.env.DB_URI);
        // \x1b[32m = green, \x1b[0m = reset
        console.log("\x1b[32mMongoDB connected\x1b[0m");
    } catch (error) {
        // \x1b[31m = red
        console.error("\x1b[31mMongoDB connection error\x1b[0m", error);
        process.exit(1);
    }
};
