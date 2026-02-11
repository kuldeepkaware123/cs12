const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dns = require("dns");
const path = require("path");

const app = express();
const PORT = 5000;
const MONGODB_URI ="mongodb+srv://kuldeepkaware77_db_user:AJlP1LvAmCYrakRM@cluster0.p1bxjm4.mongodb.net/";

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

async function connectToDatabaseWithDnsFallback() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Database connected successfully");
    return;
  } catch (err) {
    const isSrvDnsError =
      err &&
      err.code === "ECONNREFUSED" &&
      err.syscall === "querySrv" &&
      MONGODB_URI.startsWith("mongodb+srv://");

    if (!isSrvDnsError) {
      console.log("Database connection failed:", err.message);
      return;
    }

    const fallbackDnsServers = (process.env.MONGO_DNS_SERVERS || "8.8.8.8,1.1.1.1")
      .split(",")
      .map((server) => server.trim())
      .filter(Boolean);

    dns.setServers(fallbackDnsServers);
    console.log(
      `SRV DNS lookup failed. Retrying MongoDB with DNS servers: ${fallbackDnsServers.join(", ")}`
    );

    try {
      await mongoose.connect(MONGODB_URI);
      console.log("Database connected successfully");
    } catch (retryErr) {
      console.log("Database connection failed:", retryErr.message);
    }
  }
}

connectToDatabaseWithDnsFallback();

const productSchema = mongoose.Schema({
  name: String,
  price: Number,
});

const Product = mongoose.model("product", productSchema);

app.get("/view", async (req, res) => {
  try {
    const allProducts = await Product.find();
    res.send(allProducts);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch products" });
  }
});

app.post("/add", async (req, res) => {
  try {
    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
    });

    await newProduct.save();
    res.send(newProduct);
  } catch (err) {
    res.status(500).send({ error: "Failed to add product" });
  }
});

app.put("/update/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const newPrice = req.body.price;
    const updatedProduct = await Product.findByIdAndUpdate(id, { price: newPrice });

    res.send({
      message: "Product price updated successfully",
      product: updatedProduct,
    });
  } catch (err) {
    res.status(500).send({ error: "Failed to update product" });
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(id);

    res.send({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (err) {
    res.status(500).send({ error: "Failed to delete product" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/home", (req, res) => {
  res.send("Digital Dukan - Inventory Manager Backend is running");
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
