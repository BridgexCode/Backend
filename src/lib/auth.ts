import mongoose from "mongoose";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { organization } from "better-auth/plugins";

let authInstance: any = null;

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
      "http://localhost:3000",
      "http://localhost:5000",
      "https://logiflow-frontend-pink.vercel.app",
    ],
  });

  return authInstance;
};

