import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.get('/users', isAuthenticated, getUsersForSidebar);
router.get('/chat/:id', isAuthenticated, getMessages);
router.post('/send/:id', isAuthenticated, sendMessage);

export default router;