import { createHash, createHmac, timingSafeEqual } from "node:crypto";

type TelegramLogin = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
};

function botToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN must be configured");
  return token;
}

export async function telegramBotUsername(): Promise<string> {
  const response = await fetch(`https://api.telegram.org/bot${botToken()}/getMe`);
  if (!response.ok) throw new Error("Telegram bot identity request failed");
  const body = (await response.json()) as {
    ok: boolean;
    result?: { username?: string };
  };
  if (!body.ok || !body.result?.username) {
    throw new Error("Telegram bot username is unavailable");
  }
  return body.result.username;
}

export function verifyTelegramLogin(data: TelegramLogin): boolean {
  const receivedHash = Buffer.from(data.hash, "hex");
  const dataCheckString = Object.entries(data)
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
  const secretKey = createHash("sha256").update(botToken()).digest();
  const expectedHash = createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest();
  return (
    receivedHash.length === expectedHash.length &&
    timingSafeEqual(receivedHash, expectedHash) &&
    data.auth_date > Math.floor(Date.now() / 1000) - 60 * 60 * 24
  );
}

export async function notifyAdmin(request: {
  id: number;
  kind: "contact" | "order";
  name: string;
  contact: string;
  message: string;
  service?: string | null;
  budget?: string | null;
}): Promise<void> {
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID ?? "8689285693";
  const lines = [
    request.kind === "order" ? "Нове замовлення" : "Нова заявка",
    `#${request.id} · ${request.name}`,
    `Контакт: ${request.contact}`,
    request.service ? `Послуга: ${request.service}` : "",
    request.budget ? `Бюджет: ${request.budget}` : "",
    `Опис: ${request.message}`,
    "",
    "Клієнт залишився на сайті. Зв'яжіться з ним за вказаним контактом.",
  ].filter(Boolean);
  const response = await fetch(
    `https://api.telegram.org/bot${botToken()}/sendMessage`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: adminChatId,
        text: lines.join("\n"),
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Виконано", callback_data: `order:done:${request.id}` },
              { text: "Не виконано", callback_data: `order:pending:${request.id}` },
            ],
          ],
        },
      }),
    },
  );
  if (!response.ok) throw new Error("Telegram notification failed");
}