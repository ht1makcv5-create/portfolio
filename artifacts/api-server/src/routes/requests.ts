import { Router, type IRouter } from "express";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import {
  CreateRequestBody,
  CreateRequestResponse,
  ListRequestsQueryParams,
  ListRequestsResponse,
  UpdateRequestBody,
  UpdateRequestParams,
  UpdateRequestResponse,
} from "@workspace/api-zod";
import { db, requestsTable } from "@workspace/db";
import { notifyAdmin } from "../lib/telegram";
import { requireAdmin } from "../lib/admin-session";

const router: IRouter = Router();

router.get("/requests", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const parsed = ListRequestsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { status, kind, search } = parsed.data;
  const searchFilter = search
    ? or(
        ilike(requestsTable.name, `%${search}%`),
        ilike(requestsTable.contact, `%${search}%`),
        ilike(requestsTable.message, `%${search}%`),
      )
    : undefined;
  const rows = await db
    .select()
    .from(requestsTable)
    .where(
      and(
        status ? eq(requestsTable.status, status) : undefined,
        kind ? eq(requestsTable.kind, kind) : undefined,
        searchFilter,
      ),
    )
    .orderBy(desc(requestsTable.createdAt));
  res.json(ListRequestsResponse.parse(rows));
});

router.post("/requests", async (req, res): Promise<void> => {
  const parsed = CreateRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db.insert(requestsTable).values(parsed.data).returning();
  if (!created) {
    res.status(500).json({ error: "Request could not be created" });
    return;
  }
  try {
    await notifyAdmin(created);
  } catch (error) {
    req.log.error({ err: error, requestId: created.id }, "Telegram notification failed");
  }
  res.status(201).json(CreateRequestResponse.parse(created));
});

router.patch("/requests/:id", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const params = UpdateRequestParams.safeParse(req.params);
  const body = UpdateRequestBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [updated] = await db
    .update(requestsTable)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(requestsTable.id, params.data.id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Request not found" });
    return;
  }
  res.json(UpdateRequestResponse.parse(updated));
});

export default router;