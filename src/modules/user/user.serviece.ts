import User from "../../models/User.js"

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