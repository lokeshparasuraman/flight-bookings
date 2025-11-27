import OpenAI from "openai";
const apiKey = process.env.OPENAI_API_KEY || "";
const client = new OpenAI({ apiKey });

export async function callLLM(messages: any[]) {
  const resp: any = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    max_tokens: 600
  });
  return resp.choices?.[0]?.message?.content || "";
}
