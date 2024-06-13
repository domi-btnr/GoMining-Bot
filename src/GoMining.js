import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const BASE_URL = "https://app.gmt.io";
const COOKIES_PATH = path.join(__dirname, "../cookies.json");

export default class GoMining {
    constructor({ email, password }) {
        this.email = email;
        this.password = password;
        this.initPromise = new Promise(resolve => this.init().then(resolve));
    }

    async init() {
        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox"]
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        if (fs.existsSync(COOKIES_PATH)) {
            const cookies = JSON.parse(fs.readFileSync(COOKIES_PATH, "UTF-8"));
            await page.setCookie(...cookies);
        }

        this.browser = browser;
        this.page = page;
    }

    async saveCookies() {
        const cookies = await this.page.cookies();
        fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies));
    }

    async login() {
        await this.initPromise;
        await this.page.goto(`${BASE_URL}/login`);
        await this.page.waitForNavigation();
        if (!this.page.url().includes(`${BASE_URL}/login`)) return;

        await this.page.waitForSelector("input[type=email]");
        await this.page.waitForSelector("input[type=password]");
        await this.page.waitForSelector("button[type=submit]");
        
        await this.page.type("input[type=email]", this.email);
        await this.page.type("input[type=password]", this.password);
        await new Promise(resolve => setTimeout(resolve, 2_500));
        await this.page.click("button[type=submit]");
        
        await new Promise(resolve => setTimeout(resolve, 500));
        const serverErrorElement = await this.page.$("server-error > div");
        const serverError = await serverErrorElement?.evaluate(node => node.innerText);
        if (serverError) throw new Error(serverError);

        await this.page.waitForNavigation();
        await this.saveCookies();
    }

    async convertTimerToSeconds(timerElement) {
        const timerText = await timerElement.evaluate(node => node.innerText);
        const [hours, minutes, seconds] = timerText.split(":").map(Number);
        const remaining = hours * 3_600 + minutes * 60 + seconds;
        return remaining;
    }

    async waitAndRefresh(remaining) {
        const buffer = 60;
        const waitTime = (remaining - buffer) * 1000;
        if (waitTime > 0) {
            console.log(`Waiting for ${waitTime / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        await this.page.reload();
        await this.page.waitForNavigation();
    }

    async mine() {
        await this.initPromise;
        await this.page.goto(`${BASE_URL}/my-nft/mining-farm`);
        await this.page.waitForNavigation();
        await this.page.waitForSelector("board-nft-mining-farm img");

        const modalElement = await this.page.$("modal");
        if (modalElement) {
            await new Promise(resolve => setTimeout(resolve, 2_500));
            await this.page.click("modal button");
        }

        let timerElement = await this.page.$("timer span");
        while (timerElement) {
            const remaining = await this.convertTimerToSeconds(timerElement);
            await this.waitAndRefresh(remaining);

            timerElement = await this.page.$("timer span");
        }

        await new Promise(resolve => setTimeout(resolve, 2_500));
        await this.page.click("board-nft-mining-farm img + button");
        await this.page.waitForNavigation();
    }

    async quit() {
        await this.initPromise;
        await this.saveCookies();
        await this.browser.close();
    }
}
