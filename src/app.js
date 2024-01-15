import express from 'express'
import handlebars from 'express-handlebars'
import mongoose from 'mongoose'
import { Server } from 'socket.io'
import  __dirname  from './utils.js';

import productsRouter from './Router/products.router.js'
import cartsRouter from './Router/carts.router.js'
import viewsRouter from './Router/views.router.js'
import messageModel from './DAO/models/message.model.js'
import viewsProductsRouter from './Router/views.router.js'
import routerSession from "./Router/session.router.js"

import session from "express-session"
import MongoStore from "connect-mongo"
import initializePassport from './config/passport.config.js'
import passport from "passport"
import cookieParser from 'cookie-parser'
 import { MONGO_URL, MONGO_DBNAME, PORT } from "./config/config.js"

// Configuración de express
// const PORT = 8080
const app = express();


app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use("/static", express.static(__dirname + "/public"))

// require('dotenv').config();


mongoose.set("strictQuery", false)

 


app.use(session({
    store: MongoStore.create({
      mongoUrl: MONGO_URL,  
      dbName: MONGO_DBNAME,
    }),
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  }))


initializePassport()
app.use(passport.initialize())
app.use(passport.session())


app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')
 
// Configuración de rutas
app.get('/', (req,res) => res.render('index', { name: 'Usuario' }))
app.use(viewsRouter);
app.use('/api/products', productsRouter)
app.use('/api/carts', cartsRouter)
app.use('/home', viewsRouter)
app.use('/products', viewsProductsRouter)
app.use("/api/session", routerSession)



 

// Conexión a MongoDB e inicio servidor
// Conexión a MongoDB e inicio del servidor
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
  .catch(e => console.error('Error al conectar:', e));