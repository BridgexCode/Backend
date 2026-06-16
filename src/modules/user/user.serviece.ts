import { Roles } from "../../common/constants/roles.js";
import User from "../../models/User.js"
import { AuthenticatedUser } from "../auth/auth.types.js";

interface UpdateUserPayload {
  userName?: string;
  phone?: string;
  role?: "organization_owner" | "operations_manager";
  isActive?: boolean;
}

export const softDeleteUser = async (userId : string)=>{
    const user = await User.findById(userId)

    if(!user){
        throw new Error('user not found')
    }

    if (user.role === "super_admin") {
        throw new Error("Super Admin cannot be deleted");
    }

    return await User.findByIdAndUpdate(userId,
        {
        isDeleted:true,
        isActive:false
        },
        {new : true}
    )
}

export const updateUser = async (
  userId: string,
  updateData: UpdateUserPayload,
  currentUser: AuthenticatedUser
) => {
  const user = await User.findById(userId);

  if (!user || user.isDeleted) {
    throw new Error("User not found");
  }

  if (currentUser.role !== Roles.SUPER_ADMIN) {
    if (currentUser.role !== Roles.ORGANIZATION_OWNER) {
      throw new Error("Unauthorized");
    }

    if (
      user.organizationId?.toString() !==
      currentUser.organizationId?.toString()
    ) {
      throw new Error("Unauthorized");
    }

    if (user.role === "super_admin") {
      throw new Error("Cannot update super admin");
    }
  }

  return await User.findByIdAndUpdate(
    userId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );
};