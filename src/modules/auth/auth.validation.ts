import { BadRequestError } from "../../common/errors/app-error.js";

export const validateRegisterOrganization = (body: any) => {
  const { orgName, adminName, email, password } = body;
  if (!orgName || !adminName || !email || !password) {
    throw new BadRequestError("Missing required fields: orgName, adminName, email, password");
  }
};

export const validateLogin = (body: any) => {
  const { email, password } = body;
  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }
};
