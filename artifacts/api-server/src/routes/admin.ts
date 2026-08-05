import { Router, type IRouter } from "express";
import {
  CreateAdminSessionBody,
  CreateAdminSessionResponse,
  DeleteAdminSessionResponse,
  GetAdminSessionResponse,
  GetDashboardResponse,
} from "@workspace/api-zod";
import { count, desc, eq } from "drizzle-orm";
import { db, requestsTable } from "@workspace/db";
import {
  clearAdminSession,
  getAdminSession,
  requireAdmin,
  setAdminSession,
} from "../lib/admin-session";
import { telegramBotUsername, verifyTelegramLogin } from "../lib/telegram";

const router: IRouter = Router();

router.get("/admin/session", (req, res) => {
  const session = getAdminSession(req);
  res.json(
    GetAdminSessionResponse.parse(
      session
        ? {
            authenticated: true,
            adminId: session.id,
            firstName: session.firstName,
            username: session.username,
          }
        : { authenticated: false, adminId: null },
    ),
  );
});

router.post("/admin/session", async (req, res): Promise<void> => {
  const parsed = CreateAdminSessionBody.safeParse(req.body);
  if (!parsed.success || !verifyTelegramLogin(parsed.data)) {
    res.status(401).json({ error: "Telegram account is not authorized" });
    return;
  }
  if (parsed.data.id !== 8689285693) {
    res.status(403).json({ error: "Telegram account is not authorized" });
    return;
  }
  setAdminSession(res, {
    id: parsed.data.id,
    firstName: parsed.data.first_name,
    username: parsed.data.username,
  });
  res.json(
    CreateAdminSessionResponse.parse({
      authenticated: true,
      adminId: parsed.data.id,
      firstName: parsed.data.first_name,
      username: parsed.data.username,
    }),
  );
});

router.delete("/admin/session", (_req, res) => {
  clearAdminSession(res);
  res.status(204);
  res.end(DeleteAdminSessionResponse.parse(undefined));
});

router.get("/dashboard", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const [total, newCount, orderCount, completedCount, recent] = await Promise.all([
    db.select({ count: count() }).from(requestsTable),
    db.select({ count: count() }).from(requestsTable).where(eq(requestsTable.status, "new")),
    db.select({ count: count() }).from(requestsTable).where(eq(requestsTable.kind, "order")),
    db.select({ count: count() }).from(requestsTable).where(eq(requestsTable.status, "completed")),
    db.select().from(requestsTable).orderBy(desc(requestsTable.createdAt)).limit(5),
  ]);
  res.json(
    GetDashboardResponse.parse({
      total: Number(total[0]?.count ?? 0),
      newCount: Number(newCount[0]?.count ?? 0),
      orderCount: Number(orderCount[0]?.count ?? 0),
      completedCount: Number(completedCount[0]?.count ?? 0),
      recent,
    }),
  );
});

router.get("/telegram/bot", async (_req, res): Promise<void> => {
  res.json({ username: await telegramBotUsername() });
});

export default router;