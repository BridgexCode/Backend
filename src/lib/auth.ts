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
    plugins: [
      organization({
        allowMemberToInvite: false,
      } as any)
    ],
    trustedOrigins: [
      "http://localhost:3000", // Allow your React/Next.js frontend
      "http://localhost:5000"  // Allow same-origin (useful for some dev tools)
    ],
    advanced: {
      // NOTE: Remove this in production if you only want to allow browser clients!
      disableOriginCheck: true,
    }
  });

  return authInstance;
};

