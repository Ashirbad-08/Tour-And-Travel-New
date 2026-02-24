 import 'dotenv/config';

import app from './app.js';
import connectDB from './config/db.config.js';
import serverConfig from './config/server.config.js';
import "./utils/couponExpiry.js";

connectDB();

app.listen(serverConfig.PORT, () => {
  console.log(`Server is running on port ${serverConfig.PORT}`);
});
