import { db, requestsTable, visitsTable } from "@workspace/db";
import { and, count, countDistinct, desc, eq, gte } from "drizzle-orm";
import { logger } from "./logger";

const ADMIN_ID = 8689285693;
const POLL_TIMEOUT_SECONDS = 25;

type TelegramResponse<T> = {
  ok: boolean;
  result: T;
  description?: string;
};

type TelegramUpdate = {
  update_id: number;
  message?: {
    chat: { id: number };
    text?: string;
    from?: { id: number; first_name?: string };
  };
  callback_query?: {
    id: string;
    from: { id: number };
    data?: string;
    message?: { chat: { id: number }; message_id: number };
  };
};

type InlineButton = { text: string; callback_data: string };
type ReplyButton = { text: string };

function token(): string {
  const value = process.env.TELEGRAM_BOT_TOKEN;
  if (!value) throw new Error("TELEGRAM_BOT_TOKEN must be configured");
  return value;
}

async function telegram<T>(
  method: string,
  body: Record<string, unknown> = {},
): Promise<T> {
  const response = await fetch(
    `https://api.telegram.org/bot${token()}/${method}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const result = (await response.json()) as TelegramResponse<T>;
  if (!response.ok || !result.ok) {
    throw new Error(result.description ?? `Telegram ${method} failed`);
  }
  return result.result;
}

async function sendMessage(
  chatId: number,
  text: string,
  inlineKeyboard?: InlineButton[][],
  replyKeyboard?: ReplyButton[][],
): Promise<void> {
  await telegram("sendMessage", {
    chat_id: chatId,
    text,
    ...(inlineKeyboard
      ? { reply_markup: { inline_keyboard: inlineKeyboard } }
      : {}),
    ...(replyKeyboard
      ? {
          reply_markup: {
            keyboard: replyKeyboard,
            resize_keyboard: true,
            persistent: true,
          },
        }
      : {}),
  });
}

function requestText(request: {
  id: number;
  name: string;
  contact: string;
  message: string;
  service?: string | null;
  budget?: string | null;
  status: string;
}): string {
  return [
    `Замовлення #${request.id}`,
    `Статус: ${request.status === "completed" ? "Виконано" : "Не виконано"}`,
    `Імʼя: ${request.name}`,
    `Контакт: ${request.contact}`,
    request.service ? `Послуга: ${request.service}` : "",
    request.budget ? `Бюджет: ${request.budget}` : "",
    `Опис: ${request.message}`,
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendOrder(
  chatId: number,
  request: Parameters<typeof requestText>[0],
): Promise<void> {
  await sendMessage(chatId, requestText(request), [
    [
      {
        text: "Виконано",
        callback_data: `order:done:${request.id}`,
      },
      {
        text: "Не виконано",
        callback_data: `order:pending:${request.id}`,
      },
    ],
  ]);
}

async function sendStats(chatId: number): Promise<void> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const [visits, unique, todayVisitors, totalOrders, pendingOrders, doneOrders] =
    await Promise.all([
      db.select({ count: count() }).from(visitsTable),
      db.select({ count: countDistinct(visitsTable.sessionId) }).from(visitsTable),
      db
        .select({ count: countDistinct(visitsTable.sessionId) })
        .from(visitsTable)
        .where(gte(visitsTable.createdAt, today)),
      db
        .select({ count: count() })
        .from(requestsTable)
        .where(eq(requestsTable.kind, "order")),
      db
        .select({ count: count() })
        .from(requestsTable)
        .where(
          and(
            eq(requestsTable.kind, "order"),
            eq(requestsTable.status, "new"),
          ),
        ),
      db
        .select({ count: count() })
        .from(requestsTable)
        .where(
          and(
            eq(requestsTable.kind, "order"),
            eq(requestsTable.status, "completed"),
          ),
        ),
    ]);

  await sendMessage(
    chatId,
    [
      "Статистика сайту",
      `Всього переглядів: ${visits[0]?.count ?? 0}`,
      `Унікальних відвідувачів: ${unique[0]?.count ?? 0}`,
      `Відвідувачів сьогодні: ${todayVisitors[0]?.count ?? 0}`,
      "",
      `Всього замовлень: ${totalOrders[0]?.count ?? 0}`,
      `Не виконано: ${pendingOrders[0]?.count ?? 0}`,
      `Виконано: ${doneOrders[0]?.count ?? 0}`,
      "",
      "Команди: /orders — активні, /completed — виконані",
    ].join("\n"),
  );
}

async function sendOrders(
  chatId: number,
  completed: boolean,
): Promise<void> {
  const orders = await db
    .select()
    .from(requestsTable)
    .where(
      and(
        eq(requestsTable.kind, "order"),
        completed
          ? eq(requestsTable.status, "completed")
          : eq(requestsTable.status, "new"),
      ),
    )
    .orderBy(desc(requestsTable.createdAt))
    .limit(25);

  if (!orders.length) {
    await sendMessage(
      chatId,
      completed ? "Виконаних замовлень поки немає." : "Нових замовлень немає.",
    );
    return;
  }
  for (const order of orders) await sendOrder(chatId, order);
}

async function handleMessage(message: NonNullable<TelegramUpdate["message"]>): Promise<void> {
  if (message.chat.id !== ADMIN_ID) return;
  const command = message.text?.trim().split(/\s+/)[0]?.toLowerCase();
  if (command === "/start" || command === "/help") {
    await sendMessage(
      message.chat.id,
      [
        "Панель керування сайтом готова.",
        "",
        "/stats — статистика відвідувань і замовлень",
        "/orders — замовлення, які ще не виконані",
        "/completed — виконані замовлення",
        "",
        "У кожному замовленні натисніть «Виконано» або «Не виконано».",
      ].join("\n"),
      undefined,
      [
        [{ text: "Статистика" }, { text: "Замовлення" }],
        [{ text: "Виконані" }],
      ],
    );
  } else if (command === "/stats" || command === "статистика") {
    await sendStats(message.chat.id);
  } else if (command === "/orders" || command === "замовлення") {
    await sendOrders(message.chat.id, false);
  } else if (command === "/completed" || command === "виконані") {
    await sendOrders(message.chat.id, true);
  }
}

async function handleCallback(
  callback: NonNullable<TelegramUpdate["callback_query"]>,
): Promise<void> {
  if (callback.from.id !== ADMIN_ID || !callback.data) return;
  const match = callback.data.match(/^order:(done|pending):(\d+)$/);
  if (!match || !callback.message) return;
  const status = match[1] === "done" ? "completed" : "new";
  const id = Number(match[2]);
  const [updated] = await db
    .update(requestsTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(requestsTable.id, id))
    .returning();
  if (!updated) return;

  await telegram("answerCallbackQuery", {
    callback_query_id: callback.id,
    text: status === "completed" ? "Замовлення виконано" : "Замовлення залишено активним",
  });
  await telegram("editMessageText", {
    chat_id: callback.message.chat.id,
    message_id: callback.message.message_id,
    text: requestText(updated),
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: status === "completed" ? "Виконано ✓" : "Виконано",
            callback_data: `order:done:${id}`,
          },
          {
            text: status === "new" ? "Не виконано ✓" : "Не виконано",
            callback_data: `order:pending:${id}`,
          },
        ],
      ],
    },
  });
}

async function poll(): Promise<void> {
  let offset = 0;
  while (true) {
    try {
      const updates = await telegram<TelegramUpdate[]>("getUpdates", {
        offset,
        timeout: POLL_TIMEOUT_SECONDS,
        allowed_updates: ["message", "callback_query"],
      });
      for (const update of updates) {
        offset = update.update_id + 1;
        if (update.message) await handleMessage(update.message);
        if (update.callback_query) await handleCallback(update.callback_query);
      }
    } catch (error) {
      logger.error({ err: error }, "Telegram bot polling failed");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

export function startTelegramBot(): void {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    logger.warn("TELEGRAM_BOT_TOKEN is not configured; Telegram bot is disabled");
    return;
  }
  void telegram("deleteWebhook", { drop_pending_updates: false }).catch((error) =>
    logger.warn({ err: error }, "Could not clear Telegram webhook before polling"),
  );
  void telegram("setMyCommands", {
    commands: [
      { command: "stats", description: "Статистика сайту та замовлень" },
      { command: "orders", description: "Замовлення, які не виконані" },
      { command: "completed", description: "Виконані замовлення" },
    ],
  }).catch((error) => logger.warn({ err: error }, "Could not register Telegram commands"));
  void poll();
  logger.info({ adminId: ADMIN_ID }, "Telegram bot polling started");
}