// import "dotenv/config";
// import app from "./src/app.js";
// import connectToDB from "./src/config/database.js"
// import {
//     generateInterviewReport,
//     generateResumePdf
// } from "./src/services/ai.service.js";

// connectToDB();
// generateInterviewReport({resume, selfDescription, jobDescription})

// app.listen(3000, () => {
//     console.log("Server running on port 3000");
// });

import "dotenv/config";

import app from "./src/app.js";
import connectToDB from "./src/config/database.js";

async function startServer() {
    try {
        await connectToDB();

        app.listen(3000, () => {
            console.log("Server running on port 3000");
        });

    } catch (error) {
        console.error("Server startup failed:", error);
    }
}

startServer();