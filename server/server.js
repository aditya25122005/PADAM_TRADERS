const path = require("path");

// Load environment variables from project root
require("dotenv").config({
    path: path.join(__dirname, "..", ".env")
});

const mongoose = require("mongoose");

const PORT = process.env.PORT || 8085;

async function startServer() {
    if (!process.env.MONGO_URI) {
        console.error("Error: MONGO_URI is missing from root .env");
        process.exit(1);
    }

    if (!process.env.SESSION_SECRET) {
        console.error("Error: SESSION_SECRET is missing from root .env");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log(
            "MongoDB connected to:",
            mongoose.connection.name
        );

        const app = require("./app");

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        let isShuttingDown = false;

        const shutdown = () => {
            if (isShuttingDown) return;
            isShuttingDown = true;

            console.log("\nShutting down server...");

            server.close(async () => {
                try {
                    await mongoose.disconnect();
                    console.log("Server and MongoDB connection closed");
                    process.exit(0);
                } catch (error) {
                    console.error("Shutdown error:", error.message);
                    process.exit(1);
                }
            });
        };

        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);

    } catch (error) {
        console.error("Failed to start server:", error.message);

        try {
            await mongoose.disconnect();
        } catch (disconnectError) {
            console.error(
                "MongoDB disconnect error:",
                disconnectError.message
            );
        }

        process.exit(1);
    }
}

startServer();
