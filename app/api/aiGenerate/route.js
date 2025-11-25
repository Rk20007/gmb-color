import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt || prompt.trim().length < 3) {
      return Response.json(
        { message: "Prompt must be at least 3 characters long" },
        { status: 400 }
      );
    }

    // 🧠 Description (GPT-4o-mini)
    const textResult = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You generate short, creative descriptions.",
        },
        {
          role: "user",
          content: `Describe the following creatively: ${prompt}`,
        },
      ],
    });

    const description = textResult.choices[0].message.content;

    // 🎨 Image Generation (DALL·E 3)
    const imageResult = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      size: "1024x1024",
      quality: "hd",  // <-- fixed
      n: 1,
    });

    const imageUrl = imageResult.data[0].url;

    return Response.json({
      success: true,
      prompt,
      description,
      image: imageUrl,
    });
  } catch (error) {
    return Response.json(
      {
        message: "AI generation failed",
        error: error?.response?.data || error?.message,
      },
      { status: 500 }
    );
  }
}
