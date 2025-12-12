import fetch from "node-fetch";

const WHATSAPP_TOKEN =
  "EAAVD62u2ZBNcBQGLFKKnVC91WJrvM4lX8thco7LwGZAZCWqmJoguf9HfX1MkSrm4qfYv4j5Lovq3ZAmG8ZBP8ViurHZAAnE90ibc9z3vkA3SL2MN2wjvsXswWSFQZB2XZC04qGfFZAfyvhvmd7Xm7p5TUzMXfNxzsCwInWNqPyCJnlVClPSbIkCS7JmuWG0fFQD39dQLn78IOn8PIKe1c9pV7St7qATqyZCBUvWmNSoC05oZCFPUpHEcjXiFKcZAljZCxqt9jmyPL8ZC8ZAUr05pcWv15bs";
const PHONE_NUMBER_ID = "875498155648645";

export async function sendWhatsAppMessage(to, message) {
  try {
    const res = await fetch(
      `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "text",
          text: { body: message },
        }),
      }
    );

    const data = await res.json();
    console.log("WhatsApp Response:", data);
    return data;
  } catch (e) {
    console.error("WhatsApp error:", e);
  }
}
