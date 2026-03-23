const express = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const path     = require('path');
const http     = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app        = express();
const server     = http.createServer(app);
const io         = new Server(server, { cors: { origin: '*' } });

/* ═══════════════════ SOCKET.IO ═══════════════════════════════════════════ */
io.on('connection', (socket) => {
  console.log('🔗 Socket connected:', socket.id);
  
  socket.on('initiate_negotiation', (data) => {
    console.log('📞 Legacy call request:', data);
    io.emit('incoming_call', data);
  });
  
  // Advanced Handshake (10-Product Store)
  socket.on('call-request', (data) => {
    console.log('📞 Incoming AR call request:', data);
    io.emit('call-request', data);
  });
  socket.on('call-accepted', (data) => {
    console.log('✅ AR call accepted:', data);
    io.emit('call-accepted', data);
  });
  socket.on('call-ended', (data) => {
    console.log('🛑 AR call ended:', data);
    io.emit('call-ended', data);
  });

  socket.on('disconnect', () => console.log('❌ Socket disconnected:', socket.id));
});
const PORT       = process.env.PORT       || 5000;
const MONGO_URI  = process.env.MONGO_URI  || 'mongodb://localhost:27017/webion_ar';
const JWT_SECRET = process.env.JWT_SECRET || 'webion_secret_2025';

app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'public/images')));

/* ═══════════════════ MODELS ══════════════════════════════════════════════ */

const ProductSchema = new mongoose.Schema({
  name:          { type: String,  required: true },
  category:      { type: String,  required: true },
  subCategory:   { type: String,  default: '' },
  price:         { type: Number,  required: true },
  originalPrice: { type: Number },
  thumbnailUrl:  { type: String,  default: '' },
  modelUrl:      { type: String,  default: '' },
  description:   { type: String,  default: '' },
  badge:         { type: String,  default: '' },
  rating:        { type: Number,  default: 4.5 },
  reviewCount:   { type: Number,  default: 0 },
  sales:         { type: Number,  default: 0 },
  isTrending:    { type: Boolean, default: false },
  isComingSoon:  { type: Boolean, default: false },
  id:            { type: String,  required: true },
}, { timestamps: true });
const Product = mongoose.model('Product', ProductSchema);

const ReviewSchema = new mongoose.Schema({
  userName:    { type: String,  required: true },
  userEmail:   { type: String,  default: '' },
  productId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  productName: { type: String,  default: '' },
  rating:      { type: Number,  required: true, min: 1, max: 5 },
  message:     { type: String,  required: true },
  read:        { type: Boolean, default: false },
}, { timestamps: true });
const Review = mongoose.model('Review', ReviewSchema);

const UserSchema = new mongoose.Schema({
  mobile:   { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });
const User = mongoose.model('User', UserSchema);

const AdminSchema = new mongoose.Schema({
  adminId:  { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name:     { type: String, default: 'Webion Admin' },
});
const Admin = mongoose.model('Admin', AdminSchema);

/* ═══════════════════ MIDDLEWARE ══════════════════════════════════════════ */

const authGuard = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try { req.admin = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ message: 'Invalid token' }); }
};

/* ═══════════════════ AUTH ROUTES ═════════════════════════════════════════ */

app.post('/api/auth/signup', async (req, res) => {
  const { mobile, email, password } = req.body;
  try {
    if (await User.findOne({ $or: [{email}, {mobile}] })) return res.status(400).json({ message: 'User already exists' });
    const user = await User.create({ mobile, email, password: await bcrypt.hash(password, 10) });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { mobile, email } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { mobile: user.mobile, email: user.email } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/admin/login', async (req, res) => {
  const { adminId, password } = req.body;
  try {
    const admin = await Admin.findOne({ adminId });
    if (!admin) return res.status(401).json({ message: 'Access Denied' });
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok)  return res.status(401).json({ message: 'Access Denied' });
    const token = jwt.sign({ id: admin._id, adminId }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, name: admin.name });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ═══════════════════ PRODUCT ROUTES ══════════════════════════════════════ */

app.get('/api/products', async (req, res) => {
  try {
    const { search, category, subCategory } = req.query;
    const q = {};
    if (search)   q.name     = { $regex: search,   $options: 'i' };
    if (category && category !== 'All') q.category = category;
    if (subCategory && subCategory !== 'All') q.subCategory = subCategory;
    res.json(await Product.find(q).sort({ createdAt: -1 }));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Not found' });
    res.json(p);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/products', authGuard, async (req, res) => {
  try { res.status(201).json(await Product.create(req.body)); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

app.put('/api/products/:id', authGuard, async (req, res) => {
  try { res.json(await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

app.delete('/api/products/:id', authGuard, async (req, res) => {
  try { await Product.findByIdAndDelete(req.params.id); res.json({ ok: true }); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

/* ═══════════════════ REVIEW ROUTES ═══════════════════════════════════════ */

app.get('/api/reviews', authGuard, async (req, res) => {
  try { res.json(await Review.find().sort({ createdAt: -1 }).limit(100)); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

app.post('/api/reviews', async (req, res) => {
  try { res.status(201).json(await Review.create(req.body)); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

app.patch('/api/reviews/:id/read', authGuard, async (req, res) => {
  await Review.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ ok: true });
});

app.delete('/api/reviews/:id', authGuard, async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

/* ═══════════════════ STATS ROUTE ═════════════════════════════════════════ */

app.get('/api/stats', authGuard, async (req, res) => {
  try {
    const [totalProducts, unread, lowStock] = await Promise.all([
      Product.countDocuments(),
      Review.countDocuments({ read: false }),
      Product.countDocuments({ stock: { $lt: 5 } }),
    ]);
    const topProducts = await Product.find()
      .sort({ sales: -1 }).limit(5).select('name sales price');
    res.json({ totalProducts, totalUsers: 5, todayVisitors: 3, unreadReviews: unread, lowStock, topProducts });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ═══════════════════ SEED & CONNECT ══════════════════════════════════════ */

const PRODUCTS = [
  { id: "1", name: "Royal Gold Sherwani", category: "Men's Fashion", subCategory: "Traditional", price: 12499, originalPrice: 15499, thumbnailUrl: "/images/dress1.png", stock: 15, badge: "LUXURY", rating: 4.8, reviewCount: 24, sales: 120, isTrending: true, isComingSoon: false },
  { id: "2", name: "Midnight Navy Suit", category: "Men's Fashion", subCategory: "Formal", price: 8999, originalPrice: 11999, thumbnailUrl: "/images/dress2.png", stock: 20, badge: "NEW", rating: 4.7, reviewCount: 18, sales: 85, isTrending: true, isComingSoon: false },
  { id: "3", name: "Charcoal Black Tuxedo", category: "Men's Fashion", subCategory: "Formal", price: 10500, originalPrice: 13500, thumbnailUrl: "/images/dress3.png", stock: 10, badge: "", rating: 4.9, reviewCount: 32, sales: 50, isTrending: true, isComingSoon: false },
  { id: "4", name: "Classic White Shirt", category: "Men's Fashion", subCategory: "Casual", price: 2499, originalPrice: 3499, thumbnailUrl: "/images/dress4.png", stock: 30, badge: "", rating: 4.5, reviewCount: 45, sales: 200, isTrending: false, isComingSoon: false },
  { id: "5", name: "Olive Utility Jacket", category: "Men's Fashion", subCategory: "Outerwear", price: 4200, originalPrice: 5500, thumbnailUrl: "/images/dress5.png", stock: 25, badge: "", rating: 4.6, reviewCount: 20, sales: 150, isTrending: false, isComingSoon: false },
  { id: "6", name: "Navy Crewneck Tee", category: "Men's Fashion", subCategory: "Casual", price: 1800, originalPrice: 2500, thumbnailUrl: "/images/dress6.png", stock: 40, badge: "", rating: 4.4, reviewCount: 50, sales: 300, isTrending: false, isComingSoon: false }
];

const REVIEWS_SEED = [
  { userName:'Priya Sharma',  productName:'Red T-Shirt',          rating:5, message:'Love the 3D preview! Helped me pick the right size. Fast delivery too.', read:false },
  { userName:'Rahul Verma',   productName:'Summer Formal Dress',  rating:4, message:'Beautiful dress, exactly as shown in AR view. Great quality fabric.', read:false },
  { userName:'Anita Patel',   productName:'Casual Shirt',         rating:3, message:'Decent product but took longer than expected to arrive.', read:true },
  { userName:'Karan Singh',   productName:'Traditional Saree',    rating:5, message:'Absolutely stunning! The AR try-on convinced me to buy it immediately.', read:false },
  { userName:'Meera Iyer',    productName:'Navy Blue Casual Suit',rating:5, message:'Premium quality, perfect fit. The 3D model was very accurate.', read:true },
];

mongoose.connect(MONGO_URI).then(async () => {
  console.log('✅ MongoDB connected:', MONGO_URI);

  // Seed admin
  if (!(await Admin.findOne({ adminId: 'admin001' }))) {
    await Admin.create({ adminId: 'admin001', password: await bcrypt.hash('Admin@123', 10), name: 'Webion Admin' });
    console.log('✅ Admin seeded → ID: admin001 | Password: Admin@123');
  }

  // Seed products (Force strict 10-Product Universal Collection on boot)
  await Product.deleteMany({});
  await Product.insertMany(PRODUCTS);
  console.log(`✅ ${PRODUCTS.length} Universal Collection products seeded`);

  // Seed reviews
  if (!(await Review.countDocuments())) {
    const products = await Product.find();
    const withIds = REVIEWS_SEED.map((r, i) => ({
      ...r,
      productId: products[i % products.length]?._id,
    }));
    await Review.insertMany(withIds);
    console.log('✅ Reviews seeded');
  }

  server.listen(PORT, () => {
    console.log(`\n🚀 Webion AR Server running at http://localhost:${PORT}`);
    console.log(`   AR Shop API  → http://localhost:${PORT}/api/products`);
    console.log(`   Admin Login  → POST http://localhost:${PORT}/api/admin/login`);
  });
}).catch(e => console.error('❌ MongoDB error:', e));
