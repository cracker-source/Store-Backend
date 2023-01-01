require("dotenv").config();
require("express-async-errors");

// async errors

const express = require("express");
const app = express();

const connectDB = require("./db/connect");

const productsRoutes = require("./routes/products");

// middleware
app.use(express.json());

const notFoundMiddleware = require("./middleware/not-found");
const errorMiddleWare = require("./middleware/error-handler");

// routes
app.use("/api/v1/products", productsRoutes);

app.get("/", (req, res) => {
  res.send('<h1>Store Api</h1><a href="/api/v1/products">Products</a>');
});

app.use(notFoundMiddleware);
app.use(errorMiddleWare);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`Server is listening ${port}...`));
  } catch (e) {
    console.log(err);
  }
};

start();
