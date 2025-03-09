require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');

const User = require('./models/User');
const Book = require('./models/Book');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Show Registration Page
app.get('/', (req, res) => {
    res.render('register');
});

// Handle Registration
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (await User.findOne({ email })) {
            return res.send('User already exists.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await new User({ username, email, password: hashedPassword }).save();

        console.log('✅ User Registered:', username);
        res.redirect('/login');
    } catch (error) {
        console.error('❌ Registration Error:', error);
        res.status(500).send('Error registering user');
    }
});

// Show Login Page
app.get('/login', (req, res) => {
    res.render('login', { error: null });
});

// Handle Login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.render("login", { error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.cookie("token", token, { httpOnly: true });
        res.redirect("/books");
    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Authentication Middleware
const authenticateUser = (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.redirect("/login");

        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        res.redirect("/login");
    }
};

// 📌 **Updated Search Books Route**
app.get("/books", async (req, res) => {
    try {
        const { isbn, author, title } = req.query;
        let query = {};

        if (isbn) query.isbn = isbn;
        if (author) query.author = new RegExp(author, "i");
        if (title) query.title = new RegExp(title, "i");

        const books = await Book.find(query);
        const isAuthenticated = !!req.cookies.token;
        
        res.render("books", { books, isAuthenticated, searchQuery: req.query });
    } catch (error) {
        console.error("❌ Error fetching books:", error);
        res.status(500).send("Error fetching books.");
    }
});

// Get Book by ISBN
app.get("/books/isbn/:isbn", async (req, res) => {
    try {
        const book = await Book.findOne({ isbn: req.params.isbn });
        if (!book) return res.status(404).json({ error: "Book not found" });

        res.json(book);
    } catch (error) {
        res.status(500).json({ error: "Error fetching book by ISBN" });
    }
});

app.get("/books/author/:author", async (req, res) => {
    try {
        const books = await Book.find({ author: new RegExp(`^${req.params.author}$`, "i") }); // 🔥 Case-insensitive match
        if (!books.length) return res.status(404).json({ error: "No books found for this author" });

        res.json(books);
    } catch (error) {
        res.status(500).json({ error: "Error fetching books by author" });
    }
});


// Get Books by Title
app.get("/books/title/:title", async (req, res) => {
    try {
        const books = await Book.find({ title: new RegExp(req.params.title, "i") });
        if (!books.length) return res.status(404).json({ error: "No books found with this title" });

        res.json(books);
    } catch (error) {
        res.status(500).json({ error: "Error fetching books by title" });
    }
});

// Get Book Reviews
app.get("/books/review/:isbn", async (req, res) => {
    try {
        const book = await Book.findOne({ isbn: req.params.isbn });
        if (!book) return res.status(404).json({ error: "Book not found" });

        res.json({ title: book.title, reviews: book.reviews });
    } catch (error) {
        res.status(500).json({ error: "Error fetching book reviews" });
    }
});

// Add Review (Logged-in Users)
app.post("/books/:bookId/reviews", authenticateUser, async (req, res) => {
    try {
        const { review } = req.body;
        await Book.findByIdAndUpdate(req.params.bookId, { $push: { reviews: review } });

        res.redirect("/books");
    } catch (error) {
        res.status(500).send("Error adding review.");
    }
});

// Delete Review (Logged-in Users)
app.post("/books/:bookId/reviews/:reviewIndex/delete", authenticateUser, async (req, res) => {
    try {
        const book = await Book.findById(req.params.bookId);
        if (!book) return res.status(404).send("Book not found.");

        book.reviews.splice(req.params.reviewIndex, 1);
        await book.save();

        res.redirect("/books");
    } catch (error) {
        res.status(500).send("Error deleting review.");
    }
});

// Logout
app.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.redirect("/login");
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
