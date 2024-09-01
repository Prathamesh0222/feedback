import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(req: Request) {
    await dbConnect();
    try {
        const { username, code } = await req.json();
        const decodedUsername = decodeURIComponent(username);
        const user = await UserModel.findOne({
            username: decodedUsername,
        })
        if (!user) {
            return Response.json({
                success: false,
                message: "Username not found"
            }, {
                status: 400
            })
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeValid && isCodeExpired) {
            user.isVerified = true;
            await user.save();
            return Response.json({
                success: true,
                message: "User verified successfully"
            }, {
                status: 200
            })
        } else if (!isCodeExpired) {
            return Response.json({
                success: false,
                message: "Verification code expired"
            }, {
                status: 400
            })
        } else {
            return Response.json({
                success: false,
                message: "Invalid verification code"
            }, {
                status: 400
            })
        }

    } catch (error) {
        console.error("Error in verify code route", error);
        return Response.json({
            success: false,
            message: "Internal server error",
        }, {
            status: 500,
        });
    }
}
