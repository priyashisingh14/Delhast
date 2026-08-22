const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const emailRoutes = require('./email.routes');
const identityRoutes = require('./identity.routes');
const passwordRoutes = require('./password.routes');

// Mount sub-routers
router.use('/email', emailRoutes);
router.use('/identity', identityRoutes);
router.use('/password', passwordRoutes);
router.use('/', authRoutes);

module.exports = router;
