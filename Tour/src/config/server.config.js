import { configDotenv } from "dotenv";
configDotenv();

export default {
  PORT:process.env.PORT || 5000,
}