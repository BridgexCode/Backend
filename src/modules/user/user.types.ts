import { Role } from "../../common/constants/roles.js";

export interface CreateUserInput {
  name: string;
  email?: string;
  phone?: string;
  password?: string;
  role: Role;
}