import express from "express";
import bcrypt from "bcryptjs";
import { authMiddleware } from "../server/middleware/auth.js";
import { readData, writeData } from "../server/data/store.js";

const router = express.Router();

// Listar usuários (protege dados sensíveis)
router.get("/", authMiddleware, (req, res) => {
  try {
    const users = readData("users");
    const safeUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }));
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar usuários" });
  }
});

// Criar usuário (protegido, para painéis/admin)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const users = readData("users");
    const { username, email, password, role } = req.body;

    // Verificar se já existe user/email
    const existingUser = users.find(
      (u) => u.username === username || u.email === email,
    );
    if (existingUser) {
      return res.status(400).json({ error: "Usuário ou email já existe" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      role: role || "user",
      createdAt: new Date().toISOString(),
    };

    users.push(userData);
    writeData("users", users);

    const safeUser = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      createdAt: userData.createdAt,
    };

    res.json({ message: "Usuário criado com sucesso", user: safeUser });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

// Obter usuário específico
router.get("/:id", authMiddleware, (req, res) => {
  try {
    const users = readData("users");
    const user = users.find((u) => u.id === req.params.id);

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar usuário" });
  }
});

// Atualizar usuário
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const users = readData("users");
    const userIndex = users.findIndex((u) => u.id === req.params.id);

    if (userIndex === -1) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    const { username, email, password, role } = req.body;
    const updates = {
      username: username || users[userIndex].username,
      email: email || users[userIndex].email,
      role: role || users[userIndex].role,
      updatedAt: new Date().toISOString(),
    };

    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    } else {
      updates.password = users[userIndex].password;
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    writeData("users", users);

    const { password: _, ...userWithoutPassword } = users[userIndex];
    res.json({
      message: "Usuário atualizado com sucesso",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar usuário" });
  }
});

// Deletar usuário
router.delete("/:id", authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const users = readData("users");

    const userIndex = users.findIndex((user) => user.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // Previnir exclusão do próprio usuário logado
    if (users[userIndex].id === req.user.id) {
      return res
        .status(400)
        .json({ error: "Não é possível deletar seu próprio usuário" });
    }

    users.splice(userIndex, 1);
    writeData("users", users);

    res.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar usuário" });
  }
});

export default router;

