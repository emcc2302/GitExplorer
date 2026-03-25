import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Always resolve .env relative to this file's location (backend/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../.env") });
