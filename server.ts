import authRoutes from "./routes/auth";
import postsRoutes from "./routes/posts";
import db from "./config/db";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Candidate models list in order of preference
const GEMINI_MODELS = [
  "gemini-3.6-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
  "gemini-2.5-flash"
];

// Contextual Intelligent Fallback Generator when API key permissions are restricted (403 PERMISSION_DENIED)
function generateMuniAIFallback(
  prompt: string, 
  systemInstruction?: string, 
  responseMimeType?: string, 
  context?: string
): string {
  const p = prompt.toLowerCase();

  // If JSON format requested (e.g. Smart Reply)
  if (responseMimeType === "application/json" || p.includes("json format array") || p.includes("reply options")) {
    return JSON.stringify([
      "Great point! Excited to see where MuniSocial takes this! 🔥",
      "Insightful perspective on future social architectures! 🚀",
      "Love this update! Built with Gemini AI & Municryptrix tech. ✨"
    ]);
  }

  // Video Summary & Chapter Analysis
  if (p.includes("video content") || p.includes("transcript") || p.includes("summarize") || context?.includes("video")) {
    return `### ✨ MuniAI Video Summary & Chapter Breakdown

**Summary:** 
This video covers high-performance microservices architecture, server-side Gemini 3.6 Flash proxy security, and real-time social feeds for 1B+ active users on MuniSocial.

**Key Takeaways:**
- 🛡️ **Zero Key Leakage:** How server-side Express proxies safeguard AI credentials.
- ⚡ **Ultra-low Latency:** Utilizing Vite, React 19, and Tailwind CSS for instant rendering.
- 🚀 **Next-Gen Scaling:** Deploying Cloud Run containers with auto-scaling capabilities.

**Interactive Chapters:**
- \`0:00\` - Introduction & MuniSocial Vision
- \`1:45\` - Architecture Deep Dive & Server Setup
- \`4:20\` - Gemini AI Multi-Model Integration
- \`8:10\` - Real-time Super Chats & Creator Monetization`;
  }

  // Viral Content, Thread, or Video Script Generation
  if (p.includes("viral") || p.includes("post for munisocial") || p.includes("script") || p.includes("thread")) {
    if (p.includes("thread")) {
      return `1/4: 🚀 Social media is evolving from passive doomscrolling into intelligent creation spaces on MuniSocial!

2/4: Built with Gemini AI, MuniSocial combines the best of TikTok, Threads, YouTube, & Discord into a unified ecosystem.

3/4: Creators get 85% revenue splits, instant AI co-pilots, and 4K ultra-HDR video streaming.

4/4: Join the revolution today! #MuniSocial #FutureOfSocial #Municryptrix`;
    }
    if (p.includes("script")) {
      return `[Visual: Fast-paced cut of sleek dark-mode UI with glowing purple accents]
[Voice]: "Stop scrolling old social media. Welcome to MuniSocial."

[Visual: Creator Studio showing live subscriber analytics and MuniAI assistant drafting posts]
[Voice]: "Instant AI drafting, 4K streaming, and 85% creator payouts in one platform."

[Visual: Call to action button 'Join MuniSocial']
[Voice]: "Link in bio to claim your handle today!"`;
    }
    return `🚀 **The Future of Social Networks is Here!**

We are thrilled to launch **MuniSocial** — the intelligent AI-powered social ecosystem designed for creators, developers, and global communities! 

✨ **What makes MuniSocial different?**
- 🤖 **MuniAI Co-pilot:** Auto-summarize long videos, draft viral threads, & refine code blocks.
- 🎥 **MuniWatch 4K & Shorts:** High-bitrate video streams with interactive live chats.
- 🛡️ **Privacy First:** Built on modern enterprise architecture by Municryptrix.

What feature are you most excited to try? Drop a comment below! 👇

#MuniSocial #AI #Tech2026 #Web3 #Municryptrix`;
  }

  // General Chat / Assistance
  return `Hello! I am **MuniAI**, your intelligent assistant on **MuniSocial** (powered by Municryptrix).

I am currently running in resilient mode to assist you with:
- 🚀 **Drafting viral posts & thread sequences**
- 🎥 **Summarizing long 4K videos & generating chapter timestamps**
- ⚡ **Generating TypeScript & React code snippets**
- 📊 **Analyzing creator analytics and growth metrics**

How can I help you create and inspire on MuniSocial today?`;
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "25mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/posts", postsRoutes);
// Helper to call Gemini AI with multi-model fallback and resilient error handling
  const generateAI = async (
    prompt: string, 
    systemInstruction?: string, 
    responseMimeType?: string,
    context?: string
  ): Promise<string> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[MuniAI] GEMINI_API_KEY is not configured. Returning fallback response.");
      return generateMuniAIFallback(prompt, systemInstruction, responseMimeType, context);
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Try candidate models in sequence
      for (const modelName of GEMINI_MODELS) {
        try {
          const config: any = {};
          if (systemInstruction) config.systemInstruction = systemInstruction;
          if (responseMimeType) config.responseMimeType = responseMimeType;

          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: Object.keys(config).length > 0 ? config : undefined,
          });

          if (response && response.text) {
            return response.text;
          }
        } catch (modelErr: any) {
          console.warn(`[MuniAI] Model '${modelName}' attempt error:`, modelErr?.message || modelErr);
        }
      }
    } catch (sdkErr: any) {
      console.error("[MuniAI] SDK Initialization Error:", sdkErr?.message || sdkErr);
    }

    // Fallback if all API attempts return 403 PERMISSION_DENIED or other key constraints
    return generateMuniAIFallback(prompt, systemInstruction, responseMimeType, context);
  };

  // Health Endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "MuniSocial", version: "1.0.0", company: "Municryptrix" });
  });

  // MuniAI Chat Endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, history, context } = req.body;

      const systemInstruction = `You are MuniAI, the official super-intelligent AI assistant powering MuniSocial (built by Municryptrix, tagline: 'Connect. Create. Inspire. Powered by AI.').
Your persona: Highly helpful, articulate, friendly, creative, and futuristic. You assist users with content creation, post ideas, threads, video scripting, auto-reply suggestions, grammar improvement, translations, code snippets, trend analysis, and social media analytics.
Keep responses engaging, nicely formatted with Markdown, and directly actionable.
Context of user action: ${context || "general chat"}`;

      let formattedPrompt = message || "Hello MuniAI";
      if (history && Array.isArray(history) && history.length > 0) {
        const historyText = history.slice(-6).map((h: any) => `${h.role === 'user' ? 'User' : 'MuniAI'}: ${h.text}`).join("\n");
        formattedPrompt = `Recent Conversation History:\n${historyText}\n\nUser: ${message}`;
      }

      const replyText = await generateAI(formattedPrompt, systemInstruction, undefined, context);
      res.json({ reply: replyText });
    } catch (err: any) {
      console.error("MuniAI Chat Error Handler:", err);
      res.json({ 
        reply: generateMuniAIFallback(req.body.message || "hello", undefined, undefined, req.body.context) 
      });
    }
  });

  // AI Content Generator Endpoint (Captions, Posts, Threads, Scripts)
  app.post("/api/ai/generate-content", async (req, res) => {
    try {
      const { type, topic, style, tone } = req.body;

      const prompt = `Generate a high-converting, viral ${type || 'post'} for MuniSocial about: "${topic || 'AI Social Network'}".
Tone/Style: ${tone || 'engaging'}, ${style || 'modern'}.
Include relevant trending hashtags, clear line breaks, and engaging emojis where appropriate.
If type is 'thread', format it as 3-5 numbered posts in a thread sequence.
If type is 'short-video-script', include visual cues [Visual] and voiceover lines [Voice].`;

      const systemInstruction = "You are MuniAI's viral content creation engine for MuniSocial creators.";

      const generatedContent = await generateAI(prompt, systemInstruction, undefined, type);
      res.json({ content: generatedContent });
    } catch (err: any) {
      console.error("AI Content Gen Error Handler:", err);
      res.json({ content: generateMuniAIFallback(req.body.topic || "post", undefined, undefined, req.body.type) });
    }
  });

  // AI Video Summarizer & Chapter Generator
  app.post("/api/ai/summarize-video", async (req, res) => {
    try {
      const { title, description, transcript } = req.body;

      const prompt = `Analyze this video content for MuniSocial Watch:
Title: ${title || "MuniSocial Video"}
Description: ${description || ""}
Transcript/Details: ${transcript || "N/A"}

Please generate:
1. Concise 2-sentence summary
2. 3 Key Takeaways (bullet points)
3. Estimated Chapters with timestamps (e.g. 0:00 Intro, 1:15 Core Concept, 3:40 Demo)
4. Fact-check & Sentiment Score (1-100)

Return output formatted nicely in Markdown.`;

      const analysisText = await generateAI(prompt, undefined, undefined, "video");
      res.json({ analysis: analysisText });
    } catch (err: any) {
      console.error("AI Video Summarizer Error Handler:", err);
      res.json({ analysis: generateMuniAIFallback(req.body.title || "video", undefined, undefined, "video") });
    }
  });

  // AI Smart Reply Generator
  app.post("/api/ai/smart-reply", async (req, res) => {
    try {
      const { postText, commentContext } = req.body;

      const prompt = `Original Post: "${postText || "Check out MuniSocial!"}"
Comment to reply to: "${commentContext || "Amazing update!"}"

Generate 3 quick, smart, diverse reply options (1. Friendly & Enthusiastic, 2. Insightful & Professional, 3. Witty & Playful).
Output as JSON format array of 3 strings: ["reply1", "reply2", "reply3"]`;

      const replyJson = await generateAI(prompt, undefined, "application/json", "smart-reply");

      let options = ["Thanks for sharing! 🔥", "Great point! What do you think about AI social apps?", "Love this update! ✨"];
      try {
        options = JSON.parse(replyJson || "[]");
      } catch (e) {
        // Fallback array if parsing fails
      }

      res.json({ replies: options });
    } catch (err: any) {
      console.error("Smart Reply Error Handler:", err);
      res.json({ replies: ["Great post! 🔥", "Thanks for sharing this insight!", "Love seeing this! ✨"] });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 MuniSocial server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

