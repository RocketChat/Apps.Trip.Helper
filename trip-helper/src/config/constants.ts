
import * as dotenv from "dotenv";
dotenv.config();

export const apiKey = process.env.GOOGLE_CUSTOM_SEARCH_API_KEY;
export const cx = process.env.GOOGLE_CUSTOM_SEARCH_ENGINE_ID;