import mongoose from "mongoose";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { organization } from "better-auth/plugins";
import { sendEmail } from "./email.js";

let authInstance: any = null;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const getAuth = async (): Promise<any> => {

  if (authInstance) return authInstance;

  const client = mongoose.connection.getClient();
  const db = client.db();

  if (!db) {
    throw new Error("MongoDB is not connected before initializing auth");
  }

  authInstance = betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: {
      enabled: true,
    },
    emailVerification: {
      sendOnSignUp: true,
      expiresIn: 60 * 60,
      sendVerificationEmail: async ({ user, url }) => {
        const displayName = user.name ? escapeHtml(user.name) : "there";

        await sendEmail({
          to: user.email,
          toName: user.name || undefined,
          subject: "Verify your email",
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #0f172a;">
              <h1 style="font-size: 24px; margin: 0 0 16px;">Verify your email</h1>
              <p style="font-size: 15px; line-height: 1.6; color: #475569;">
                Hi ${displayName}, please confirm your email address to finish setting up your Naxivo account.
              </p>
              <a href="${url}" style="display: inline-block; margin: 20px 0; padding: 12px 18px; background: #059669; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 700;">
                Verify Email
              </a>
              <p style="font-size: 13px; line-height: 1.6; color: #64748b;">
                If the button does not work, copy and paste this link into your browser:
              </p>
              <p style="font-size: 13px; line-height: 1.6; color: #059669; word-break: break-all;">
                ${url}
              </p>
            </div>
          `,
          textContent: `Verify your email: ${url}`,
        });
      },
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      },
    },
    plugins: [
      organization({
        allowMemberToInvite: false,
      } as any)
    ],
    trustedOrigins: [
      process.env.CLIENT_URL || "",
      "http://localhost:3000",
      "http://localhost:5000",
      "https://logiflow-frontend-pink.vercel.app",
    ].filter(Boolean),
  });

  return authInstance;
};

