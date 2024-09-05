import { ApiResponse } from "@/types/ApiResponse";
import nodemailer from "nodemailer";


export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse | undefined> {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.USER_EMAIL,
                pass: process.env.USER_PASS,
            },
        });

        const mailOptions = {
            from: process.env.USER_EMAIL,
            to: email,
            subject: "Verify your email",
            html: `<p>Hello ${username},</p>
            <p>Thank you for registering. Please use the following verification code to complete your registration:</p>
            <h3>${verifyCode}</h3>
            <p>If you did not request this code, please ignore this email.</p>`,
        }

        const mailResponse = await transporter.sendMail(mailOptions);
        console.log("Mail sent", mailResponse);
        return {
            success: true,
            message: "Verification email sent",
        };
    } catch (error) {
        console.error("Error in sending verification email", error);
        return {
            success: false,
            message: "Error in sending verification email",
        };
    }
}