require("dotenv").config();
const mongoose = require("mongoose");
const Book = require("./models/Book");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

const books = [
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "9780743273565", reviews: ["Fantastic book!", "A timeless classic."] },
    { title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "9780061120084", reviews: ["Thought-provoking", "A masterpiece."] },
    { title: "1984", author: "George Orwell", isbn: "9780451524935", reviews: ["Chilling dystopia", "Very relevant."] },
    { title: "Moby-Dick", author: "Herman Melville", isbn: "9781503280786", reviews: ["A deep and complex story."] },
    { title: "Pride and Prejudice", author: "Jane Austen", isbn: "9780141439518", reviews: ["Romantic and witty", "Love it!"] },
    { title: "The Catcher in the Rye", author: "J.D. Salinger", isbn: "9780316769488", reviews: ["A must-read for youth."] },
    { title: "The Hobbit", author: "J.R.R. Tolkien", isbn: "9780345339683", reviews: ["Magical adventure", "Amazing fantasy world."] },
    { title: "Brave New World", author: "Aldous Huxley", isbn: "9780060850524", reviews: ["Mind-blowing concepts."] },
    { title: "The Lord of the Rings", author: "J.R.R. Tolkien", isbn: "9780618640157", reviews: ["Epic fantasy series."] },
    { title: "The Alchemist", author: "Paulo Coelho", isbn: "9780062315007", reviews: ["Inspirational", "Life-changing book."] }
];

// Insert books into MongoDB
const seedDatabase = async () => {
    try {
        await Book.deleteMany(); // Clear existing books
        await Book.insertMany(books);
        console.log("✅ Books successfully added!");
        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Error inserting books:", error);
        mongoose.connection.close();
    }
};

seedDatabase();
