const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const session = require('cookie-session');
const compression = require('compression');
dotenv.config({ path: './config/config.env' }); // read config.env to environmental variables
require('./config/dbConnection')(); // db connection

const { errorHandler, AppError } = require('@utils/tdb_globalutils');

const receivers = require('./utils/rabbitMq');

const adsRoutes = require('./constants/consts').routeConsts.carRoutes;
const adsRouter = require('./routes/carRoutes');

const app = express();

// CORS
app.use(cors());
app.options('*', cors());
app.use(morgan('dev'));

// GLOBAL MIDDLEWARES
app.use(express.json()); // body parser (reading data from body to req.body)
//app.use(cookieParser()); // cookie parser (reading data from cookie to req.cookie)
app.use(
	session({
		signed: false,
	})
);

app.use(compression());
//routes
receivers.userbanReceiver();
app.use(adsRoutes, adsRouter);
app.all('*', (req, res, next) => {
	next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

module.exports = app;
