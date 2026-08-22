const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../../src/app');
const { connectDB, disconnectDB } = require('../../src/config/db');
const User = require('../../src/models/user.model');
const Order = require('../../src/models/order.model');
const Message = require('../../src/models/message.model');
const Session = require('../../src/models/session.model');
const tokenService = require('../../src/services/token.service');

describe('Food Booking, Delivery & Chat E2E Test Suite', { concurrency: false }, () => {
  let customerUser;
  let deliveryUser;
  let thirdUser;
  let customerToken = '';
  let deliveryToken = '';
  let thirdToken = '';
  let createdOrderId = '';

  before(async () => {
    await connectDB();
    await Order.deleteMany({});
    await Message.deleteMany({});
    await User.deleteMany({});
    await Session.deleteMany({});

    // Create 3 Test Users
    customerUser = await User.create({
      email: 'customer.student@gmail.com',
      fullName: 'Aarav Sharma',
      phone: '+919811111111',
      registrationNumber: '23CSE201',
      passwordHash: 'dummyhash123',
      collegeDetails: { course: 'B.Tech', department: 'CSE', year: 3 }
    });

    deliveryUser = await User.create({
      email: 'delivery.student@gmail.com',
      fullName: 'Vikram Verma',
      phone: '+919822222222',
      registrationNumber: '23CSE202',
      passwordHash: 'dummyhash123',
      collegeDetails: { course: 'B.Tech', department: 'CSE', year: 3 }
    });

    thirdUser = await User.create({
      email: 'third.student@gmail.com',
      fullName: 'Kavya Patel',
      phone: '+919833333333',
      registrationNumber: '23CSE203',
      passwordHash: 'dummyhash123',
      collegeDetails: { course: 'B.Tech', department: 'CSE', year: 2 }
    });

    customerToken = tokenService.generateAccessToken(customerUser);
    deliveryToken = tokenService.generateAccessToken(deliveryUser);
    thirdToken = tokenService.generateAccessToken(thirdUser);
  });

  after(async () => {
    await disconnectDB();
    process.exit(0);
  });

  it('1. Customer places a new food booking -> stored in MongoDB', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        foodDetails: 'Paneer Butter Masala + 3 Butter Naan',
        quantity: 2,
        pickupLocation: 'Central Food Court (Stall 4)',
        deliveryLocation: 'Hostel 5, Room 214',
        specialInstructions: 'Please ask for extra green chutney',
        estimatedAmount: 240,
        deliveryFee: 25
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.order);
    assert.strictEqual(res.body.order.status, 'AVAILABLE');
    assert.strictEqual(res.body.order.customerName, 'Aarav Sharma');
    assert.strictEqual(res.body.order.foodDetails, 'Paneer Butter Masala + 3 Butter Naan');

    createdOrderId = res.body.order._id;

    // Verify persisted directly in MongoDB
    const orderInDb = await Order.findById(createdOrderId);
    assert.ok(orderInDb, 'Order must exist in MongoDB');
    assert.strictEqual(orderInDb.status, 'AVAILABLE');
  });

  it('2. List available orders -> displays newly placed order', async () => {
    const res = await request(app)
      .get('/api/bookings?type=available')
      .set('Authorization', `Bearer ${deliveryToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.orders));
    const found = res.body.orders.find((o) => o._id === createdOrderId);
    assert.ok(found, 'Created order must appear in available feed');
  });

  it('3. Customer cannot accept their own order -> rejects with 400', async () => {
    const res = await request(app)
      .post(`/api/bookings/${createdOrderId}/accept`)
      .set('Authorization', `Bearer ${customerToken}`);

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error, 'CANNOT_ACCEPT_OWN_ORDER');
  });

  it('4. Delivery partner accepts the order -> status transitions to ACCEPTED in DB', async () => {
    const res = await request(app)
      .post(`/api/bookings/${createdOrderId}/accept`)
      .set('Authorization', `Bearer ${deliveryToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.order.status, 'ACCEPTED');
    assert.strictEqual(res.body.order.deliveryPersonName, 'Vikram Verma');

    // Verify DB update
    const dbOrder = await Order.findById(createdOrderId);
    assert.strictEqual(dbOrder.status, 'ACCEPTED');
    assert.strictEqual(dbOrder.deliveryPersonId.toString(), deliveryUser._id.toString());
  });

  it('5. Second delivery partner attempts to accept same order -> rejects with 409 Conflict', async () => {
    const res = await request(app)
      .post(`/api/bookings/${createdOrderId}/accept`)
      .set('Authorization', `Bearer ${thirdToken}`);

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error, 'ORDER_ALREADY_ACCEPTED');
  });

  it('6. Chat: Customer and Delivery Partner can send & retrieve messages', async () => {
    // Delivery partner sends a message
    const msg1Res = await request(app)
      .post(`/api/bookings/${createdOrderId}/messages`)
      .set('Authorization', `Bearer ${deliveryToken}`)
      .send({ message: 'Hi Aarav! I picked up your order from Stall 4, heading to Hostel 5 now.' });

    assert.strictEqual(msg1Res.status, 201);
    assert.strictEqual(msg1Res.body.success, true);
    assert.strictEqual(msg1Res.body.message.message, 'Hi Aarav! I picked up your order from Stall 4, heading to Hostel 5 now.');

    // Customer sends a response
    const msg2Res = await request(app)
      .post(`/api/bookings/${createdOrderId}/messages`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ message: 'Thanks Vikram! I will be waiting at the 2nd floor entrance.' });

    assert.strictEqual(msg2Res.status, 201);
    assert.strictEqual(msg2Res.body.success, true);

    // Fetch conversation history
    const historyRes = await request(app)
      .get(`/api/bookings/${createdOrderId}/messages`)
      .set('Authorization', `Bearer ${customerToken}`);

    assert.strictEqual(historyRes.status, 200);
    assert.strictEqual(historyRes.body.success, true);
    assert.strictEqual(historyRes.body.messages.length, 2);
    assert.strictEqual(historyRes.body.messages[0].senderName, 'Vikram Verma');
    assert.strictEqual(historyRes.body.messages[1].senderName, 'Aarav Sharma');
  });

  it('7. Delivery partner updates status to DELIVERY_IN_PROGRESS', async () => {
    const res = await request(app)
      .patch(`/api/bookings/${createdOrderId}/status`)
      .set('Authorization', `Bearer ${deliveryToken}`)
      .send({ status: 'DELIVERY_IN_PROGRESS' });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.order.status, 'DELIVERY_IN_PROGRESS');
  });

  it('8. Customer marks order as RECEIVED -> status transitions to RECEIVED', async () => {
    const res = await request(app)
      .post(`/api/bookings/${createdOrderId}/received`)
      .set('Authorization', `Bearer ${customerToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.order.status, 'RECEIVED');

    // Verify in MongoDB
    const finalized = await Order.findById(createdOrderId);
    assert.strictEqual(finalized.status, 'RECEIVED');
    assert.ok(finalized.receivedAt instanceof Date);
  });
});
