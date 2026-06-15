import { Request,Response } from "express";
import { softDeleteUser, updateUser } from "./user.serviece.js";
import { AuthRequest } from "../auth/auth.types.js";


export const softDeleteUserController = async(req:Request,res:Response) =>{
    const {id} = req.params;

    if (!id) {
    return res.status(400).json({
        success: false,
        message: "User ID is required",
    });
    }

    const deletedUser = await softDeleteUser(id as string)

    res.status(200).json({
        success:true,
        message: 'user deleted successfully',
        data:deletedUser
    }
    )
}

export const updateUserController = async (req:AuthRequest,res:Response)=>{

    const {id} = req.params;

    const updatedUser = await updateUser(id as string,req.body,req.user!)

    res.json({
        success:true,
        message: "User updated successfully",
        data: updatedUser,
    })
}