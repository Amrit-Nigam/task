import { Router } from "express";
import { getServiceState, isIndexWarm } from "../services/pokeapi.js";

/**
 * Liveness and readiness, kept apart on purpose.
 *
 * `GET /health` answers "is this process alive" and nothing else. It never
 * touches PokéAPI: a health check that calls a third party reports *their*
 * outage as ours, and hands the platform a reason to restart or replace an
 * instance that is working perfectly well.
 *
 * `GET /health/ready` answers the different question of whether the service is
 * at full capability, which here means the stat index has finished warming.
 * Until it has, the API still serves every route — browsing, search, filtering
 * and detail all work — but sorting by a base stat is ordering over a partial
 * index, which is why the client shows "ordering will settle shortly".
 *
 * Point the platform's health check at `/health`. Pointing it at `/health/ready`
 * will fail the deploy: warming fetches all ~1,025 species and takes minutes on
 * a cold instance, far longer than a default health-check grace period.
 */
export const healthRouter = Router();

const startedAt = Date.now();
const version = process.env.npm_package_version ?? "unknown";

healthRouter.get("/", (_request, response) => {
  response.json({
    status: "ok",
    version,
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    ...getServiceState(),
  });
});

healthRouter.get("/ready", (_request, response) => {
  const ready = isIndexWarm();
  /* 503 while warming, so an orchestrator holding traffic for readiness keeps
     holding it. `status` still reads `degraded` rather than `error`: every
     route answers, only stat ordering is partial. */
  response.status(ready ? 200 : 503).json({
    status: ready ? "ok" : "degraded",
    ready,
    version,
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    ...getServiceState(),
  });
});
