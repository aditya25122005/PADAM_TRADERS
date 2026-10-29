const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "..", ".env"),
});

const mongoose = require("mongoose");

const PORT = process.env.PORT || 8085;

async function startServer() {
    if (!process.env.MONGO_URI) {
        console.error("Error: MONGO_URI is missing from root .env");
        process.exit(1);
    }

    if (!process.env.JWT_SECRET) {
        console.error("Error: JWT_SECRET is missing from root .env");
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log(
            `MongoDB connected to: ${mongoose.connection.name}`
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

            server.close(async (error) => {
                try {
                    await mongoose.disconnect();

                    if (error) {
                        throw error;
                    }

                    console.log("Server and MongoDB connection closed.");
                    process.exit(0);
                } catch (shutdownError) {
                    console.error(
                        "Shutdown error:",
                        shutdownError.message
                    );

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