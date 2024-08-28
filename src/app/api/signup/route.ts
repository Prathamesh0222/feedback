import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(req: Request) {
    await dbConnect();
    try {
        const { email, username, password } = await req.json();
        const existingUserVerfiedByUsername = await UserModel.findOne({
            username,
            isVerified: true,
        })

        if (existingUserVerfiedByUsername) {
            return Response.json({
                success: false,
                message: "Username already exists"
            }, {
                status: 400
            })
        }

        const existingUserByEmail = await UserModel.findOne({
            email,
        })

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "Email already exists"
                }, {
                    status: 400
                })
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
                await existingUserByEmail.save();
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1);

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                message: [],
            })
            await newUser.save();
        }

        const emailResponse = await sendVerificationEmail(email, username, verifyCode);

        if (!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message,
            }, {
                status: 500
            })
        }

        return Response.json({
            success: true,
            message: "User created successfully. Please verify your email",
        }, {
            status: 201
        })

    } catch (error) {
        console.error("Error creating user", error);
        return Response.json({
            success: false,
            message: "Failed to create user",
        }, {
            status: 500
        })
    }
}