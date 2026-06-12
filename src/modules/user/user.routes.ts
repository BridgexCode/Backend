import { Router } from "express";
import { softDeleteUserController } from "./user.controller.js";

const router = Router()

router.patch('/:id/soft-delete',softDeleteUserController)

export default router;