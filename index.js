import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import { supabase } from "./db.js";
import { downloadPDF } from "./utils/pdfDownload.js";
import { sendWelcomeEmail } from "./utils/sendWelcomeEmail.js";
import { scheduler } from "./scraper.js";

const PORT = process.env.PORT || 4444;

const app = express();
app.use(express.json());

app.use(cors());

app.use(express.json());

async function startServer() {
  try {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    scheduler();
  } catch (error) {
    console.error("Server Startup Failed:", error);
  }
}

startServer();

app.on("error", (error) => {
  console.log("Server Connection Error:", error);
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to NewsBit",
  });
});

app.get("/api/getNews", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("news")
      .select()
      .order("index", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    res.status(200).json({
      data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

app.post("/api/download", async (req, res) => {
  try {
    const { fileUrl, downloadName } = req.body;
    const filePath = await downloadPDF(fileUrl, downloadName);
    const fileBuffer = fs.readFileSync(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${downloadName}.pdf"`,
    );

    res.send(fileBuffer);

    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      } else {
        console.log(`File ${filePath} deleted from server`);
      }
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ message: "Failed to download file" });
  }
});

app.get("/api/refresh", async (req, res) => {
  try {
    res.status(200).json({ message: "Server refreshed" });
  } catch (error) {
    console.error("Error refreshing server:", error);
    res.status(500).json({ message: "Failed to refresh server" });
  }
});

app.post("/api/saveEmail", async (req, res) => {
  try {
    const { email, branch, semester } = req.body;

    const { data, error } = await supabase
      .from("emails")
      .upsert({
        email,
        branch,
        semester,
      })
      .select();

    if (error) {
      console.log(error);

      res.status(500).json({ message: "Error saving email to database" });
      return;
    }

    if (data[0].isWelcomed === false) {
      await sendWelcomeEmail(email, branch, semester);
    }

    res.status(200).json({ message: "Email saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error while saving email" });
  }
});

const refreshServer = async () => {
  try {
    const url = process.env.SERVER_URL;
    const url2 = process.env.SERVER_URL_2;
    const response = await fetch(`${url}/api/refresh`);
    const response2 = await fetch(url2);
    const data = await response.json();
    const data2 = await response2.json();
    console.log("Server/s refreshed:", data, data2);
  } catch (error) {
    console.error("Error refreshing server/s:", error);
  }
};

const interval = 12 * 60 * 1000;
setInterval(refreshServer, interval);

const refreshDatabase = async () => {
  try {
    const { data, error } = await supabase.from("refresh").select();
    const { data: vibesData, error: vibesError } = await vibes_supabase
      .from("raw_posts")
      .select();
    const { data: kamData, error: kamError } = await kam_supabase
      .from("letsworktogethermails")
      .select();

    if (error || vibesError || kamError) {
      throw error || vibesError || kamError;
    }
    console.log("Database refreshed:", data, vibesData, kamData);
  } catch (error) {
    console.error("Error refreshing database:", error);
  }
};

const databaseInterval = 23 * 60 * 60 * 1000;
setInterval(refreshDatabase, databaseInterval);
