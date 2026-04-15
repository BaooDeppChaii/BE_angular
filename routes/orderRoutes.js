const express = require('express');
const router = express.Router();
const { checkJWT, isAdmin } = require('../controllers/authCheck');
const OrderController = require('../controllers/orderController');

router.get('/orders/my-orders', checkJWT, OrderController.myOrders);

// ADMIN
router.get('/orders/list', checkJWT, isAdmin, OrderController.get);
router.get('/orders/:id', checkJWT, isAdmin, OrderController.getById);
router.post('/orders/add', checkJWT, isAdmin, OrderController.create);
router.put('/orders/:id', checkJWT, isAdmin, OrderController.update);
router.delete('/orders/:id', checkJWT, isAdmin, OrderController.delete);

module.exports = router;