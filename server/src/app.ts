import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { ApiError } from "./lib/errors.js";
import { healthRouter } from "./routes/health.js";
import { pokemonRouter } from "./routes/pokemon.js";

export function createApp() {
  const app = express();

  /* Origins arrive as a comma-separated env value and are compared verbatim
     against the browser's `Origin` header, which never carries a trailing
     slash. Normalise so a stray slash or space in config is not a silent
     CORS failure at runtime. */
  const allowedOrigins = process.env.CORS_ORIGIN?.split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  app.use(cors({ origin: allowedOrigins?.length ? allowedOrigins : true }));
  app.disable("x-powered-by");

  /* Mounted at both paths. `/health` is where a platform probe looks by
     default; `/api/health` is what the browser can reach when the client is
     served from another origin and only `/api` is proxied through to here. */
  app.use("/health", healthRouter);
  app.use("/api/health", healthRouter);

  app.use("/api", pokemonRouter);

  app.use((_request, response) => {
    response.status(404).json({
      error: { code: "NOT_FOUND", message: "No such endpoint." },
    });
  });

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    if (error instanceof ApiError) {
      response.status(error.status).json({
        error: { code: error.code, message: error.message },
      });
      return;
    }

    console.error("Unhandled error:", error);
    response.status(500).json({
      error: { code: "INTERNAL_ERROR", message: "The Pokédex service failed unexpectedly." },
    });
  });

  return app;
}
