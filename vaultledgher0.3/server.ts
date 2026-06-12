import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me-in-production";
const USERS_FILE = path.join(__dirname, "data", "users.json");

async function startServer() {
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());

  // Helper to load users
  async function loadUsers() {
    try {
      const data = await fs.readFile(USERS_FILE, "utf-8");
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  // Helper to save users
  async function saveUsers(users: any[]) {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  }

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      req.user = user;
      next();
    });
  };

  // --- API ROUTES ---

  // POST /auth/register
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const users = await loadUsers();
    if (users.find((u: any) => u.email === email)) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      phone: "",
      address: "",
      avatar: `https://picsum.photos/seed/${email}/200`
    };

    users.push(newUser);
    await saveUsers(users);

    res.status(201).json({ message: "User registered successfully" });
  });

  // POST /auth/login
  app.post("/api/auth/login", async (req, res) => {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const users = await loadUsers();
    const user = users.find((u: any) => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: rememberMe ? "30d" : "24h"
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
      sameSite: "strict"
    });

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address
      }
    });
  });

  // POST /auth/logout
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("auth_token");
    res.json({ message: "Logged out successfully" });
  });

  // GET /user/profile
  app.get("/api/user/profile", authenticateToken, async (req: any, res) => {
    const users = await loadUsers();
    const user = users.find((u: any) => u.id === req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      phone: user.phone,
      address: user.address,
      createdAt: user.createdAt
    });
  });

  // PUT /user/profile
  app.put("/api/user/profile", authenticateToken, async (req: any, res) => {
    const { name, phone, address, avatar } = req.body;
    const users = await loadUsers();
    const index = users.findIndex((u: any) => u.id === req.user.id);

    if (index === -1) return res.status(404).json({ message: "User not found" });

    // Update fields
    if (name) users[index].name = name;
    if (phone) users[index].phone = phone;
    if (address) users[index].address = address;
    if (avatar) users[index].avatar = avatar;

    await saveUsers(users);

    res.json({
      id: users[index].id,
      name: users[index].name,
      email: users[index].email,
      avatar: users[index].avatar,
      phone: users[index].phone,
      address: users[index].address
    });
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
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VaultLedger Server running on http://localhost:${PORT}`);
  });
}

startServer();
