import { asyncHandler } from "../utils/asyncHandler.js";
import {apiError} from "../utils/apiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation- not empty
    // check if user already exits: username or email
    // check for images, check for avatar
    // upload them on cloudinary, check for avatar
    // create user object, Create entry in DB
    // remove password and refresh token field from response
    // check for user creation
    // return res 
    
    const {fullname, email, username, password} = req.body
    console.log("email", email);

    if(
        [fullname, email, username, password].some((field) =>
        field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required")
    }

    const existedUser = User.findOne({
        $or: [{ email }, { username }]
    })

    if(existedUser){
        throw new apiError(409, "User with email or username already exits")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new apiError(400, "avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new apiError(400, "avatar file is required")   
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new apiError(500, "something went wrong while registering the user")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "user registered successfully")
    )



})

export {registerUser}