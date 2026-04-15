require('dotenv').config();
const express = require('express');
const cors = require("cors");
const app = express();

const port = 3000;
const categoryRoutes = require("./routes/categoryRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const orderDetailRoutes = require("./routes/orderDetailRoutes");
app.use(express.json());

app.use(cors({
    origin: "*",
    methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    allowedHeaders: "Content-Type, Authorization"
}));

app.use(categoryRoutes);
app.use('/users', userRoutes);
app.use(productRoutes);
app.use(orderRoutes);
app.use(orderDetailRoutes);

app.listen(port, () => {
    console.log('running http://localhost:3000');
})