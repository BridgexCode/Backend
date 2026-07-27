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

    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
    },

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      resetPasswordTokenExpiresIn: 60 * 60,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => {
        const displayName = user.name ? escapeHtml(user.name) : "there";

        void sendEmail({
          to: user.email,
          toName: user.name || undefined,
          subject: "Reset your Logiflow password",
          htmlContent: `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f8fafc; padding: 24px 0;">
              <tr>
                <td align="center" style="padding: 0 16px;">
                  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 560px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; font-family: Arial, sans-serif; color: #0f172a;">
                    <tr>
                      <td style="padding: 28px 28px 8px;">
                        <table role="presentation" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="width: 40px; height: 40px; background: #059669; border-radius: 12px; color: #ffffff; font-size: 20px; font-weight: 700; text-align: center; vertical-align: middle;">
                              L
                            </td>
                            <td style="padding-left: 12px;">
                              <p style="margin: 0; font-size: 18px; font-weight: 700; color: #1e293b;">Logiflow</p>
                              <p style="margin: 2px 0 0; font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 0.4px;">Account Recovery</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 20px 28px 0;">
                        <h1 style="font-size: 24px; line-height: 1.25; margin: 0 0 14px; color: #0f172a;">Reset your password</h1>
                        <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0;">
                          Hi ${displayName}, click the button below to set a new password for your Logiflow account.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 24px 28px 8px;">
                        <table role="presentation" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="background: #059669; border-radius: 10px;">
                              <a href="${url}" style="display: inline-block; padding: 12px 18px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700;">
                                Reset Password
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 16px 28px 28px;">
                        <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin: 0 0 8px;">
                          If the button does not work, copy and paste this link into your browser:
                        </p>
                        <p style="font-size: 13px; line-height: 1.6; color: #059669; word-break: break-all; margin: 0;">
                          ${url}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          `,
          textContent: `Reset your password: ${url}`,
        }).catch((error) => {
          console.error("Failed to send password reset email:", error);
        });
      },
      onPasswordReset: async ({ user }) => {
        console.log(`Password reset completed for ${user.email}`);
      },
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
                Hi ${displayName}, please confirm your email address to finish setting up your Logiflow account.
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
      "https://logiflow.duckdns.org",
      "https://logiflow-frontend-pink.vercel.app",
    ].filter(Boolean),
  });

  return authInstance;
};

