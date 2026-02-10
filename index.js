const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require("cors");

app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect("mongodb://localhost:27017/digitaldukan")
    .then(() => {
        console.log("✅ Database Connected Successfully");
    })
    .catch((err) => {
        console.log("❌ Database Connection Failed:", err);
    });

// Product Schema
const productSchema = mongoose.Schema({
    name: String,
    price: Number
});

const Product = mongoose.model("product", productSchema);

// --- GET: Retrieve all products ---
app.get("/view", async (req, res) => {
    try {
        let allProducts = await Product.find();
        res.send(allProducts);
    } catch (err) {
        res.status(500).send({ error: "Failed to fetch products" });
    }
});

// --- POST: Add a new product ---
app.post("/add", async (req, res) => {
    try {
        let newProduct = new Product({
            name: req.body.name,
            price: req.body.price
        });
        await newProduct.save();
        res.send(newProduct);
    } catch (err) {
        res.status(500).send({ error: "Failed to add product" });
    }
});

// --- PUT: Update product price ---
app.put("/update/:id", async (req, res) => {
    try {
        let id = req.params.id;
        let newPrice = req.body.price;
        let updatedProduct = await Product.findByIdAndUpdate(id, { price: newPrice });
        res.send({
            message: "Product price updated successfully",
            product: updatedProduct
        });
    } catch (err) {
        res.status(500).send({ error: "Failed to update product" });
    }
});

// --- DELETE: Remove a product ---
app.delete("/delete/:id", async (req, res) => {
    try {
        let id = req.params.id;
        let deletedProduct = await Product.findByIdAndDelete(id);
        res.send({
            message: "Product deleted successfully",
            product: deletedProduct
        });
    } catch (err) {
        res.status(500).send({ error: "Failed to delete product" });
    }
});

// Home endpoint
app.get("/home", (req, res) => {
    res.send("🏪 Digital Dukan - Inventory Manager Backend is Running");
});

// Start Server
app.listen(5000, () => {
    console.log("🚀 Server is running on http://localhost:5000");
});