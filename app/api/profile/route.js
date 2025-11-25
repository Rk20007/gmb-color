import { connectDB } from "@/app/lib/mongodb";
import User from "@/app/models/User";
import Post from "@/app/models/Post";

export async function GET(req) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    // ✅ STRING userId (not ObjectId)
    const user = await User.findOne({ userId }).select("-password");

    if (!user) {
      return Response.json(
        { message: "User not found with this userId" },
        { status: 404 }
      );
    }

    // Posts where userId is same STRING
    const posts = await Post.find({ userId }).sort({ createdAt: -1 });

    
    return Response.json(
      {
        message: "Profile details fetched successfully",
        profile: {
          user,
          totalPosts: posts.length,
          posts,
        },
      },
      { status: 200 }
    );

  } catch (error) {
    return Response.json(
      { message: "Profile GET error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  await connectDB();

  try {
    const { userId, username, displayName, email } = await req.json();

    if (!userId) {
      return Response.json(
        { message: "userId is required" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      {
        ...(username && { username }),
        ...(displayName && { displayName }),
        ...(email && { email }),
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return Response.json(
        { message: "User not found with this userId" },
        { status: 404 }
      );
    }

    return Response.json(
      {
        message: "Profile updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );

  } catch (error) {
    return Response.json(
      { message: "Profile PATCH error", error: error.message },
      { status: 500 }
    );
  }
}
