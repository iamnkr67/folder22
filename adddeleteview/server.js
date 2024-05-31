const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

const readProducts = () => {
  const data = fs.readFileSync(path.join(__dirname, "data/products.json"));
  return JSON.parse(data);
};

const writeProducts = (products) => {
  fs.writeFileSync(
    path.join(__dirname, "data/products.json"),
    JSON.stringify(products, null, 2)
  );
};

app.post("/add", (req, res) => {
  const products = readProducts();
  const newProduct = {
    id: Date.now(),
    name: req.body.name,
    price: req.body.price,
  };
  products.push(newProduct);
  writeProducts(products);
  res.send("Product added successfully");
});

app.get("/view", (req, res) => {
  const products = readProducts();
  res.json(products);
});

app.delete("/delete/:id", (req, res) => {
  const products = readProducts();
  const filteredProducts = products.filter(
    (product) => product.id != req.params.id
  );
  if (filteredProducts.length === products.length) {
    res.status(404).send("Product not found");
  } else {
    writeProducts(filteredProducts);
    res.send("Product deleted successfully");
  }
});

app.put("/update", (req, res) => {
  const products = readProducts();
  const updatedProduct = products.find((product) => product.id == req.body.id);
  if (updatedProduct) {
    if (req.body.name) updatedProduct.name = req.body.name;
    if (req.body.price) updatedProduct.price = req.body.price;
    writeProducts(products);
    res.send("Product updated successfully");
  } else {
    res.status(404).send("Product not found");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
