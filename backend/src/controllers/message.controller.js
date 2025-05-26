import { asyncHandler } from "../helper/asyncHandler.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { uploadToCloudinary } from "../lib/cloudinary.js";
import ApiResponse from "../helper/ApiResponse.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
export const getUsersForSidebar = asyncHandler(async (req, res, next) => {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");
    res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

export const getMessages = asyncHandler(async (req, res, next) => {
    const { id: userToChatId } = req.params;
    const senderId = req.user._id;
    const messages = await Message.find({
        $or: [
            { senderId, receiverId: userToChatId },
            { senderId: userToChatId, receiverId: senderId }
        ]
    }).sort({ createdAt: 1 });
    res.status(200).json(new ApiResponse(200, messages, "Messages fetched successfully"));
});
export const sendMessage = asyncHandler(async (req, res, next) => {
    const { content, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    let imageUrl = null;
    if (image) {
        const uploadResponse = await uploadToCloudinary(image, 'messages/images');
        imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
        senderId,
        receiverId,
        content,
        image: imageUrl,
    });
    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("new-message", newMessage);
    }

    res.status(201).json(new ApiResponse(201, newMessage, "Message sent successfully"));
});