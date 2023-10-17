import express from "express";
import cors from "cors";
import serverless from "serverless-http";
import bodyParser from "body-parser";
import { corsOrigin } from "./lambda/utils";
import { MAX_REQUEST_BODY_SIZE } from "./lambda/constants";
import { router as storageRouter } from "./lambda/functions/storage/router";
import { router as verifyRouter } from "./lambda/functions/verify/router";

const app = express();

app.use(cors({ origin: corsOrigin }));
app.use(bodyParser.json({ limit: MAX_REQUEST_BODY_SIZE }));
app.use(
  bodyParser.urlencoded({ limit: MAX_REQUEST_BODY_SIZE, extended: true })
);
app.use("/functions/storage", storageRouter);
app.use("/functions/verify", verifyRouter);
// app.disable("x-powered-by");

export const handler = serverless(app);

// app.listen(9999, () => {
//   console.log("Server running on port 9999");
// });
