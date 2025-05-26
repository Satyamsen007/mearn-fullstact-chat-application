import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        minlength:6,
    },
    fullName:{
        type:String,
        required:true,
    },
    profilePicture:{
        type:String,
        default:"",
    },
    
},{timestamps:true});

// Pre-save middleware to hash password
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Create the model after defining all methods
const User = mongoose.model("User", userSchema);

export default User;
