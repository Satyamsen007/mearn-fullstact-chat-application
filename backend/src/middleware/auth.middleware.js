
import jwt from "jsonwebtoken"
import { asyncHandler } from "../helper/asyncHandler.js"
import User from "../models/user.model.js"
import ApiError from "../helper/ApiError.js"


export const isAuthenticated = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "")

        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById({ _id: decodedToken?.userId }).select("-password")

        if (!user) {
            throw new ApiError(401, "Invalid JWt Token")
        }
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid JWT token")
    }

})