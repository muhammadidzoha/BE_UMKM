// LIBRARY IMPORT
const express           = require('express');
const serverless        = require('serverless-http');
const {PrismaClient}    = require("@prisma/client");
const bodyParser        = require('body-parser');
const cors              = require('cors');
const compression       = require('compression');
const cookieParser      = require('cookie-parser');
import dotenv from "dotenv";
import { resolve } from "path";

// APP CONFIG
dotenv.config();

const app               = express();

app.use(cors({ origin: "http://localhost:5173", credentials:true }));

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({ extended: true }))

app.use(cookieParser())

app.use(compression())

app.use(express.json());

app.use("/api", router);

app.use("/static", express.static(resolve("public")));


// APP ROUTES
const api_routes = require("'../src/routes/routes");

const endpoints = [ api_routes ]

app.use('/.netlify/functions/api', endpoints)

module.exports.handler = serverless(app)