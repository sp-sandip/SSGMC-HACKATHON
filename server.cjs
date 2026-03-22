const express = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const path     = require('path');
require('dotenv').config();

const app        = express();
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
  price:         { type: Number,  required: true },
  originalPrice: { type: Number },
  thumbnailUrl:  { type: String,  default: '' },
  modelUrl:      { type: String,  default: '' },
  description:   { type: String,  default: '' },
  stock:         { type: Number,  default: 10 },
  badge:         { type: String,  default: '' },
  rating:        { type: Number,  default: 4.5 },
  reviewCount:   { type: Number,  default: 0 },
  sales:         { type: Number,  default: 0 },
  isTrending:    { type: Boolean, default: false },
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
    const { search, category } = req.query;
    const q = {};
    if (search)   q.name     = { $regex: search,   $options: 'i' };
    if (category && category !== 'All')
                  q.category = { $regex: category, $options: 'i' };
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
  { name:'Red T-Shirt',           category:'Men, Casual',       price:999,   originalPrice:1499,  modelUrl:'/models/red_t-shirt.glb',                                 stock:15, badge:'HOT',    rating:4.5, sales:91,  isTrending:true },
  { name:'Summer Formal Dress',   category:'Women, Formal',     price:3499,  originalPrice:5999,  modelUrl:'/models/hight-poly_summer_formal_dress.glb',              stock:7,  badge:'NEW',    rating:4.8, sales:44,  isTrending:true },
  { name:'Navy Blue Casual Suit', category:'Men, Casual',       price:5999,  originalPrice:8999,  modelUrl:'/models/navy_blue_casual_suit_with_white_jeans.glb',      stock:5,  badge:'SALE',   rating:4.7, sales:67,  isTrending:false },
  { name:'Rock Jacket',           category:'Men, Casual',       price:2799,  originalPrice:3999,  modelUrl:'/models/rock_jacket_mid-poly.glb',                        stock:9,  badge:'',       rating:4.6, sales:55,  isTrending:true },
  { name:'Casual Shirt',          category:'Men, Casual',       price:1299,  originalPrice:1999,  modelUrl:'/models/casual_shirt.glb',                                stock:22, badge:'',       rating:4.4, sales:112, isTrending:false },
  { name:'Traditional Saree',     category:'Women, Ethnic',     price:8500,  originalPrice:12000, modelUrl:'/models/traditional_saree.glb',                          stock:4,  badge:'PREMIUM',rating:4.9, sales:31,  isTrending:true },
  { name:'Premium Navy Suit',     category:'Men, Formal',       price:5999,  originalPrice:8999,  modelUrl:'/models/navy_blue_casual_suit_with_white_jeans.glb',      stock:8,  badge:'SALE',   rating:4.7, sales:42,  isTrending:true },
  { name:'Emerald Evening Gown',  category:'Women, Party Wear', price:7500,  originalPrice:11000, modelUrl:'/models/hight-poly_summer_formal_dress.glb',              stock:3,  badge:'',       rating:4.8, sales:28,  isTrending:false },
  { name:'Classic Biker Jacket',  category:'Men, Casual',       price:3500,  originalPrice:4999,  modelUrl:'/models/rock_jacket_mid-poly.glb',                        stock:7,  badge:'',       rating:4.6, sales:55,  isTrending:false },
  { name:'Gold Cocktail Dress',   category:'Women, Party Wear', price:4999,  originalPrice:7500,  modelUrl:'/models/hight-poly_summer_formal_dress.glb',              stock:1,  badge:'HOT',    rating:4.7, sales:44,  isTrending:true },
  { name:'Luxury Party Tuxedo',   category:'Men, Party Wear',   price:9500,  originalPrice:14000, modelUrl:'/models/navy_blue_casual_suit_with_white_jeans.glb',      stock:3,  badge:'',       rating:4.8, sales:22,  isTrending:true },
  { name:'Festival Lehenga',      category:'Women, Ethnic',     price:11000, originalPrice:16000, modelUrl:'/models/traditional_saree.glb',                          stock:6,  badge:'',       rating:4.7, sales:35,  isTrending:false },
  { name:'Linen Summer Shirt',    category:'Men, Casual',       price:1599,  originalPrice:2399,  modelUrl:'/models/casual_shirt.glb',                                stock:20, badge:'',       rating:4.3, sales:88,  isTrending:false },
  { name:'Boho Maxi Dress',       category:'Women, Casual',     price:1999,  originalPrice:2999,  modelUrl:'/models/hight-poly_summer_formal_dress.glb',              stock:13, badge:'',       rating:4.5, sales:61,  isTrending:false },
  { name:'Embroidered Sherwani',  category:'Men, Ethnic',       price:15000, originalPrice:22000, modelUrl:'/models/navy_blue_casual_suit_with_white_jeans.glb',      stock:2,  badge:'PREMIUM',rating:4.9, sales:14,  isTrending:true },
  { name:'Bridal Silk Saree',     category:'Women, Ethnic',     price:8500,  originalPrice:12000, modelUrl:'/models/traditional_saree.glb',                          stock:4,  badge:'',       rating:4.9, sales:31,  isTrending:false },
  { name:'Gold Kurti Set',        category:'Women, Ethnic',     price:3500,  originalPrice:5200,  modelUrl:'/models/traditional_saree.glb',                          stock:8,  badge:'',       rating:4.6, sales:49,  isTrending:false },
  { name:'Slim Fit Trousers',     category:'Men, Formal',       price:1800,  originalPrice:2700,  modelUrl:'/models/navy_blue_casual_suit_with_white_jeans.glb',      stock:16, badge:'',       rating:4.4, sales:77,  isTrending:false },
  { name:'Sequin Dance Top',      category:'Women, Party Wear', price:2500,  originalPrice:3750,  modelUrl:'/models/hight-poly_summer_formal_dress.glb',              stock:0,  badge:'',       rating:4.5, sales:43,  isTrending:false },
  { name:'Formal Cotton Shirt',   category:'Men, Formal',       price:1499,  originalPrice:2200,  modelUrl:'/models/casual_shirt.glb',                                stock:22, badge:'',       rating:4.3, sales:95,  isTrending:false },
  { name:'Vintage Graphic Tee',   category:'Men, Casual',       price:999,   originalPrice:1499,  modelUrl:'/models/red_t-shirt.glb',                                 stock:30, badge:'',       rating:4.2, sales:112, isTrending:false },
  { name:'Velvet Gala Gown',      category:'Women, Party Wear', price:13000, originalPrice:19000, modelUrl:'/models/hight-poly_summer_formal_dress.glb',              stock:4,  badge:'',       rating:4.8, sales:17,  isTrending:false },
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

  // Seed products
  if (!(await Product.countDocuments())) {
    await Product.insertMany(PRODUCTS);
    console.log(`✅ ${PRODUCTS.length} products seeded`);
  }

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

  app.listen(PORT, () => {
    console.log(`\n🚀 Webion AR Server running at http://localhost:${PORT}`);
    console.log(`   AR Shop API  → http://localhost:${PORT}/api/products`);
    console.log(`   Admin Login  → POST http://localhost:${PORT}/api/admin/login`);
  });
}).catch(e => console.error('❌ MongoDB error:', e));
