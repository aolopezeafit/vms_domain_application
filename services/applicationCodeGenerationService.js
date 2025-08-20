var projectUtils = require('../utils/projectUtils');
var serenaModelUtils = require('../utils/SerenaModelUtils');
var textUtils = require('../utils/textUtils');
var modelUtils = require('../utils/modelUtils');

var fs = require('fs');
var path = require('path');

async function generateApplicationCode(req) {
    createFile_main_py();
    createFile_launch_json();
    return "ok";
}

function createFile_main_py() {
    const filePath = 'C:/generation/TiendasVirtuales/main.py';
    const content = `from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3
from typing import List
import numpy as np
from sklearn.neighbors import NearestNeighbors

app = FastAPI()
DATABASE = "store.db"

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

class User(BaseModel):
    username: str

class Purchase(BaseModel):
    username: str
    product_id: int

@app.on_event("startup")
def startup():
    with get_db() as db:
        db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL
        );
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS purchases (
            user_id INTEGER,
            product_id INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(product_id) REFERENCES products(id)
        );
        """)
        count = db.execute("SELECT COUNT(*) FROM products").fetchone()[0]
        if count == 0:
            db.executemany("INSERT INTO products (name) VALUES (?)", [
                ("Laptop",), ("Phone",), ("Headphones",), ("Mouse",), ("Keyboard",)
            ])
            db.commit()

@app.post("/register")
def register(user: User):
    with get_db() as db:
        try:
            db.execute("INSERT INTO users (username) VALUES (?)", (user.username,))
            db.commit()
            return {"message": "User registered"}
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=400, detail="Username already exists")

@app.get("/products")
def get_products():
    with get_db() as db:
        rows = db.execute("SELECT * FROM products").fetchall()
        return [dict(row) for row in rows]

@app.post("/purchase")
def make_purchase(p: Purchase):
    with get_db() as db:
        user = db.execute("SELECT id FROM users WHERE username = ?", (p.username,)).fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        db.execute("INSERT INTO purchases (user_id, product_id) VALUES (?, ?)", (user["id"], p.product_id))
        db.commit()
        return {"message": "Purchase recorded"}

@app.get("/purchases")
def get_products():
    with get_db() as db:
        rows = db.execute("SELECT * FROM purchases").fetchall()
        return [dict(row) for row in rows]

@app.get("/recommendations")
def recommend(username: str):
    with get_db() as db:
        # Obtener todos los usuarios
        users = db.execute("SELECT id, username FROM users").fetchall()
        user_ids = [u["id"] for u in users]
        usernames = [u["username"] for u in users]

        if username not in usernames:
            raise HTTPException(status_code=404, detail="User not found")

        user_index = usernames.index(username)

        # Obtener todos los productos
        products = db.execute("SELECT id FROM products").fetchall()
        product_ids = [p["id"] for p in products]

        # Construir matriz usuario-producto
        matrix = np.zeros((len(user_ids), len(product_ids)))
        purchases = db.execute("SELECT user_id, product_id FROM purchases").fetchall()
        for p in purchases:
            uid = user_ids.index(p["user_id"])
            pid = product_ids.index(p["product_id"])
            matrix[uid][pid] = 1

        # Entrenar modelo de vecinos más cercanos
        num_users = matrix.shape[0]
        if num_users < 2:
            return []  # No hay suficientes usuarios para hacer recomendaciones

        k = min(3, num_users)
        model = NearestNeighbors(n_neighbors=k, metric='cosine')
        model.fit(matrix)

        # Buscar vecinos del usuario actual
        distances, indices = model.kneighbors([matrix[user_index]])

        # Recolectar recomendaciones
        recommended_product_ids = set()
        user_products = set(np.where(matrix[user_index] == 1)[0])
        for idx in indices[0][1:]:  # omitimos el propio usuario
            neighbor_products = set(np.where(matrix[idx] == 1)[0])
            recommended_product_ids.update(neighbor_products - user_products)

        # Traducir índices a product_ids
        recommended_ids = [product_ids[i] for i in recommended_product_ids]
        if not recommended_ids:
            return []

        placeholders = ",".join("?" for _ in recommended_ids)
        rows = db.execute(f"SELECT * FROM products WHERE id IN ({placeholders})", recommended_ids).fetchall()
        return [dict(row) for row in rows]
    `;
    createFile(filePath, content);
}

function createFile_launch_json() {
    const filePath = 'C:/generation/TiendasVirtuales/.vscode/launch.json';
    const content = `{
        "version": "0.2.0",
        "configurations": [
            {
                "name": "Python Debugger: FastAPI",
                "type": "debugpy",
                "request": "launch",
                "module": "uvicorn",
                "args": [
                    "main:app",
                    "--reload"
                ],
                "jinja": true
            }
        ]
    }
    `;
    createFile(filePath, content);
}


function createFile(filePath, content) {
    const dir = path.dirname(filePath); 
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
}

//export methods
module.exports = { generateApplicationCode };