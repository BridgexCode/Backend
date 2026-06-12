import { Request,Response } from "express";
import { softDeleteUser } from "./user.serviece.js";


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