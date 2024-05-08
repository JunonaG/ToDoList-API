import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = 3000;

const db = new pg.Client({
  user: process.env.DB_USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_DB,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// let items = [];

app.get("/", async (req, res) => {
  try {
    let items = [];
    const result = await db.query("SELECT * FROM items;");
    const toDoList = result.rows;
    items.push(...toDoList);
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

app.post("/add", async (req, res) => {
  try {
    let items = [];
    let item = req.body.newItem;
    if (!item) {
      item = "Add to-do item. Cannot be empty value";
    }
    const result = await db.query(
      "INSERT INTO items (title) VALUES ($1) RETURNING id, title;",
      [item]
    );
    const newItem = result.rows[0];
    items.push(newItem);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

app.post("/edit", async (req, res) => {
  try {
    let items = [];
    const itemToEdit = req.body.updatedItemId;
    let editedTitle = req.body.updatedItemTitle;
    if (!editedTitle) {
      editedTitle = "Add to-do item. Cannot be empty value";
    }
    const result = await db.query(
      "UPDATE items SET title = $1 WHERE id = $2 RETURNING id, title;",
      [editedTitle, itemToEdit]
    );
    const editedItem = result.rows[0];
    items.push(editedItem);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

app.post("/delete", async (req, res) => {
  try {
    const itemToDelete = req.body.deleteItemId;
    const result = await db.query("DELETE FROM items WHERE id = $1;", [
      itemToDelete,
    ]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
