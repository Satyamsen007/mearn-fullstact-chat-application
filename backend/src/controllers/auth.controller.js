import ApiError from '../helper/ApiError.js'
import ApiResponse from "../helper/ApiResponse.js";
import { asyncHandler } from "../helper/asyncHandler.js";
import { uploadToCloudinary } from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";

export const signUp = asyncHandler(async (req, res, next) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
        return next(new ApiError(400, "All fields are required"));
    }
    if (password.length < 6) {
        return next(new ApiError(400, "Password must be at least 6 characters long"));
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return next(new ApiError(400, "Please provide a valid email address"));
    }
    const user = await User.findOne({ email });
    if (user) {
        return next(new ApiError(400, "User already exists"));
    }
    const newUser = await User.create({ fullName, email, password });
    if (newUser) {
        // Generate JWT token for authentication and send response with user details
        const token = generateToken(newUser._id);
        await newUser.save();
        res.status(201)
            .cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV !== "development",
                maxAge: 4 * 24 * 60 * 60 * 1000,
                sameSite: "strict"
            })
            .json(
                new ApiResponse(201, newUser, "User created successfully")
            )
    } else {
        return next(new ApiError(500, "Failed to create user"));
    }
});

export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ApiError(400, "All fields are required"));
    }
    const user = await User.findOne({ email });
    if (!user) {
        return next(new ApiError(400, "Invalid email or password"));
    }
    const passwordisCorrect = await user.comparePassword(password);

    if (!passwordisCorrect) {
        return next(new ApiError(400, "Invalid email or password"));
    }
    const token = generateToken(user._id);
    res.status(200)
        .cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            maxAge: 4 * 24 * 60 * 60 * 1000,
            sameSite: "strict"
        })
        .json(new ApiResponse(200, user, "User logged in successfully"));
});


export const logout = asyncHandler(async (req, res, next) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict"
    });
    res.status(200).json(new ApiResponse(200, null, "User logged out successfully"));
});

export const updateProfile = asyncHandler(async (req, res, next) => {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic) {
        return next(new ApiError(400, "Profile picture is required"));
    }
    const uploadResponse = await uploadToCloudinary(profilePic, 'user/profile-pictures');
    const user = await User.findByIdAndUpdate(userId, {
        profilePicture: uploadResponse.secure_url
    }, { new: true });
    res.status(200).json(new ApiResponse(200, user, "Profile updated successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res, next) => {
    const user = req.user;
    res.status(200).json(new ApiResponse(200, user, "Current user fetched successfully"));
});