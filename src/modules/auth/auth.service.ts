import mongoose from "mongoose";
import { getAuth } from "../../lib/auth.js";
import { generateSlug } from "../../common/utils/slug.js";
import { AppError } from "../../common/errors/app-error.js";
import { Roles, Role } from "../../common/constants/roles.js";
import { fromNodeHeaders } from "better-auth/node";

// -- Register Organization --//
export const registerOrganization = async (data: any) => {
  const { orgName, adminName, email, password, phone, country, timezone } =
    data;
  const auth = await getAuth();

  // Sign up User
  const signUpResult = await auth.api.signUpEmail({
    body: { email, password, name: adminName },
    asResponse: true,
  });

  if (!signUpResult.ok) {
    const errorData = await signUpResult.json().catch(() => ({}));
    throw new AppError(
      signUpResult.status,
      errorData.message || "Sign up failed",
    );
  }

  const signUpData = await signUpResult.json();
  const setCookie = signUpResult.headers.get("set-cookie");

  const requestHeaders = new Headers();
  if (setCookie) {
    requestHeaders.set("cookie", setCookie);
  }

  // Create Organization
  const slug = generateSlug(orgName);
  const orgResult = await auth.api.createOrganization({
    body: {
      name: orgName,
      slug,
      metadata: {
        country: country || "",
        timezone: timezone || "Asia/Kolkata",
        phone: phone || "",
      },
    },
    headers: requestHeaders,
  });

  return {
    token: signUpData.token,
    setCookie,
    user: {
      id: signUpData.user.id,
      name: signUpData.user.name,
      email: signUpData.user.email,
      role: Roles.ORGANIZATION_OWNER as Role,
      organizationId: orgResult.id,
      phoneNumber: phone || "",
      createdAt: signUpData.user.createdAt,
    },
  };
};

// -- Login Organization --//
export const login = async (data: any) => {
  const { email, password } = data;
  const auth = await getAuth();

  const loginResult = await auth.api.signInEmail({
    body: { email, password },
    asResponse: true,
  });

  if (!loginResult.ok) {
    const errorData = await loginResult.json().catch(() => ({}));
    throw new AppError(
      loginResult.status,
      errorData.message || "Invalid email or password",
    );
  }

  const loginData = await loginResult.json();
  const setCookie = loginResult.headers.get("set-cookie");

  const db = mongoose.connection.db;
  if (!db) {
    throw new AppError(500, "Database connection not ready");
  }

  let organizationId: string | undefined;
  let role: Role = (loginData.user.role as Role) || Roles.OPERATIONS_MANAGER;

  if (loginData.user.role !== Roles.SUPER_ADMIN) {
    const memberRecord = await db
      .collection("member")
      .findOne({ userId: loginData.user.id });
    if (memberRecord) {
      organizationId = memberRecord.organizationId.toString();
      role =
        memberRecord.role === "admin"
          ? Roles.ORGANIZATION_OWNER
          : Roles.OPERATIONS_MANAGER;
    }
  } else {
    role = Roles.SUPER_ADMIN;
  }

  return {
    token: loginData.token,
    setCookie,
    user: {
      id: loginData.user.id,
      name: loginData.user.name,
      email: loginData.user.email,
      role,
      organizationId,
      phoneNumber: loginData.user.phoneNumber || "",
      createdAt: loginData.user.createdAt,
    },
  };
};

// -- Logout Organization --//
export const logout = async (headers: any) => {
  const auth = await getAuth();
  const logoutResult = await auth.api.signOut({
    headers: fromNodeHeaders(headers),
    asResponse: true,
  });

  const setCookie = logoutResult.headers.get("set-cookie");
  return { setCookie };
};
