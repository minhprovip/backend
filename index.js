const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session");

const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const AdminRouter = require("./routes/AdminRouter");
const CommentRouter = require("./routes/CommentRouter");
dbConnect();

const corsOptions = {
  origin: true,
  credentials: true,
};

app.use(cors(corsOptions));
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 60 * 5 * 1000,
    },
  }),
);
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    // If user is authenticated, proceed to the next middleware/route handler
    next();
  } else {
    // If not authenticated, respond with 401 Unauthorized
    res.status(401).send({ message: "Unauthorized" });
  }
}
app.use((req, res, next) => {
  if (
    req.path.startsWith("/images/") ||
    req.path === "/api/admin/register" ||
    req.path === "/api/admin/login" ||
    req.path === "/api/admin/logout"
  ) {
    next();
  } else {
    isAuthenticated(req, res, next);
  }
});
app.use(express.json());
app.use(bodyParser.json());
app.use("/api/user", UserRouter);
app.use("/api/photosOfUser", PhotoRouter);
app.use("/api/admin", AdminRouter);
app.use("/api/commentsOfPhoto", CommentRouter);
app.use("/api/images", express.static("images"));

app.get("/", (request, response) => {
  response.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8081, () => {
  console.log("server listening on port 8081");
});
