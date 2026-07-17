import mongoose from "mongoose";
import { getAuth } from "../../lib/auth.js";
import { Roles } from "../../common/constants/roles.js";

export const seedSuperAdmin = async () => {
  const db = mongoose.connection.db;
  if (!db) {
    console.log("⚠️ Seed skipped: DB not ready");
    return;
  }

  const existing = await db.collection("user").findOne({ email: "admin@naxivo.com" });
  if (existing) {
    if (existing.role !== Roles.SUPER_ADMIN) {
      await db.collection("user").updateOne(
        { _id: existing._id },
        { $set: { role: Roles.SUPER_ADMIN, isActive: true } },
      );
      console.log("✅ Super Admin role set on existing user: admin@naxivo.com");
    } else {
      console.log("ℹ️ Super Admin already exists: admin@naxivo.com");
    }
    return;
  }

  try {
    const auth = await getAuth();
    const signUpResult = await auth.api.signUpEmail({
      body: {
        email: "admin@naxivo.com",
        password: "admin123",
        name: "System Admin",
      },
      asResponse: true,
    });

    if (!signUpResult.ok) {
      const errorData = await signUpResult.json().catch(() => ({}));
      throw new Error(errorData.message || "Sign up failed");
    }

    await signUpResult.json();

    // Get the created user ID and update role
    const user = await db.collection("user").findOne({ email: "admin@naxivo.com" });
    if (user) {
      await db.collection("user").updateOne(
        { _id: user._id },
        { $set: { role: Roles.SUPER_ADMIN, isActive: true } },
      );
    }

    console.log("✅ Super Admin seeded: admin@naxivo.com / admin123");
  } catch (error: any) {
    console.error("⚠️ Super Admin seed failed:", error.message || error);
  }
};
