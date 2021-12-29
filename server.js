/*
 * ========================================================
 * ========================================================
 *
 *              Server set-up with socket
 *
 * ========================================================
 * ========================================================
 */
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const app = express();
let server = http.createServer(app);
let io = socketIO(server);
require('dotenv').config();
const { PORT } = process.env;

/*
 * ========================================================
 * ========================================================
 *
 *                    Server middleware
 *
 * ========================================================
 * ========================================================
 */     
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());

/*
 * ========================================================
 * ========================================================
 *
 *                    Imports
 *
 * ========================================================
 * ========================================================
 */     
const bindSocket = require('./routers/routes');

/*
 * ========================================================
 * ========================================================
 *
 *                 Login / Game page route
 *
 * ========================================================
 * ========================================================
 */
app.get('/', (req, response) => {
  response.render('index');
});

/*
 * ========================================================
 * ========================================================
 *
 *            Helper function for socket routes
 *
 * ========================================================
 * ========================================================
 */
bindSocket(io);

server.listen(PORT);
