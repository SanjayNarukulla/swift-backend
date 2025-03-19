import { createServer, IncomingMessage, ServerResponse } from "http";
import { handleRequest } from "./routes";
import * as dotenv from "dotenv";

dotenv.config(); // Load environment variables

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000; // Default to 3000

const server = createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    try {
      await handleRequest(req, res); // Ensure `handleRequest` can handle async operations
    } catch (err) {
      console.error("❌ Server error:", err);
      sendResponse(res, 500, { error: "Internal Server Error" });
    }
  }
);

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

/**
 * Sends an HTTP response with the given status and data.
 */
function sendResponse(res: ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data, null, 2)); // Pretty-print JSON output
}
