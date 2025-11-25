import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  await connectDB();

  try {
    const { username, email, password, displayName } = await req.json();

    // Check email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return Response.json(
        { message: "Email already exists" },
        { status: 400 }
      );
    }

    // Check username
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return Response.json(
        { message: "Username already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
          userId: Date.now().toString(),   // तुम्हारी पोस्ट वाला format match हो जाएगा

      username,
      email,
      password: hashedPassword,
      displayName,   // only this extra field
    });

    // Create Token
    const token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return Response.json(
      {
        message: "User created successfully",
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          displayName: newUser.displayName,
        },
        token: token,
      },
      { status: 201 }
    );

  } catch (error) {
    return Response.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
