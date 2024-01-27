import express from "express"
import mongoose from "mongoose"
import routerProducts from "./Router/products.router.js"
import routerCarts from "./Router/carts.router.js"
import routerViews from "./Router/views.router.js"
import routerSession from "./Router/session.router.js"
import handlebars from "express-handlebars"
import { messagesService } from "./services/index.js"
import __dirname from "./utils.js"
import cookieParser from "cookie-parser"
import initializePassport from "./config/passport.config.js"
import passport from "passport"
import { Server } from "socket.io"
import { MONGO_URL, MONGO_DBNAME, PORT } from "./config/config.js"

// Configuración de express
// const PORT = 8080
const app = express();
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/static", express.static(__dirname + "/public"))


app.engine("handlebars", handlebars.engine())
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");

initializePassport()
app.use(passport.initialize())

app.use("/api/session", routerSession)
app.use("/api/products", routerProducts)
app.use("/api/carts", routerCarts)
app.use("/", routerViews)

mongoose.connect(process.env.MONGO_URL, { dbName: process.env.MONGO_DBNAME })
  .then(() => {
    console.log('DB conectada');
    const httpServer = app.listen(process.env.PORT, () => console.log(`Listening 🏃...`));

    // Configuración de socket.io
    const io = new Server(httpServer);
    app.set('socketio', io);

    io.on('connection', async socket => {
      console.log('Conexión exitosa🤝');
      socket.on('productList', data => {
        io.emit('updatedProducts', data);
      });

      let messages = (await messageModel.find()) ? await messageModel.find() : [];

      socket.broadcast.emit('alerta');
      socket.emit('logs', messages);
      socket.on('message', data => {
        messages.push(data);
        messageModel.create(messages);
        io.emit('logs', messages);
      });
    });
  })