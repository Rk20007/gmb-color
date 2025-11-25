import { connectDB } from "@/app/lib/mongodb";
import Post from "@/app/models/Post";

// -------------------- CREATE POST --------------------
export async function POST(req) {
  await connectDB();

  try {
    const { prompt, description, image, userId } = await req.json();

    if (!userId) {
      return Response.json({ message: "userId is required" }, { status: 400 });
    }

    const newPost = await Post.create({
      prompt,
      description,
      image,
      userId,
      likes: 0,
      comments: [],
    });

    return Response.json(
      { message: "Post created", post: newPost },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      { message: "POST error", error: error.message },
      { status: 500 }
    );
  }
}

// -------------------- GET POSTS --------------------
export async function GET(req) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let posts;

    // If userId provided → filter
    if (userId) {
      posts = await Post.find({ userId }).sort({ createdAt: -1 });
      return Response.json(
        { message: "Posts by userId", posts },
        { status: 200 }
      );
    }

    // Otherwise → get all posts
    posts = await Post.find().sort({ createdAt: -1 });

    return Response.json(
      { message: "All Posts", posts },
      { status: 200 }
    );

  } catch (error) {
    return Response.json(
      { message: "GET error", error: error.message },
      { status: 500 }
    );
  }
}


// -------------------- DELETE POST --------------------
export async function DELETE(req) {
  await connectDB();

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ message: "Post ID required" }, { status: 400 });
    }

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return Response.json({ message: "Post not found" }, { status: 404 });
    }

    return Response.json(
      { message: "Post deleted successfully", deletedPost },
      { status: 200 }
    );

  } catch (error) {
    return Response.json(
      { message: "DELETE error", error: error.message },
      { status: 500 }
    );
  }
}

// -------------------- UPDATE / LIKE / COMMENT (PATCH) --------------------
export async function PATCH(req) {
  await connectDB();

  try {
    const { postId, type, text, author, data } = await req.json();

    if (!postId) {
      return Response.json({ message: "postId is required" }, { status: 400 });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return Response.json({ message: "Post not found" }, { status: 404 });
    }

    // ----- LIKE -----
    if (type === "like") {
      post.likes += 1;
    }

    // ----- COMMENT -----
    if (type === "comment") {
      if (!text) {
        return Response.json(
          { message: "Comment text is required" },
          { status: 400 }
        );
      }

      post.comments.push({
        text,
        author: author || "Anonymous",
        createdAt: new Date(),
      });
    }

    // ----- EDIT POST -----
    if (type === "edit") {
      if (data?.prompt) post.prompt = data.prompt;
      if (data?.description) post.description = data.description;
      if (data?.image) post.image = data.image;
    }

    await post.save({ validateBeforeSave: false });

    return Response.json(
      { message: "Post updated", post },
      { status: 200 }
    );

  } catch (error) {
    return Response.json(
      { message: "PATCH error", error: error.message },
      { status: 500 }
    );
  }
}
