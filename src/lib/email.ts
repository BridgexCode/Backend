import { AppError } from "../common/errors/app-error.js";

type SendEmailInput = {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
};

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export const sendEmail = async ({
  to,
  toName,
  subject,
  htmlContent,
  textContent,
}: SendEmailInput) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "Logiflow";

  if (!apiKey) {
    throw new AppError(500, "BREVO_API_KEY is not configured");
  }

  if (!senderEmail) {
    throw new AppError(500, "BREVO_SENDER_EMAIL is not configured");
  }

  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        email: senderEmail,
        name: senderName,
      },
      to: [
        {
          email: to,
          ...(toName ? { name: toName } : {}),
        },
      ],
      subject,
      htmlContent,
      ...(textContent ? { textContent } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new AppError(
      502,
      `Failed to send email with Brevo${errorText ? `: ${errorText}` : ""}`,
    );
  }

  return response.json().catch(() => ({}));
};
