require('dotenv').config();
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const { errorHandler } = require('./middlewares/errorMiddleware');
const { requireAuth } = require('./middlewares/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const clubRoutes = require('./routes/clubRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const careerRoutes = require('./routes/careerRoutes');
const placementRoutes = require('./routes/placementRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'frontend/pages'));

app.use(helmet());
app.use(cors({ origin: process.env.APP_ORIGIN, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: 'draft-7' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { httpOnly: true, sameSite: 'strict', maxAge: 8 * 60 * 60 * 1000 }
  })
);

app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  })
);

app.use('/public', express.static(path.join(process.cwd(), 'frontend/public')));

app.get('/', (req, res) => res.redirect('/dashboard'));
app.use(authRoutes);
app.use(dashboardRoutes);
app.use(announcementRoutes);
app.use(clubRoutes);
app.use(departmentRoutes);
app.use(careerRoutes);
app.use(placementRoutes);
app.use(adminRoutes);

app.get('/403', requireAuth, (req, res) => res.status(403).render('403', { title: 'Forbidden' }));

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => logger.info(`Server running on ${PORT}`));
  })
  .catch((err) => {
    logger.error('Failed to start server', err);
    process.exit(1);
  });
