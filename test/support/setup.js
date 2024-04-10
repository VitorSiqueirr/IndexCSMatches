import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";
import { mockServer } from "./mockServer";
import "@testing-library/jest-dom";

beforeAll(() => {
  mockServer.listen({
    onUnhandledRequest: "error",
  });
});

afterEach(() => {
  mockServer.resetHandlers();
});

afterEach(() => {
  cleanup();
});

afterAll(() => {
  mockServer.close();
});
