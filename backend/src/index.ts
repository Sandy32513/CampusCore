import { createApp } from "./app.js";
import { config } from "./config/env.js";

const app = createApp();

app.listen(config.port, () => {
  console.log(`[CampusCore] SMS API Server running on port ${config.port} (${config.nodeEnv})`);
});
