import { IncomingMessage, ServerResponse } from "http";
import { loadData } from "./api";
import { getUser, deleteUser, deleteAllUsers, addUser } from "./controllers";

type RouteHandler = (req: IncomingMessage, res: ServerResponse) => void;

const routes: Record<string, Record<string, RouteHandler>> = {
  GET: {
    "/load": async (req, res) => {
      try {
        await loadData();
        sendResponse(res, 200, { message: "Data loaded successfully" });
      } catch (err) {
        handleError(res, err);
      }
    },
  },
  DELETE: {
    "/users": deleteAllUsers,
  },
  PUT: {
    "/users": addUser,
  },
};

/**
 * Handles incoming HTTP requests and routes them accordingly.
 */
export function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const { method, url } = req;

  if (!method || !url) {
    return sendResponse(res, 400, { error: "Bad Request" });
  }

  // Handle dynamic user routes (e.g., /users/:id)
  if (method === "GET" && url.startsWith("/users/")) {
    return getUser(req, res);
  }
  if (method === "DELETE" && url.startsWith("/users/")) {
    return deleteUser(req, res);
  }

  // Match static routes
  const handler = routes[method]?.[url];

  if (handler) {
    handler(req, res);
  } else {
    sendResponse(res, 404, { error: "Not Found" });
  }
}

/**
 * Sends an HTTP response with the given status and data.
 */
function sendResponse(res: ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

/**
 * Handles server errors and sends an appropriate response.
 */
function handleError(res: ServerResponse, err: unknown) {
  const errorMessage = (err as Error).message || "Internal Server Error";
  sendResponse(res, 500, { error: errorMessage });
}
