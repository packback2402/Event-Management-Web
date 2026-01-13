import "dotenv/config";
import { app } from "./app";
import { connectDB } from "./config/db";
import { startAutoRejectScheduler } from "./utils/autoRejectEvents";

const PORT = 5000;

const startServer = async () => {
    await connectDB();

    // Khởi động scheduler tự động reject các events đã quá ngày nhưng vẫn pending
    startAutoRejectScheduler();

    app.listen(PORT, () => {
        // \x1b[32m = green, \x1b[0m = reset
        console.log(`\x1b[32mServer is running at http://localhost:${PORT}\x1b[0m`);
    });
};

startServer();