/**
 * Outbound mail. When RESEND_API_KEY is unset the message is logged so local
 * cron runs are still inspectable without a paid mailbox.
 */
export type OutboundEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export async function sendEmail(message: OutboundEmail): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Bete <hello@bete.et>";

  if (!apiKey) {
    console.info("[email:dev]", {
      from,
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend failed (${response.status}): ${body}`);
  }
}
