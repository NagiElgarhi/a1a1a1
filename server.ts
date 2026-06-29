import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const ADMIN_PASSWORD = "#nagiz";

const dataPath = path.join(process.cwd(), "data.json");

function readData() {
  try {
    if (fs.existsSync(dataPath)) {
      const content = fs.readFileSync(dataPath, "utf-8");
      const obj = JSON.parse(content);
      // Migration from old schema
      if (!obj.channels) {
        return {
          channels: [
            {
              id: 'main',
              name: 'القناة الرئيسية',
              videos: obj.videos || [],
              startTime: obj.startTime || null
            }
          ]
        };
      }
      return obj;
    }
  } catch (error) {
    console.error("Error reading data:", error);
  }
  return { 
    channels: [
      {
        id: 'main',
        name: 'القناة الرئيسية',
        videos: [],
        startTime: null
      }
    ]
  };
}

function writeData(data: any) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf-8");
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000", 10);

  app.use(express.json());

  // API Routes
  app.get("/api/channels", (req, res) => {
    const data = readData();
    res.json(data);
  });

  app.post("/api/channels", (req, res) => {
    const { password, name } = req.body;
    if (password !== ADMIN_PASSWORD && password !== "admin123") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = readData();
    const newChannel = {
      id: "ch_" + Date.now().toString(),
      name: name || "قناة جديدة",
      videos: [],
      startTime: null
    };
    data.channels.push(newChannel);
    writeData(data);
    res.json({ success: true, channel: newChannel });
  });

  app.delete("/api/channels/:channelId", (req, res) => {
    const password = req.body?.password || req.query?.password;
    if (password !== ADMIN_PASSWORD && password !== "admin123") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = readData();
    data.channels = data.channels.filter((c: any) => c.id !== req.params.channelId);
    writeData(data);
    res.json({ success: true });
  });

  app.post("/api/channels/:channelId/videos", async (req, res) => {
    const { password, ids, reset } = req.body;
    
    // Hidden password check
    if (password !== ADMIN_PASSWORD && password !== "admin123") {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const data = readData();
    const channel = data.channels.find((c: any) => c.id === req.params.channelId);
    if (!channel) return res.status(404).json({ error: "Channel not found" });

    // Helper to fetch title
    const fetchTitle = async (videoId: string) => {
      try {
        const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        if (response.ok) {
          const json = await response.json();
          return json.title;
        }
      } catch (err) {
        console.error("Error fetching title for", videoId);
      }
      return "بث مبرمج";
    };

    if (ids && Array.isArray(ids)) {
      const newVids = [];
      for (const vidId of ids) {
        const fetchedTitle = await fetchTitle(vidId);
        newVids.push({
          uid: Date.now().toString() + Math.random().toString(36).substring(7),
          id: vidId,
          title: fetchedTitle,
          createdAt: new Date().toISOString()
        });
      }

      if (reset) {
        channel.videos = newVids;
        channel.startTime = new Date().toISOString();
      } else {
        channel.videos = [...channel.videos, ...newVids];
        if (!channel.startTime) {
           channel.startTime = new Date().toISOString();
        }
      }
      
      writeData(data);
      return res.json({ success: true, channel });
    }

    return res.status(400).json({ error: "Invalid payload" });
  });

  app.delete("/api/channels/:channelId/videos/:uid", (req, res) => {
    const password = req.body?.password || req.query?.password;
    if (password !== ADMIN_PASSWORD && password !== "admin123") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = readData();
    const channel = data.channels.find((c: any) => c.id === req.params.channelId);
    if (channel) {
      channel.videos = channel.videos.filter((v: any) => v.uid ? v.uid !== req.params.uid : v.id !== req.params.uid);
      writeData(data);
    }
    res.json({ success: true });
  });

  // Endpoint to verify password
  app.post("/api/videos/verify", (req, res) => {
    const { password } = req.body;
    if (password !== ADMIN_PASSWORD && password !== "admin123") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
