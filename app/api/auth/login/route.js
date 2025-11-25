import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  await connectDB();

  try {
    const { email, username, password } = await req.json();

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (!user) {
      return Response.json(
        { message: "Invalid username/email" },
        { status: 400 }
      );
    }

    // Password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Response.json(
        { message: "Invalid password" },
        { status: 400 }
      );
    }

    // JWT secret handle
    const SECRET = process.env.JWT_SECRET || "fallback_secret_key";

    // Generate token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email
      },
      SECRET,
      { expiresIn: "7d" }
    );

    return Response.json(
      {
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      },
      { status: 200 }
    );

  } catch (error) {
    return Response.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
