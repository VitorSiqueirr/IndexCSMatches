import { setupServer } from "msw/node";

const mockServer = setupServer();

const API_URL = "http://localhost:3000";

export { mockServer, API_URL };
