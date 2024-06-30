const Router = require('express');
const { register } = require('../controllers/authController');
const errorHandlingMiddleware = require('../middlewares/errorHandlingMiddleware');

const authRouter = Router();


authRouter.post('/register',register)

module.exports = authRouter;