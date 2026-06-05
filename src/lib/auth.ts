import mongoose from "mongoose";

// Bypasses TypeScript's import() -> require() transformation in CommonJS
const dynamicImport = new Function('specifier', 'return import(specifier)');

let authInstance: any = null;

export const getAuth = async () => {
  if (authInstance) return authInstance;

  const { betterAuth } = await dynamicImport("better-auth");
  const { mongodbAdapter } = await dynamicImport("better-auth/adapters/mongodb");

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
    trustedOrigins: [
      "http://localhost:3000", // Allow your React/Next.js frontend
      "http://localhost:5000"  // Allow same-origin (useful for some dev tools)
    ],
    advanced: {
      // Temporarily disables the CSRF origin check so Postman and Mobile Apps 
      // can hit the API without manually setting the Origin header.
      // NOTE: Remove this in production if you only want to allow browser clients!
      disableOriginCheck: true,
    }
  });

  return authInstance;
};
