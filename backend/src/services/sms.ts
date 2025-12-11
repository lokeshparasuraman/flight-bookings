import twilio from "twilio";

function getClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID || "";
  const token = process.env.TWILIO_AUTH_TOKEN || "";
  const from = process.env.TWILIO_FROM || "";
  if (!sid || !token || !from) return null;
  const client = twilio(sid, token);
  return { client, from };
}

export async function sendSms(to: string, text: string) {
  const cfg = getClient();
  if (!cfg) return false;
  await cfg.client.messages.create({ to, from: cfg.from, body: text });
  return true;
}
