import { Router } from "express";
import { softDeleteUserController, updateUserController } from "./user.controller.js";

const router = Router()

router.patch('/:id/soft-delete',softDeleteUserController)
router.patch('/:id/update-user',updateUserController)

export default router;