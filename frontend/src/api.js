export const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export async function analyzeEmail(email_content) {
  const res = await fetch(`${BASE_URL}/investigate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email_content }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error("Backend connection failed");
  }

  return data;
}