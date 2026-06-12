import User from "../../models/User.js"

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
        userId:string,
        payload:UpdateUserPayload
    )=>{

    const user = await User.findById(userId)

    if(!user || user.isDeleted){
        throw new Error('user not found')
    }

    return await User.findByIdAndUpdate(
        userId,
        payload,
        {
            new:true,
            runValidators:true
        }
    )
}