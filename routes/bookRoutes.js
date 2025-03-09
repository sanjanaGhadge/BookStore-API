const express = require("express");
const Book = require("../models/Book"); // Import Book Model
const router = express.Router();

// 📌 Task 1: Get the book list available in the shop.
router.get("/books", async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});

// 📌 Task 2: Get books based on ISBN.
router.get("/books/isbn/:isbn", async (req, res) => {
    try {
        const book = await Book.findOne({ isbn: req.params.isbn });
        if (!book) return res.status(404).json({ message: "Book not found" });
        res.json(book);
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});

// 📌 Task 3: Get all books by Author.
router.get("/books/author/:author", async (req, res) => {
    try {
        const books = await Book.find({ author: req.params.author });
        if (books.length === 0) return res.status(404).json({ message: "No books found for this author" });
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});

// 📌 Task 4: Get all books based on Title.
router.get("/books/title/:title", async (req, res) => {
    try {
        const books = await Book.find({ title: req.params.title });
        if (books.length === 0) return res.status(404).json({ message: "No books found with this title" });
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});

// 📌 Task 5: Get book reviews.
router.get("/books/review/:isbn", async (req, res) => {
    try {
        const book = await Book.findOne({ isbn: req.params.isbn });
        if (!book) return res.status(404).json({ message: "Book not found" });
        res.json({ reviews: book.reviews });
    } catch (error) {
        res.status(500).json({ error: "Something went wrong" });
    }
});

module.exports = router;
