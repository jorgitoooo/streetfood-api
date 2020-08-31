const path = require("path");
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const compression = require("compression");
const cors = require("cors");
// const hpp = require('hpp');

const controller = require("./controllers");
const routes = require("./routes");
const { AppError } = require("./utils");
const { CODE } = require("./constants");

const app = express();

// Trust heroku so that it's able to set
// the x-forwarded-proto header
app.enable("trust proxy");

// Set up view engine
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Serving static files
app.use(express.static(path.join(__dirname, "public")));

// 1) MIDDLEWARES
// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
app.options("*", cors());

/**
 * default-src 'self';
 * base-uri 'self';
 * block-all-mixed-content;
 * font-src 'self' https: data:;
 * frame-ancestors 'self';
 * img-src 'self' data:;
 * object-src 'none';
 * script-src 'self';
 * script-src-attr 'none';
 * style-src 'self' https: 'unsafe-inline';
 * upgrade-insecure-requests
 */
// Set security headers
// app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "default-src": ["'self'"],
      "base-uri": ["'self'"],
      "block-all-mixed-content": [],
      "font-src": ["'self'", "https:", "data:"],
      "frame-ancestors": ["'self'"],
      "img-src": ["'self'", "data:"],
      "object-src": ["'none'"],
      "script-src": [
        "'self'",
        "https://code.jquery.com/jquery-3.5.1.slim.min.js",
        "https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js",
        "https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js",
      ],
      "script-src-attr": ["'none'"],
      "style-src": ["'self'", "https:", "'unsafe-inline'"],
      "upgrade-insecure-requests": [],
    },
  })
);
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit request from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from this IP. Please try again in an hour.",
});
app.use("/api", limiter);

// Body parser, sets req.body with data from body of request
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevents parameter pollution
// app.use(
//   hpp({
//     whitelist: WHITELIST.PARAMS,
//   })
// );

app.use(compression());

// 3) ROUTES
app.get("/", (req, res) => {
  res.status(CODE.OK).render("index");
});

app.use("/api/v1/user", routes.user);
app.use("/api/v1/stand", routes.stand);

// Redirection to documentation
const redirectRoute = (req, res) => {
  res.redirect("/");
};
app.get("/docs", redirectRoute);
app.get("/docs/*", redirectRoute);
app.get("/api/docs", redirectRoute);
app.get("/api/docs/*", redirectRoute);

app.all("*", (req, res, next) => {
  const err = new AppError(
    `${req.originalUrl} is not a valid endpoint`,
    CODE.NOT_FOUND
  );
  next(err);
});

app.use(controller.error.errorHandler);

module.exports = app;
