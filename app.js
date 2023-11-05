const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const socketController = require("./socketController/sessionChat");
// const multer = require("multer");
const uploadClound = require("./utils/cloudinary");
const dotenv = require("dotenv");
dotenv.config();
const MONGO_URI = process.env.MONGO_DB;

const store = new MongoDBStore({
  uri: MONGO_URI,
  collection: "sessions",
});

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/images");
//   },
//   filename: (req, file, cb) => {
//     cb(null, new Date().toISOString() + "-" + file.originalname);
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype === "image/png" ||
//     file.mimetype === "image/jpg" ||
//     file.mimetype === "image/jpeg"
//   ) {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.static("public"));
app.use(express.json());

// app.use(
//   multer({ storage: fileStorage, fileFilter: fileFilter }).array("images", 4)
// );
app.use(uploadClound.array("images", 4));

app.use(
  session({
    secret: "something",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const adminRoutes = require("./routes/admin");

app.use((req, res, next) => {
  req.store = store;
  next();
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/admin-page", adminRoutes);
app.use("/login", userRoutes);
app.use(productRoutes);
app.use(orderRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(MONGO_URI)
  .then((result) => {
    const server = app.listen(5000);
    const io = require("./socket").init(server);
    socketController(io);
  })
  .catch((err) => console.log(err));
