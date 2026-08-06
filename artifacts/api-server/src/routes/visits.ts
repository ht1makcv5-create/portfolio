import { Router, type IRouter } from "express";
import { TrackVisitBody } from "@workspace/api-zod";
import { db, visitsTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/visits", async (req, res): Promise<void> => {
  const parsed = TrackVisitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db.insert(visitsTable).values({
    ...parsed.data,
    userAgent: req.get("user-agent")?.slice(0, 512) ?? null,
  });
  res.status(204).end();
});

export default router;