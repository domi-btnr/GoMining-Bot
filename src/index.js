import "./Logger.js";
import GoMining from "./GoMining.js";

import dotenv from "dotenv";

dotenv.config();
if (!process.env.EMAIL || !process.env.PASSWORD) {
    throw new Error("Please provide EMAIL and PASSWORD in .env file");
}

async function main() {
    const Bot = new GoMining({ email: process.env.EMAIL, password: process.env.PASSWORD });
    await Bot.login();
    console.log("Logged in successfully");
    await Bot.mine();
    await Bot.quit();
}

(async () => {
    const INTERVAL = 24 * 60 * 60 * 1000;
    while (true) {
        await main();
        console.log("Mining cycle complete. Waiting for the next cycle...");
        await new Promise(resolve => setTimeout(resolve, INTERVAL));
    }
})();
