import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL,
});

export async function askAI(prompt: string) {
  const res = await client.chat.completions.create({
    model: "openai/gpt-3.5-turbo", // চাইলে অন্য মডেল যেমন meta-llama-3-8b ব্যবহার করতে পারো
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: prompt },
    ],
  });

  return res.choices[0]?.message?.content || "";
}
