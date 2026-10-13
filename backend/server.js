require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const bookSchema = new mongoose.Schema({
  title: {type:String, required:true, trim:true},
  author: {type:String, required:true, trim:true},
  category: {type:String, required:true, trim:true},
  status: {type:String, enum:["Available","Issued"], default:"Available"}
}, {timestamps:true});
const Book = mongoose.model("Book", bookSchema);
app.get("/", (req,res) => res.send("Library backend is running"));
app.get("/books", async (req,res) => { try { res.json(await Book.find().sort({createdAt:-1})); } catch(e) { console.error(e); res.status(500).json({message:"Unable to fetch books"}); } });
app.post("/books", async (req,res) => { try { const {title,author,category,status} = req.body; if(!title || !author || !category) return res.status(400).json({message:"Title, author and category are required"}); const book = await Book.create({title,author,category,status}); res.status(201).json({message:"Book added successfully",book}); } catch(e) { console.error("ADD BOOK ERROR:",e); res.status(400).json({message:"Book could not be added"}); } });
app.put("/books/:id", async (req,res) => { try { const book = await Book.findByIdAndUpdate(req.params.id, req.body, {new:true,runValidators:true}); if(!book) return res.status(404).json({message:"Book not found"}); res.json({message:"Book updated successfully",book}); } catch(e) { console.error(e); res.status(400).json({message:"Book could not be updated"}); } });
app.delete("/books/:id", async (req,res) => { try { const book = await Book.findByIdAndDelete(req.params.id); if(!book) return res.status(404).json({message:"Book not found"}); res.json({message:"Book deleted successfully"}); } catch(e) { console.error(e); res.status(400).json({message:"Book could not be deleted"}); } });
if (!MONGO_URI) { console.error("MONGO_URI missing. Create backend/.env with your Atlas connection string."); process.exit(1); }
mongoose.connect(MONGO_URI).then(() => { console.log("MongoDB connected successfully"); app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`)); }).catch(e => { console.error("MongoDB connection failed:",e.message); process.exit(1); });