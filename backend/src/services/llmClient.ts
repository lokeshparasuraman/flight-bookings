import OpenAI from "openai";
const apiKey = process.env.OPENAI_API_KEY || "";
let client: OpenAI | null = null;
if (apiKey) {
  client = new OpenAI({ apiKey });
}

export async function callLLM(messages: any[]) {
  if (!client) {
    throw new Error("LLM client is not configured (missing API key)");
  }
  const resp: any = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 600,
    temperature: 0.2,
    response_format: { type: "json_object" }
  });
  return resp.choices?.[0]?.message?.content || "";
}
