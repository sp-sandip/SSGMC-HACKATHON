import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Auth from './components/Auth';
import {
  ShoppingBag, X, Star, Heart, Search, Box, ChevronRight,
  Award, Zap, TrendingUp, MessageCircle, Filter, ArrowUp,
  Package, Truck, Shield, RefreshCw, ChevronDown, SlidersHorizontal,
  Eye, Share2, Copy, Check, Sparkles, Tag, Clock, Info,
  ChevronLeft, LayoutGrid, List, Flame, ArrowRight, Video, Camera
} from 'lucide-react';
import ExperienceManager from './components/ExperienceManager';
import LiveSession from './components/LiveSession';

const API = 'http://localhost:5000/api';

/* ─── Cover Images (base64 thumbnails – same as original) ─── */
const COVERS = {
  men_formal:   'data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCAAgACABAREA/8QAGQAAAwEBAQAAAAAAAAAAAAAAAQIDBAAF/8QAJBAAAgIBBAIDAQAAAAAAAAAAAQIDEQQSITEiQVFhcZH/2gAIAQEAAD8A+pVtrLFWfYVQi/a/MXrp6FaS/GhqxZJXXbWy9P3v/wBPlr/H3Xyq0xPfS20sXEVm/wCi3hPkrJdRpnVSzKS3H2pNT6wnGm4qdMnXFpbbkr44NfBhvZIvXHVrPJyc3xr2rpeTRXOxzs7bCvXKTi7ZM9LtDjc6dLXV0E4VpunlmvKXuTi1HZ27Q9V0iDiUm/H3M4ZJO5r7V22u6UW0JJzp1x+0vy9n//Z',
  men_casual:   'data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCAAgACABAREA/8QAGgAAAgMBAQAAAAAAAAAAAAAAAAUCAwQGB//EACQQAAIBBAICAQUAAAAAAAAAAAECAwARBBIhMVFxE0Fhgf/aAAgBAQAA/wCGC1Z2VQWJ4AFdFiW3YLfJPhR6n0pwf76UbJuWjXcQSSex9qW+obVl2KqNxN3HB8fxWIi5WQoY14BUDB9B3/rI1fJjtD3sKN8TQPH+elDanCwtteGYB87if6P2ogkSVA6EEHkEV1jM0mV3KJO/luf+17j31//Z',
  women_ethnic: 'data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCAAgACABAREA/8QAGAABAQEBAQAAAAAAAAAAAAAAAAUDBAb/xAAiEAACAQUAAgMBAAAAAAAAAAABAgMABBESITFBUXH/2gAIAQEAAD8A9koXlkSMLlmYAADkk1cV4hWbSS8dxUKOCCzrx+K0NHa6nqNibuC2l3IkxRnbLHAGB7/FPUM39Pt5LkIBcT7PMRlGLHIH2AOMV1r0yXhE73oeWLJZQoyTjA5HuBnvVUV3bGWxaUhoLiMJv8A5BPOKzPSLS4bw7+IHaaSMqQD2cN7njnP3rT09uLOZp5JLa5h2QFRhs++Oc/8aqNPNpq00ssslzEiRQpn/b+P7//Z',
  women_party:  'data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCAAgACABAREA/8QAGQAAAgMBAAAAAAAAAAAAAAAAAQMCBAUG/8QAIxAAAgIBBAMBAQAAAAAAAAAAAQIDBAARITFBUWFx/9oACAEBAAA/APcpSERnc4UAkn2FZSyknmkle7nfwP8ARcMABwAMDFVYb2MiNGijZiQAoAHY8A81hq21+Eo8caJISRuU7Sc++PNJSx0rMMWTqXgcjdtz/vgCnnhSaZYmJZVJJA/I/NVm1JJpWjbw7rGQNxIBz27f7T7FS8lzM5OSeD9AfNfPQ4sGxoFhjUACiB2A7Dn55//Z',
  women_formal: 'data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCAAgACABAREA/8QAGAABAQEBAQAAAAAAAAAAAAAAAAQDBQb/xAAiEAABBAICAgMAAAAAAAAAAAABAAIDBBESITFBUWH/2gAIAQEAAD8A9yiikaNYkUKijaFHtjrQr1bqJK9VJZWJJCKFGSe5/wAVpYXFhdSyNFkbncSNuTjOO3wKW0bULpbRHGQ/cnlq7YhZJSXAIJJfJ7HJ5oFhEjXNyFfwT/Yq2sLuzkaW6gkl3hVbcSSAD4Xnmsiyp0WxgkYlw8aY3eEzn7rmtLS3gtHkWFCm+USYJ5K5xk+aSSvNNLI8jO7kszHJJPcn8//Z',
  women_casual: 'data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCAAgACABAREA/8QAGAABAQEBAQAAAAAAAAAAAAAAAAQDAgX/xAAhEAABBAICAgMAAAAAAAAAAAABAAIDBAURITFBUf/aAAgBAQAA/wCzZrFdO61vLa7dkXqPJb4GM9+DXdD1Jqk7QKJmUe4CgHn3P8C0IHQ2SvXgbB2+AGJJ/wAmtWPn7uc8jBJ3E9yf/wAgq0l7qbBnDMVLLlTjKk9h6r/B1p0NG3mS7t3lRGJCRyfGDjBI5GDn2/taXpgkhe4vFaGadyd7blI247cBQPHFXv/Z',
  men_ethnic:   'data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCAAgACABAREA/8QAFwABAQEBAAAAAAAAAAAAAAAAAAMFBv/EACEQAAIBBQEAAwAAAAAAAAAAAAECABEDITESQVFx/9oACAEBAAA/AKaKazpn6Rbq4JDDqKm7ttumXk5XjxUYjhJJMhbBDdwQP5QXkGaW8BmB6Z3HhiKhku1RO2Q+P8qzVVvLMZ5YFl2b6VMbJbmjijBGVJLtHfYmpSoDABAcAZP7SlcuGI6rnMf/2Q==',
  men_party:    'data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/wAALCAAgACABAREA/8QAGAABAQEBAQAAAAAAAAAAAAAAAAYFBAf/xAAkEAABAwMEAgMBAAAAAAAAAAABAgMEBRESITFBYXGBFP/aAAgBAQAA/wC6u6xpM4r2dVCQJJyoQg+oA7Dz3qpLxqrJJNlk9nJ7k00WtZHVRJa9Z7Ej4a2rrLctMb1a0rxMQq9S6H4Pvmq0nFJRMCWp4oQnhZnIBx4+ZpuHilxIB1q5U5Rnjx2cqN0bME5ZtRPXkYHiowjUhA7Mna5P9G6F/FTBHolWJT3pMxJ7kAcn9lIJGCj0g8UrK//2Q==',
};

const getCover = (cat) => {
  if (!cat) return COVERS.men_casual;
  const c = cat.toLowerCase();
  if (c.includes('women') && c.includes('ethnic')) return COVERS.women_ethnic;
  if (c.includes('women') && c.includes('party'))  return COVERS.women_party;
  if (c.includes('women') && c.includes('formal')) return COVERS.women_formal;
  if (c.includes('women')) return COVERS.women_casual;
  if (c.includes('men') && c.includes('ethnic')) return COVERS.men_ethnic;
  if (c.includes('men') && c.includes('party'))  return COVERS.men_party;
  if (c.includes('men') && c.includes('formal')) return COVERS.men_formal;
  return COVERS.men_casual;
};

const fmt  = n => '₹' + Number(n).toLocaleString('en-IN');
const disc = (p, o) => o > p ? Math.round((1 - p / o) * 100) : 0;

const DEMO_PRODUCTS = [
  { _id:'d1', name:'Red T-Shirt',           category:'Men, Casual',       price:999,   originalPrice:1499,  modelUrl:'/models/red_t-shirt.glb',                            stock:15, badge:'HOT',    rating:4.5, isTrending:true,  sales:91  },
  { _id:'d2', name:'Summer Formal Dress',   category:'Women, Formal',     price:3499,  originalPrice:5999,  modelUrl:'/models/hight-poly_summer_formal_dress.glb',         stock:7,  badge:'NEW',    rating:4.8, isTrending:true,  sales:44  },
  { _id:'d3', name:'Navy Blue Casual Suit', category:'Men, Casual',       price:5999,  originalPrice:8999,  modelUrl:'/models/navy_blue_casual_suit_with_white_jeans.glb', stock:5,  badge:'SALE',   rating:4.7, isTrending:false, sales:67  },
  { _id:'d4', name:'Rock Jacket',           category:'Men, Casual',       price:2799,  originalPrice:3999,  modelUrl:'/models/rock_jacket_mid-poly.glb',                   stock:9,  badge:'',       rating:4.6, isTrending:true,  sales:55  },
  { _id:'d5', name:'Casual Shirt',          category:'Men, Casual',       price:1299,  originalPrice:1999,  modelUrl:'/models/casual_shirt.glb',                           stock:22, badge:'',       rating:4.4, isTrending:false, sales:112 },
  { _id:'d6', name:'Traditional Saree',     category:'Women, Ethnic',     price:8500,  originalPrice:12000, modelUrl:'/models/traditional_saree.glb',                      stock:4,  badge:'PREMIUM',rating:4.9, isTrending:true,  sales:31  },
  { _id:'d7', name:'Festival Lehenga',      category:'Women, Ethnic',     price:11000, originalPrice:16000, modelUrl:'/models/traditional_saree.glb',                      stock:6,  badge:'',       rating:4.7, isTrending:false, sales:35  },
  { _id:'d8', name:'Emerald Evening Gown',  category:'Women, Party Wear', price:7500,  originalPrice:11000, modelUrl:'/models/hight-poly_summer_formal_dress.glb',         stock:3,  badge:'',       rating:4.8, isTrending:false, sales:28  },
  { _id:'d9', name:'Embroidered Sherwani',  category:'Men, Ethnic',       price:15000, originalPrice:22000, modelUrl:'/models/navy_blue_casual_suit_with_white_jeans.glb', stock:2,  badge:'PREMIUM',rating:4.9, isTrending:true,  sales:14  },
  { _id:'d10',name:'Gold Cocktail Dress',   category:'Women, Party Wear', price:4999,  originalPrice:7500,  modelUrl:'/models/hight-poly_summer_formal_dress.glb',         stock:1,  badge:'HOT',    rating:4.7, isTrending:true,  sales:44  },
  { _id:'d11',name:'Luxury Party Tuxedo',   category:'Men, Party Wear',   price:9500,  originalPrice:14000, modelUrl:'/models/navy_blue_casual_suit_with_white_jeans.glb', stock:3,  badge:'',       rating:4.8, isTrending:true,  sales:22  },
  { _id:'d12',name:'Velvet Gala Gown',      category:'Women, Party Wear', price:13000, originalPrice:19000, modelUrl:'/models/hight-poly_summer_formal_dress.glb',         stock:4,  badge:'',       rating:4.8, isTrending:false, sales:17  },
];

/* ─── Model Viewer ─── */
function ModelViewer({ glb, name }) {
  const [loaded, setLoaded] = useState(false);
  const [error,  setError]  = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setLoaded(false); setError(false);
    const el = ref.current; if (!el) return;
    const onL = () => setLoaded(true);
    const onE = () => setError(true);
    el.addEventListener('load', onL); el.addEventListener('error', onE);
    return () => { el.removeEventListener('load', onL); el.removeEventListener('error', onE); };
  }, [glb]);

  if (error) return (
    <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#0a0a14', borderRadius:16, gap:10 }}>
      <Package size={36} color="#2a2a3a"/>
      <p style={{ color:'#333', fontSize:12, fontFamily:"DM Sans,sans-serif" }}>3D model unavailable</p>
      <p style={{ color:'#222', fontSize:10 }}>Place .glb files in /public/models/</p>
    </div>
  );

  return (
    <div style={{ width:'100%', height:'100%', position:'relative', background:'#0a0a14', borderRadius:16, overflow:'hidden' }}>
      {!loaded && (
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:14, zIndex:2, background:'#0a0a14' }}>
          <div style={{ width:44, height:44, border:'3px solid rgba(201,168,76,0.2)', borderTop:'3px solid #C9A84C', borderRadius:'50%', animation:'spin 0.9s linear infinite' }}/>
          <p style={{ color:'#C9A84C', fontSize:10, fontWeight:700, letterSpacing:'0.25em', textTransform:'uppercase' }}>Loading 3D…</p>
        </div>
      )}
      <model-viewer
        ref={ref} src={glb} alt={name}
        auto-rotate camera-controls ar
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity="1.2" environment-image="neutral" exposure="1.3"
        style={{ width:'100%', height:'100%', background:'transparent', display:'block' }}
      >
        <button slot="ar-button" style={{ position:'absolute', bottom:14, right:14, background:'rgba(201,168,76,0.92)', border:'none', borderRadius:10, padding:'9px 16px', fontSize:10, fontWeight:800, color:'#07070d', cursor:'pointer', letterSpacing:'0.08em', textTransform:'uppercase' }}>
          📱 Try AR
        </button>
      </model-viewer>
    </div>
  );
}

/* ─── Stars Component ─── */
function Stars({ rating = 0, size = 14 }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? '#F6C90E' : '#1e1e2e', lineHeight:1 }}>★</span>
      ))}
    </div>
  );
}

/* ─── Badge Component ─── */
function Badge({ text }) {
  if (!text) return null;
  const styles = {
    SALE:    { bg:'#7f1d1d', color:'#fca5a5' },
    NEW:     { bg:'#14532d', color:'#86efac' },
    HOT:     { bg:'#78350f', color:'#fcd34d' },
    PREMIUM: { bg:'linear-gradient(135deg,#C9A84C,#F0D080)', color:'#07070d' },
    default: { bg:'#4c1d95', color:'#c4b5fd' },
  };
  const s = styles[text] || styles.default;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 9, fontWeight: 900, letterSpacing: '0.14em',
      padding: '4px 10px', borderRadius: 6, textTransform: 'uppercase',
      display: 'inline-block', lineHeight: 1.4,
    }}>{text}</span>
  );
}

/* ─── Review Form ─── */
function ReviewForm({ products, onClose }) {
  const [form, setForm] = useState({ userName:'', userEmail:'', productId:'', rating:5, message:'' });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!form.userName || !form.message || !form.productId) return;
    setBusy(true);
    const prod = products.find(p => p._id === form.productId);
    try {
      await fetch(`${API}/reviews`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, productName: prod?.name || '' }),
      });
    } catch {}
    setSent(true); setBusy(false);
  };

  if (sent) return (
    <div style={{ textAlign:'center', padding:'48px 32px' }}>
      <div style={{ fontSize:52, marginBottom:16 }}>🎉</div>
      <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:24, fontWeight:700, marginBottom:8, color:'#fff' }}>Thank you!</h3>
      <p style={{ color:'#555', fontSize:14, marginBottom:24 }}>Your review has been submitted successfully.</p>
      <button onClick={onClose} className="btn-gold" style={{ padding:'12px 32px', borderRadius:12, fontSize:13 }}>Continue Shopping</button>
    </div>
  );

  const inputStyle = {
    width: '100%', background: '#0d0d18', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, padding: '11px 14px', color: '#f0ece4', fontSize: 13,
    fontFamily: "DM Sans,sans-serif",
  };

  return (
    <div style={{ padding: '28px 28px' }}>
      <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:22, fontWeight:700, marginBottom:6, color:'#fff' }}>Share Your Experience</h3>
      <p style={{ color:'#555', fontSize:13, marginBottom:20 }}>Help others make the right choice with your honest review.</p>
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <input style={inputStyle} value={form.userName} onChange={e=>setForm({...form,userName:e.target.value})} placeholder="Your Name *"/>
          <input style={inputStyle} value={form.userEmail} onChange={e=>setForm({...form,userEmail:e.target.value})} placeholder="Email (optional)"/>
        </div>
        <select style={{ ...inputStyle, cursor:'pointer' }} value={form.productId} onChange={e=>setForm({...form,productId:e.target.value})}>
          <option value="">Select Product *</option>
          {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 0' }}>
          <span style={{ color:'#555', fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.1em' }}>Rating</span>
          {[1,2,3,4,5].map(n => (
            <button key={n} onClick={()=>setForm({...form,rating:n})} style={{ fontSize:26, background:'none', border:'none', cursor:'pointer', color: n<=form.rating?'#F6C90E':'#1e1e2e', transition:'transform 0.15s, color 0.15s', lineHeight:1 }}
              onMouseOver={e=>e.target.style.transform='scale(1.25)'} onMouseOut={e=>e.target.style.transform='scale(1)'}>★</button>
          ))}
        </div>
        <textarea style={{ ...inputStyle, resize:'none' }} value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows={3} placeholder="Write your review… *"/>
        <div style={{ display:'flex', gap:10, marginTop:4 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex:1, padding:'12px 0', borderRadius:12, fontSize:13 }}>Cancel</button>
          <button onClick={submit} disabled={busy} className="btn-gold" style={{ flex:2, padding:'12px 0', borderRadius:12, fontSize:13, opacity:busy?0.7:1 }}>
            {busy ? 'Submitting…' : '→ Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Quick View Modal ─── */
function QuickView({ product, onClose, onAddToCart, wishlist, onToggleWish, onStartLive }) {
  const [size, setSize]     = useState('M');
  const [added, setAdded]   = useState(false);

  const handleAdd = () => {
    onAddToCart({ ...product, size });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:60, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(0,0,0,0.85)', backdropFilter:'blur(18px)', animation:'fadeIn 0.2s ease' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'linear-gradient(160deg,#10101a 0%,#0e0e18 100%)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:28, width:'100%', maxWidth:980, maxHeight:'92vh', display:'flex', flexDirection:'row', overflow:'hidden', position:'relative', animation:'slideUp 0.3s ease' }}>

        {/* Close */}
        <button onClick={onClose} style={{ position:'absolute', top:16, right:16, zIndex:10, background:'rgba(255,255,255,0.07)', border:'none', borderRadius:10, padding:10, cursor:'pointer', color:'#888', display:'flex' }}>
          <X size={16}/>
        </button>

        {/* LEFT: media */}
        <div style={{ flex:'0 0 50%', background:'#090912', display:'flex', flexDirection:'column', minHeight:0 }}>
          <div style={{ flex:1, padding:16, minHeight:450, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:'100%', height:'100%', minHeight:450, borderRadius:16, overflow:'hidden', background:'transparent', padding: '16px' }}>
                <img src={product.thumbnailUrl || getCover(product.category)} alt={product.name}
                  style={{ width:'100%', height:'100%', objectFit:'contain', maxHeight:'100%', filter: 'drop-shadow(0 0 10px rgba(0,0,0,0.5))' }}
                  onError={e => e.target.src = COVERS.men_casual}/>
              </div>
          </div>
        </div>

        {/* RIGHT: info */}
        <div style={{ flex:1, padding:'32px 28px', display:'flex', flexDirection:'column', overflowY:'auto', minHeight:0 }}>
          <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.25)', color:'#C9A84C', fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', padding:'5px 14px', borderRadius:999 }}>
              {product.category?.split(',')[0]}
            </span>
            {product.badge && <Badge text={product.badge}/>}
            {product.isTrending && (
              <span style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(245,101,37,0.1)', border:'1px solid rgba(245,101,37,0.3)', color:'#fb923c', fontSize:9, fontWeight:700, padding:'5px 12px', borderRadius:999, letterSpacing:'0.1em' }}>
                <Flame size={10}/> TRENDING
              </span>
            )}
          </div>

          <h2 style={{ fontFamily:"Playfair Display,serif", fontSize:30, fontWeight:700, lineHeight:1.1, marginBottom:10, color:'#f2ede4' }}>{product.name}</h2>

          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <Stars rating={product.rating} size={15}/>
            <span style={{ fontSize:12, color:'#555' }}>{product.rating || '—'} · {product.reviewCount || 0} reviews</span>
          </div>

          <p style={{ color:'#4a4a6a', fontSize:14, lineHeight:1.8, marginBottom:20 }}>
            {product.description || `Premium ${product.name} crafted with exceptional quality. Try it precisely with our AR Try-On before purchasing.`}
          </p>

          {/* Price */}
          <div style={{ display:'flex', alignItems:'baseline', gap:12, padding:'16px 0', borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)', marginBottom:20 }}>
            <span style={{ fontFamily:"Playfair Display,serif", fontSize:34, fontWeight:700, color:'#C9A84C' }}>{fmt(product.price)}</span>
            {product.originalPrice > product.price && (
              <div>
                <span style={{ fontSize:14, color:'#2a2a3a', textDecoration:'line-through', display:'block' }}>{fmt(product.originalPrice)}</span>
                <span style={{ fontSize:12, fontWeight:700, color:'#22c55e' }}>Save {fmt(product.originalPrice - product.price)} ({disc(product.price, product.originalPrice)}%)</span>
              </div>
            )}
          </div>

          {/* Size */}
          {product.stock > 0 && (
            <div style={{ marginBottom:22 }}>
              <p style={{ fontSize:10, fontWeight:700, color:'#333', letterSpacing:'0.18em', textTransform:'uppercase', marginBottom:10 }}>Select Size</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {['XS','S','M','L','XL','XXL'].map(s => (
                  <button key={s} onClick={()=>setSize(s)} style={{
                    width:44, height:44, borderRadius:10, fontSize:12, fontWeight:700, cursor:'pointer', border:'none', transition:'all 0.15s',
                    background: size===s ? 'linear-gradient(135deg,#C9A84C,#F0D080)' : 'rgba(255,255,255,0.05)',
                    color: size===s ? '#07070d' : '#555',
                  }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Stock warning */}
          {product.stock < 5 && product.stock > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'9px 14px', marginBottom:16 }}>
              <Clock size={12} color="#f87171"/>
              <span style={{ fontSize:12, color:'#f87171', fontWeight:600 }}>Only {product.stock} left — order soon!</span>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginTop:'auto' }}>
            <button onClick={handleAdd} className="btn-gold" disabled={product.stock === 0}
              style={{ width:'100%', borderRadius:14, padding:'15px 0', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:10, opacity: product.stock===0 ? 0.4 : 1, cursor: product.stock===0 ? 'not-allowed' : 'pointer', boxShadow:'0 8px 28px rgba(201,168,76,0.2)' }}>
              <ShoppingBag size={17}/>
              {product.stock === 0 ? 'Out of Stock' : added ? '✓ Added to Bag!' : `Add to Bag — Size ${size}`}
            </button>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <button onClick={()=>onStartLive(product)} className="btn-ghost" style={{ padding:'12px 0', borderRadius:12, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:6, borderColor:'#C9A84C', color:'#C9A84C', gridColumn:'span 2' }}>
                <Video size={14}/> Virtual AR Try-On
              </button>
              <button onClick={()=>onToggleWish(product._id)} className="btn-ghost" style={{ gridColumn:'span 2', padding:'12px 0', borderRadius:12, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:6, color: wishlist.includes(product._id) ? '#f87171' : undefined }}>
                <Heart size={14} fill={wishlist.includes(product._id)?'#f87171':'none'} color={wishlist.includes(product._id)?'#f87171':'currentColor'}/>
                {wishlist.includes(product._id) ? 'Wishlisted' : 'Wishlist'}
              </button>
            </div>
          </div>

          {/* Trust badges */}
          <div style={{ display:'flex', gap:10, marginTop:16, paddingTop:16, borderTop:'1px solid rgba(255,255,255,0.05)', flexWrap:'wrap' }}>
            {[['🚚','Free Delivery over ₹999'],['🔄','Easy 30-day Returns'],['🔒','Secure Payment']].map(([icon,text]) => (
              <div key={text} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#333', fontWeight:500 }}>
                <span style={{ fontSize:14 }}>{icon}</span> {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN APP COMPONENT
══════════════════════════════════════════════════ */
export default function App() {
  const [token,      setToken]      = useState(localStorage.getItem('userToken'));
  const [products,   setProducts]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [selected,   setSelected]   = useState(null);
  const [cart,       setCart]       = useState([]);
  const [wishlist,   setWishlist]   = useState([]);
  const [filter,     setFilter]     = useState('All');
  const [subFilter,  setSubFilter]  = useState('All');
  const [hoveredCard,setHoveredCard]= useState(null);
  const [search,     setSearch]     = useState('');
  const [searchInput,setSearchInput]= useState('');
  const [cartOpen,   setCartOpen]   = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [sortBy,     setSortBy]     = useState('default');
  const [page,       setPage]       = useState(1);
  const [viewMode,   setViewMode]   = useState('grid'); // 'grid' | 'list'
  const [showFilters,setShowFilters]= useState(false);
  const [priceRange, setPriceRange] = useState([0, 25000]);
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [notification, setNotif]   = useState(null);
  const [compareList,setCompareList]= useState([]);
  const [trending,   setTrending]   = useState([]);
  const [experienceItem, setExperienceItem] = useState(null);
  const [activeCall, setActiveCall] = useState(false);
  const PER_PAGE = 12;

  // Scroll to top button
  useEffect(() => {
    const onScroll = () => setShowTopBtn(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Load products
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ search, category: filter === 'All' ? '' : filter, subCategory: subFilter === 'All' ? '' : subFilter });
      const r = await fetch(`${API}/products?${q}`);
      if (!r.ok) throw new Error();
      const data = await r.json();
      setProducts(data);
      setTrending(data.filter(p => p.isTrending).slice(0, 6));
    } catch {
      setProducts(DEMO_PRODUCTS);
      setTrending(DEMO_PRODUCTS.filter(p => p.isTrending).slice(0, 6));
    }
    setLoading(false);
  }, [search, filter, subFilter]);

  useEffect(() => { load(); setPage(1); }, [load]);

  // Toast notification
  const notify = (msg, type = 'success') => {
    setNotif({ msg, type });
    setTimeout(() => setNotif(null), 3000);
  };

  // Sort + filter
  const sorted = [...products]
    .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
    .sort((a, b) => {
      if (sortBy === 'price-asc')  return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating')     return (b.rating||0) - (a.rating||0);
      if (sortBy === 'trending')   return (b.sales||0) - (a.sales||0);
      return 0;
    });

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const visible    = sorted.slice((page-1)*PER_PAGE, page*PER_PAGE);

  // Cart actions
  const addToCart = p => {
    setCart(c => [...c, { ...p }]);
    notify(`${p.name} added to bag!`);
  };
  const removeFromCart = i => setCart(c => c.filter((_,j) => j!==i));
  const cartTotal      = cart.reduce((s,i) => s + i.price, 0);

  const toggleWish = id => {
    setWishlist(w => w.includes(id) ? w.filter(x=>x!==id) : [...w, id]);
  };

  const handleSearch = e => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const MAIN_CATS = [];
  const SUB_CATS = {};

  if (!token) {
    return <Auth onAuthSuccess={t => setToken(t)} />;
  }

  return (
    <div style={{ minHeight:'100vh', background:'#060610', color:'#f2ede4', position:'relative' }}>

      {/* Floating Particles */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, opacity:0.18 }}>
        {[...Array(18)].map((_, i) => (
          <div key={i} style={{ position:'absolute', top:`${Math.random()*100}%`, left:`${Math.random()*100}%`, width: i%3===0?4:2, height: i%3===0?4:2, background:'#C9A84C', borderRadius:'50%', boxShadow:'0 0 10px #C9A84C', animation:`float ${6+i}s infinite alternate ease-in-out` }}/>
        ))}
      </div>


      {/* ── Toast ── */}
      {notification && (
        <div style={{
          position:'fixed', top:80, right:24, zIndex:100, padding:'14px 20px', borderRadius:14,
          background: notification.type==='success' ? '#0f2e1a' : '#2e0f0f',
          border: `1px solid ${notification.type==='success' ? '#166534' : '#7f1d1d'}`,
          color: notification.type==='success' ? '#86efac' : '#fca5a5',
          fontSize:13, fontWeight:600, display:'flex', alignItems:'center', gap:8,
          boxShadow:'0 8px 32px rgba(0,0,0,0.5)', animation:'slideUp 0.3s ease',
        }}>
          {notification.type==='success' ? <Check size={15}/> : <Info size={15}/>}
          {notification.msg}
        </div>
      )}

      {/* ── Scroll to top ── */}
      {showTopBtn && (
        <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})}
          style={{ position:'fixed', bottom:24, right:24, zIndex:50, width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#C9A84C,#F0D080)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 20px rgba(201,168,76,0.4)', animation:'pulse-gold 2s infinite' }}>
          <ArrowUp size={18} color="#07070d"/>
        </button>
      )}

      {/* ══ HEADER ══ */}
      <header className="glass" style={{ position:'sticky', top:0, zIndex:40, borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth:1340, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:68 }}>

          {/* Logo */}
          <a href="/" style={{ display:'flex', alignItems:'center', gap:11, textDecoration:'none' }}>
            <div style={{ width:40, height:40, background:'linear-gradient(135deg,#C9A84C,#F0D080)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', animation:'pulse-gold 3s infinite', flexShrink:0 }}>
              <ShoppingBag size={18} color="#07070d"/>
            </div>
            <div>
              <span style={{ fontFamily:"Playfair Display,serif", fontSize:22, fontWeight:700, color:'#f2ede4', display:'block', lineHeight:1.1 }}>Webion</span>
              <span style={{ fontSize:8, color:'#C9A84C', fontWeight:700, letterSpacing:'0.35em', display:'block' }}>AR FASHION STORE</span>
            </div>
          </a>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ flex:1, maxWidth:380, margin:'0 20px', position:'relative' }}>
            <Search size={14} color="#444" style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)' }}/>
            <input value={searchInput} onChange={e=>setSearchInput(e.target.value)}
              placeholder="Search garments, styles, fabrics…"
              style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'10px 14px 10px 38px', color:'#f2ede4', fontSize:13, fontFamily:"DM Sans,sans-serif", transition:'border-color 0.2s' }}
              onFocus={e=>e.target.style.borderColor='rgba(201,168,76,0.4)'}
              onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.08)'}/>
          </form>

          {/* Nav actions */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={()=>setReviewOpen(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, cursor:'pointer', color:'#666', fontSize:12, fontWeight:500, fontFamily:"DM Sans,sans-serif" }}>
              <MessageCircle size={14}/><span>Review</span>
            </button>

            {/* Wishlist */}
            <button style={{ position:'relative', width:40, height:40, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'#666' }}>
              <Heart size={16}/>
              {wishlist.length > 0 && <span style={{ position:'absolute', top:-6, right:-6, width:18, height:18, background:'#ef4444', borderRadius:'50%', fontSize:9, fontWeight:900, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>{wishlist.length}</span>}
            </button>

            {/* Cart */}
            <button onClick={()=>setCartOpen(v=>!v)} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.22)', borderRadius:10, cursor:'pointer', color:'#C9A84C', fontSize:13, fontWeight:600, fontFamily:"DM Sans,sans-serif" }}>
              <ShoppingBag size={16}/>
              <span>Bag</span>
              {cart.length > 0 && <span style={{ background:'#C9A84C', color:'#07070d', borderRadius:'50%', width:20, height:20, fontSize:11, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center' }}>{cart.length}</span>}
            </button>

            {/* Admin */}
            <a href="admin.html" style={{ padding:'8px 14px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, color:'#444', fontSize:11, textDecoration:'none', fontWeight:600, letterSpacing:'0.05em' }}>ADMIN →</a>
          </div>
        </div>
      </header>

      {/* ══ ANNOUNCEMENT TICKER ══ */}
      <div style={{ background:'linear-gradient(90deg,#C9A84C,#F0D080,#C9A84C)', padding:'7px 0', overflow:'hidden', position:'relative' }}>
        <div className="ticker-wrap">
          <div className="ticker-inner">
            {[...Array(2)].map((_, i) => (
              <span key={i} style={{ color:'#07070d', fontSize:11, fontWeight:700, letterSpacing:'0.15em', paddingRight:60 }}>
                ✦ FREE SHIPPING OVER ₹999 &nbsp;&nbsp;·&nbsp;&nbsp; AR TRY-ON FOR ALL PRODUCTS &nbsp;&nbsp;·&nbsp;&nbsp; EASY 30-DAY RETURNS &nbsp;&nbsp;·&nbsp;&nbsp; PREMIUM QUALITY GUARANTEED &nbsp;&nbsp;·&nbsp;&nbsp; NEW ARRIVALS EVERY WEEK &nbsp;&nbsp;·&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══ HERO ══ */}
      <section style={{ position:'relative', textAlign:'center', padding:'80px 24px 64px', overflow:'hidden' }}>
        {/* Background glow */}
        <div style={{ position:'absolute', top:'40%', left:'50%', transform:'translate(-50%,-50%)', width:900, height:400, background:'radial-gradient(ellipse at center,rgba(201,168,76,0.08) 0%,transparent 70%)', pointerEvents:'none' }}/>
        {/* Grid overlay */}
        <div style={{ position:'absolute', inset:0, opacity:0.03, backgroundImage:'linear-gradient(rgba(201,168,76,1) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,1) 1px,transparent 1px)', backgroundSize:'72px 72px', pointerEvents:'none' }}/>

        <p style={{ fontSize:9, fontWeight:800, letterSpacing:'0.5em', color:'#C9A84C', textTransform:'uppercase', marginBottom:16, animation:'fadeUp 0.5s ease' }}>✦ &nbsp; Premium AR Fashion Experience &nbsp; ✦</p>
        <h1 style={{ fontFamily:"Playfair Display,serif", fontSize:'clamp(2.8rem,7vw,5.2rem)', fontWeight:900, lineHeight:1.05, marginBottom:18, animation:'fadeUp 0.6s ease' }}>
          Try It On Before<br/>
          <em className="text-gradient">You Buy It.</em>
        </h1>
        <p style={{ color:'#3a3a55', fontSize:16, fontWeight:400, maxWidth:520, margin:'0 auto 36px', lineHeight:1.7, animation:'fadeUp 0.7s ease' }}>
          Browse our curated collection of premium garments and experience intelligent Augmented Reality Try-On before checkout.
        </p>

        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap', marginBottom:16, animation:'fadeUp 0.8s ease' }}>
          <button onClick={()=>document.getElementById('shop-section')?.scrollIntoView({behavior:'smooth'})} className="btn-gold" style={{ padding:'14px 32px', borderRadius:14, fontSize:14, display:'flex', alignItems:'center', gap:8, boxShadow:'0 8px 30px rgba(201,168,76,0.25)' }}>
            <ShoppingBag size={16}/> Explore Collection
          </button>
          <button onClick={()=>setActiveCall(true)} className="btn-ghost" style={{ padding:'14px 32px', borderRadius:14, fontSize:14, display:'flex', alignItems:'center', gap:8 }}>
            <Video size={16}/> Call Expert
          </button>
        </div>

        {/* Stats chips */}
        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', animation:'fadeUp 0.9s ease' }}>
          {[['⚡','Instant AR Overlay'],['📱','AI Body Tracking'],['✦',`${products.length || 22}+ Pieces`],['🔒','Secure Checkout'],['🚚','Free Delivery']].map(([icon,label]) => (
            <div key={label} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(201,168,76,0.15)', borderRadius:999, padding:'7px 18px', fontSize:12, color:'#555', display:'flex', alignItems:'center', gap:6, fontWeight:500 }}>
              {icon} {label}
            </div>
          ))}
        </div>
      </section>

      {/* ══ TRENDING CAROUSEL ══ */}
      {trending.length > 0 && (
        <section style={{ padding:'0 0 56px' }}>
          <div style={{ maxWidth:1340, margin:'0 auto', padding:'0 24px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <Flame size={20} color="#fb923c"/>
                <h2 style={{ fontFamily:"Playfair Display,serif", fontSize:26, fontWeight:700, color:'#f2ede4' }}>Trending Now</h2>
              </div>
              <button onClick={()=>setSortBy('trending')} className="btn-ghost" style={{ padding:'8px 16px', borderRadius:10, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                View All <ArrowRight size={13}/>
              </button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14 }}>
              {trending.map(p => (
                <div key={p._id} onClick={()=>setSelected(p)} className="product-card"
                  style={{ background:'#0e0e1a', borderRadius:16, overflow:'hidden', border:'1px solid rgba(255,255,255,0.06)', cursor:'pointer', position:'relative' }}>
                  <div style={{ aspectRatio:'4/5', overflow:'hidden', background:'#141422' }}>
                    <img src={p.thumbnailUrl || getCover(p.category)} alt={p.name} className="card-img"
                      style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.src=COVERS.men_casual}/>
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(6,6,16,0.85) 0%,transparent 55%)' }}/>
                  </div>
                  <div style={{ padding:'10px 12px 12px' }}>
                    <p style={{ fontFamily:"Playfair Display,serif", fontSize:15, fontWeight:600, color:'#f2ede4', marginBottom:4, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name}</p>
                    <p style={{ fontSize:14, fontWeight:700, color:'#C9A84C' }}>{fmt(p.price)}</p>
                  </div>
                  <div style={{ position:'absolute', top:8, left:8 }}>
                    <span style={{ background:'rgba(245,101,37,0.9)', color:'#fff', fontSize:8, fontWeight:900, padding:'3px 8px', borderRadius:5, letterSpacing:'0.1em', display:'flex', alignItems:'center', gap:3 }}>
                      <Flame size={8}/> HOT
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ SHOP SECTION ══ */}
      <section id="shop-section" style={{ maxWidth:1340, margin:'0 auto', padding:'0 24px 80px' }}>

        {/* Section header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
          <div>
            <h2 style={{ fontFamily:"Playfair Display,serif", fontSize:30, fontWeight:700, color:'#f2ede4', marginBottom:4 }}>Full Collection</h2>
            <p style={{ color:'#2e2e4a', fontSize:13 }}>{sorted.length} items in {filter === 'All' ? 'all categories' : filter}</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* View toggle */}
            <div style={{ display:'flex', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, overflow:'hidden' }}>
              {[['grid',<LayoutGrid size={15}/>],['list',<List size={15}/>]].map(([m,icon]) => (
                <button key={m} onClick={()=>setViewMode(m)}
                  style={{ padding:'9px 12px', border:'none', cursor:'pointer', background: viewMode===m ? 'rgba(201,168,76,0.15)' : 'transparent', color: viewMode===m ? '#C9A84C' : '#555', transition:'all 0.15s', display:'flex' }}>
                  {icon}
                </button>
              ))}
            </div>
            {/* Filters toggle */}
            <button onClick={()=>setShowFilters(v=>!v)} className="btn-ghost" style={{ padding:'9px 16px', borderRadius:10, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
              <SlidersHorizontal size={14}/> Filters {showFilters ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Filter row */}
        <div style={{ marginBottom:20 }}>


          {/* Advanced filters panel */}
          {showFilters && (
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'20px 24px', marginBottom:4, display:'flex', gap:24, flexWrap:'wrap', alignItems:'flex-end', animation:'fadeUp 0.2s ease' }}>
              {/* Sort */}
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:'#444', letterSpacing:'0.15em', textTransform:'uppercase', display:'block', marginBottom:8 }}>Sort By</label>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
                  style={{ background:'#0d0d18', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'9px 14px', color:'#aaa', fontSize:13, cursor:'pointer', fontFamily:"DM Sans,sans-serif", minWidth:160 }}>
                  <option value="default">Default</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="trending">Most Popular</option>
                </select>
              </div>
              {/* Price range */}
              <div>
                <label style={{ fontSize:10, fontWeight:700, color:'#444', letterSpacing:'0.15em', textTransform:'uppercase', display:'block', marginBottom:8 }}>
                  Price Range: {fmt(priceRange[0])} – {fmt(priceRange[1])}
                </label>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <input type="range" min={0} max={25000} step={500} value={priceRange[0]}
                    onChange={e=>setPriceRange([+e.target.value, priceRange[1]])}
                    style={{ cursor:'pointer', accentColor:'#C9A84C' }}/>
                  <input type="range" min={0} max={25000} step={500} value={priceRange[1]}
                    onChange={e=>setPriceRange([priceRange[0], +e.target.value])}
                    style={{ cursor:'pointer', accentColor:'#C9A84C' }}/>
                </div>
              </div>
              {/* Reset */}
              <button onClick={()=>{setFilter('All');setSortBy('default');setPriceRange([0,25000]);setSearch('');setSearchInput('');}} className="btn-ghost" style={{ padding:'9px 18px', borderRadius:10, fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                <RefreshCw size={12}/> Reset
              </button>
            </div>
          )}
        </div>

        {/* Product grid/list */}
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:20, position:'relative', zIndex:10 }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{ background:'#0e0e1c', borderRadius:22, border:'1px solid rgba(255,255,255,0.03)', height:450, overflow:'hidden', position:'relative' }}>
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent)', transform:'translateX(-100%)', animation:'shimmer 1.5s infinite' }}/>
                <div style={{ width:'100%', height:'65%', background:'#141422' }}/>
                <div style={{ padding:16 }}>
                  <div style={{ width:'30%', height:10, background:'#1e1e2e', borderRadius:4, marginBottom:10 }}/>
                  <div style={{ width:'80%', height:20, background:'#1e1e2e', borderRadius:6, marginBottom:16 }}/>
                  <div style={{ width:'40%', height:24, background:'#1e1e2e', borderRadius:6 }}/>
                </div>
              </div>
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign:'center', padding:80, color:'#2a2a3a' }}>
            <Search size={40} style={{ marginBottom:16, opacity:0.3 }}/>
            <p style={{ fontSize:18, fontFamily:"Playfair Display,serif", color:'#3a3a55', marginBottom:8 }}>Nothing found</p>
            <p style={{ fontSize:13, color:'#2a2a3a' }}>Try adjusting your search or filters</p>
          </div>
        ) : viewMode === 'list' ? (
          /* ── LIST VIEW ── */
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {visible.map((p, idx) => {
              const cover = p.thumbnailUrl || getCover(p.category);
              const isWished = wishlist.includes(p._id);
              return (
                <div key={p._id} onClick={()=>setSelected(p)} className="product-card"
                  style={{ background:'#0e0e1a', borderRadius:16, overflow:'hidden', border:'1px solid rgba(255,255,255,0.06)', cursor:'pointer', display:'flex', gap:0, boxShadow:'0 4px 16px rgba(0,0,0,0.3)', animationDelay:`${idx*0.03}s` }}>
                  <div style={{ width:160, height:160, flexShrink:0, background:'transparent', overflow:'hidden', padding: '12px' }}>
                    <img src={cover} alt={p.name} className="card-img" style={{ width:'100%', height:'100%', objectFit:'contain', mixBlendMode: 'screen', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.1)) contrast(1.1)' }} onError={e=>e.target.src=COVERS.men_casual}/>
                  </div>
                  <div style={{ flex:1, padding:'18px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:9, fontWeight:700, color:'#C9A84C', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:5 }}>{p.category?.split(',')[0]}</p>
                      <h3 style={{ fontFamily:"Playfair Display,serif", fontSize:20, fontWeight:700, color:'#f2ede4', marginBottom:6 }}>{p.name}</h3>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                        <Stars rating={p.rating} size={12}/>
                        <span style={{ fontSize:11, color:'#333' }}>({p.reviewCount || 0})</span>
                        {p.badge && <Badge text={p.badge}/>}
                      </div>
                      <p style={{ color:'#2a2a3a', fontSize:13, lineHeight:1.6 }}>{p.description?.slice(0,80) || `Premium ${p.name}`}</p>
                    </div>
                    <div style={{ textAlign:'right', flexShrink:0 }}>
                      <p style={{ fontSize:22, fontWeight:800, color:'#f2ede4', marginBottom:4 }}>{fmt(p.price)}</p>
                      {p.originalPrice > p.price && <p style={{ fontSize:12, color:'#333', textDecoration:'line-through', marginBottom:8 }}>{fmt(p.originalPrice)}</p>}
                      <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                        <button onClick={e=>{e.stopPropagation();toggleWish(p._id);}} style={{ width:36, height:36, borderRadius:8, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color: isWished?'#f87171':'#555' }}>
                          <Heart size={14} fill={isWished?'#f87171':'none'}/>
                        </button>
                        <button onClick={e=>{e.stopPropagation();addToCart(p);}} className="btn-gold" style={{ padding:'8px 18px', borderRadius:8, fontSize:12, display:'flex', alignItems:'center', gap:5 }}>
                          <ShoppingBag size={13}/> Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── GRID VIEW ── */
          <motion.div layout className="stagger" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:24, position:'relative', zIndex:10 }}>
            <AnimatePresence mode="popLayout">
              {visible.map((p, idx) => {
                const cover    = p.thumbnailUrl || `/images/dress${p.id}.png`;
                const isWished = wishlist.includes(p._id);
                const lowStock = p.stock > 0 && p.stock < 5;
                const discount = disc(p.price, p.originalPrice);
                return (
                  <motion.div layout initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} transition={{duration:0.25, delay:idx*0.03}} key={p._id} className="product-card group"
                    style={{ background:'transparent', borderRadius:22, overflow:'hidden', border:'none', cursor:'pointer', boxShadow: hoveredCard === p._id ? '0 0 20px rgba(212, 175, 55, 0.6)' : 'none', position:'relative', transition:'all 0.3s ease', transform: hoveredCard === p._id ? 'scale(1.05)' : 'scale(1)', outline:'none' }}>

                    {/* Card image/3D */}
                    <div onClick={()=>setSelected(p)} onMouseEnter={()=>setHoveredCard(p._id)} onMouseLeave={()=>setHoveredCard(null)} style={{ position:'relative', aspectRatio:'3/4', background:'transparent', overflow:'hidden', border:'none', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={cover} alt={p.name} className="card-img" loading="lazy"
                        style={{ width:'100%', height:'100%', objectFit:'contain', transition:'all 0.3s ease', opacity: 1, background:'transparent', border:'none', outline:'none' }} onError={e=>e.target.src=COVERS.men_casual}/>
                      
                      {/* Strictly NO black overlay filters as requested by Master Prompt */}
                      <div style={{ position:'absolute', inset:0, zIndex:20, pointerEvents:'none', background:'linear-gradient(to top,rgba(18,18,18,0.95) 0%,rgba(18,18,18,0) 40%)' }}/>

                      {/* Wish btn */}
                      <button onClick={e=>{e.stopPropagation();toggleWish(p._id);}}
                        style={{ position:'absolute', top:12, right:12, width:34, height:34, borderRadius:'50%', background:'rgba(6,6,16,0.75)', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:21, backdropFilter:'blur(8px)', transition:'transform 0.2s', color: isWished?'#f87171':'#666', pointerEvents:'auto' }}
                        onMouseOver={e=>e.currentTarget.style.transform='scale(1.2)'} onMouseOut={e=>e.currentTarget.style.transform='scale(1)'}>
                        <Heart size={13} fill={isWished?'#f87171':'none'} color={isWished?'#f87171':'currentColor'}/>
                      </button>

                      {/* Top-left badges */}
                      <div style={{ position:'absolute', top:12, left:12, display:'flex', flexDirection:'column', gap:4, zIndex:21 }}>
                        {p.badge && <Badge text={p.badge}/>}
                        {lowStock && (
                          <span style={{ background:'rgba(239,68,68,0.9)', color:'#fff', fontSize:8, fontWeight:900, padding:'3px 8px', borderRadius:5, letterSpacing:'0.08em' }}>⚠ {p.stock} LEFT</span>
                        )}
                        {discount > 0 && !p.badge && (
                          <span style={{ background:'rgba(34,197,94,0.85)', color:'#07070d', fontSize:8, fontWeight:900, padding:'3px 8px', borderRadius:5, letterSpacing:'0.08em' }}>{discount}% OFF</span>
                        )}
                      </div>

                      {/* Out of stock */}
                      {p.stock === 0 && (
                        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:22, pointerEvents:'none' }}>
                          <span style={{ background:'#ef4444', color:'#fff', padding:'8px 22px', borderRadius:10, fontWeight:800, fontSize:12, letterSpacing:'0.08em' }}>SOLD OUT</span>
                        </div>
                      )}

                      {/* 3D badge removed */}
                    </div>

                    {/* Card info */}
                    <div style={{ padding:'14px 16px 16px', position:'relative', zIndex:10 }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                        <p style={{ fontSize:9, fontWeight:700, color:'#C9A84C', letterSpacing:'0.2em', textTransform:'uppercase' }}>{p.subCategory || p.category?.split(',')[0]}</p>
                        {p.isTrending && <span style={{ fontSize:9, color:'#fb923c', fontWeight:700, display:'flex', alignItems:'center', gap:3 }}><Flame size={9}/>Trending</span>}
                      </div>
                      <h3 onClick={()=>setSelected(p)} style={{ fontFamily:"Playfair Display,serif", fontSize:18, fontWeight:700, marginBottom:6, lineHeight:1.2, color:'#f2ede4', cursor:'pointer' }}>{p.name}</h3>

                      <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:8 }}>
                        <Stars rating={p.rating} size={11}/>
                        <span style={{ fontSize:11, color:'#2e2e4a' }}>({p.rating || '—'})</span>
                      </div>

                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div>
                          <span style={{ fontSize:19, fontWeight:800, color:'#f2ede4' }}>{fmt(p.price)}</span>
                          {p.originalPrice > p.price && <span style={{ fontSize:12, color:'#2a2a3a', textDecoration:'line-through', marginLeft:6 }}>{fmt(p.originalPrice)}</span>}
                        </div>
                        <div style={{ display:'flex', gap:6, width:'100%', marginLeft:10 }}>
                          {p.isComingSoon ? (
                            <button className="btn-ghost" disabled
                              style={{ flex:1, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', padding:'8px 4px', fontSize:12, fontWeight:700, pointerEvents:'none', opacity:0.5, border:'1px solid rgba(255,255,255,0.08)' }}>
                              Coming Soon
                            </button>
                          ) : (
                            <button onClick={e=>{e.stopPropagation();setExperienceItem(p);}} className="btn-gold"
                              style={{ flex:1, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'auto', cursor:'pointer', padding:'8px 4px', fontSize:12, fontWeight:700, background:'linear-gradient(135deg, #D4AF37, #FADA5E)', color:'#000080' }}>
                              <Sparkles size={14} style={{ marginRight:4 }}/> Virtual Try-On
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:48, alignItems:'center' }}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="btn-ghost" style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', opacity:page===1?0.4:1, cursor:page===1?'not-allowed':'pointer' }}>
              <ChevronLeft size={16}/>
            </button>
            {Array.from({length:totalPages},(_,i)=>i+1).map(n => (
              <button key={n} onClick={()=>setPage(n)}
                style={{ width:38, height:38, borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', border:'none', transition:'all 0.15s',
                  background: page===n ? 'linear-gradient(135deg,#C9A84C,#F0D080)' : 'rgba(255,255,255,0.05)',
                  color: page===n ? '#07070d' : '#555' }}>
                {n}
              </button>
            ))}
            <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="btn-ghost" style={{ width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', opacity:page===totalPages?0.4:1, cursor:page===totalPages?'not-allowed':'pointer' }}>
              <ChevronRight size={16}/>
            </button>
          </div>
        )}
      </section>

      {/* ══ FEATURES STRIP ══ */}
      <section style={{ borderTop:'1px solid rgba(255,255,255,0.05)', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'40px 24px' }}>
        <div style={{ maxWidth:1340, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:24 }}>
          {[
            { icon:'📸', title:'Virtual AR Try-On',       desc:'See every garment mapped to your shoulders in real-time via AR.' },
            { icon:'🚚', title:'Free Delivery',         desc:'Complimentary shipping on all orders above ₹999.' },
            { icon:'🔄', title:'30-Day Returns',        desc:'Easy, hassle-free returns within 30 days of purchase.' },
            { icon:'🔒', title:'Secure Payments',       desc:'100% safe checkout with industry-grade encryption.' },
            { icon:'🏆', title:'Premium Quality',       desc:'Every garment is hand-picked for superior craftsmanship.' },
          ].map(f => (
            <div key={f.title} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
              <div style={{ fontSize:28, flexShrink:0, marginTop:2 }}>{f.icon}</div>
              <div>
                <p style={{ fontFamily:"Playfair Display,serif", fontSize:16, fontWeight:700, color:'#f2ede4', marginBottom:4 }}>{f.title}</p>
                <p style={{ fontSize:12, color:'#2a2a3a', lineHeight:1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CART DRAWER ══ */}
      {cartOpen && (
        <div style={{ position:'fixed', inset:0, zIndex:60, display:'flex', justifyContent:'flex-end' }}>
          <div onClick={()=>setCartOpen(false)} style={{ flex:1, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)' }}/>
          <div style={{ width:380, background:'#0d0d16', borderLeft:'1px solid rgba(255,255,255,0.07)', display:'flex', flexDirection:'column', animation:'slideRight 0.3s ease', overflow:'hidden' }}>
            {/* Header */}
            <div style={{ padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h2 style={{ fontFamily:"Playfair Display,serif", fontSize:22, fontWeight:700, color:'#fff', display:'flex', alignItems:'center', gap:8 }}>
                <ShoppingBag size={20} color="#C9A84C"/> Shopping Bag <span style={{ fontSize:15, color:'#555' }}>({cart.length})</span>
              </h2>
              <button onClick={()=>setCartOpen(false)} style={{ background:'none', border:'none', color:'#555', cursor:'pointer', padding:6, display:'flex' }}><X size={18}/></button>
            </div>

            {/* Items */}
            <div style={{ flex:1, overflowY:'auto', padding:'0 24px' }}>
              {cart.length === 0 ? (
                <div style={{ padding:'60px 0', textAlign:'center', color:'#1e1e2e' }}>
                  <ShoppingBag size={44} style={{ marginBottom:14, opacity:0.3 }}/>
                  <p style={{ fontSize:15, color:'#2a2a3a', fontFamily:"Playfair Display,serif" }}>Your bag is empty</p>
                  <p style={{ fontSize:12, color:'#1e1e2e', marginTop:6 }}>Add items to get started</p>
                </div>
              ) : cart.map((item, i) => (
                <div key={i} style={{ display:'flex', gap:12, alignItems:'center', padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <img src={item.thumbnailUrl || getCover(item.category)} alt={item.name}
                    style={{ width:58, height:72, borderRadius:10, objectFit:'cover', background:'#141422', flexShrink:0 }} onError={e=>e.target.src=COVERS.men_casual}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontFamily:"Playfair Display,serif", fontSize:15, fontWeight:700, color:'#f2ede4', marginBottom:2, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</p>
                    <p style={{ fontSize:11, color:'#333', marginBottom:4 }}>Size: {item.size || 'M'} · {item.category?.split(',')[0]}</p>
                    <p style={{ fontSize:16, fontWeight:800, color:'#C9A84C' }}>{fmt(item.price)}</p>
                  </div>
                  <button onClick={()=>removeFromCart(i)} style={{ background:'rgba(239,68,68,0.1)', border:'none', color:'#f87171', cursor:'pointer', width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <X size={12}/>
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div style={{ padding:24, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ color:'#555', fontSize:13 }}>{cart.length} item{cart.length>1?'s':''}</span>
                  <span style={{ color:'#555', fontSize:13 }}>Free delivery applied</span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
                  <span style={{ color:'#888', fontSize:15, fontWeight:600 }}>Total</span>
                  <span style={{ fontFamily:"Playfair Display,serif", fontSize:26, fontWeight:700, color:'#C9A84C' }}>{fmt(cartTotal)}</span>
                </div>
                <button className="btn-gold" style={{ width:'100%', borderRadius:14, padding:'15px 0', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:10, boxShadow:'0 8px 28px rgba(201,168,76,0.2)' }}>
                  <Truck size={16}/> Proceed to Checkout
                </button>
                <button onClick={()=>setCartOpen(false)} className="btn-ghost" style={{ width:'100%', borderRadius:14, padding:'12px 0', fontSize:13, marginTop:8 }}>
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ PRODUCT QUICK VIEW MODAL ══ */}
      {selected && (
        <QuickView
          product={selected}
          onClose={()=>setSelected(null)}
          onAddToCart={p=>{addToCart(p);}}
          wishlist={wishlist}
          onToggleWish={toggleWish}
          onStartLive={(p)=>{ setSelected(null); setExperienceItem(p); }}
        />
      )}

      {/* ══ REVIEW MODAL ══ */}
      {reviewOpen && (
        <div onClick={()=>setReviewOpen(false)} style={{ position:'fixed', inset:0, zIndex:65, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(0,0,0,0.82)', backdropFilter:'blur(14px)', animation:'fadeIn 0.2s ease' }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:'#0d0d16', border:'1px solid rgba(255,255,255,0.07)', borderRadius:24, width:'100%', maxWidth:480, overflow:'hidden', animation:'slideUp 0.3s ease', position:'relative' }}>
            <button onClick={()=>setReviewOpen(false)} style={{ position:'absolute', top:16, right:16, background:'rgba(255,255,255,0.07)', border:'none', borderRadius:8, padding:8, cursor:'pointer', color:'#666', display:'flex' }}><X size={15}/></button>
            <ReviewForm products={products} onClose={()=>setReviewOpen(false)}/>
          </div>
        </div>
      )}

      {/* ══ EXPERIENCE MANAGER MODAL ══ */}
      {experienceItem && (
        <ExperienceManager product={experienceItem} onClose={() => setExperienceItem(null)} />
      )}

      {/* ══ LIVE EXPERT CALL MODAL ══ */}
      {activeCall && (
        <LiveSession product={{ name: "General Consultation" }} onClose={() => setActiveCall(false)} />
      )}

      {/* ══ FOOTER ══ */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.05)', padding:'48px 24px 32px' }}>
        <div style={{ maxWidth:1340, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:40, marginBottom:40 }}>
            {/* Brand */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                <div style={{ width:36, height:36, background:'linear-gradient(135deg,#C9A84C,#F0D080)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <ShoppingBag size={16} color="#07070d"/>
                </div>
                <span style={{ fontFamily:"Playfair Display,serif", fontSize:20, fontWeight:700, color:'#f2ede4' }}>Webion AR</span>
              </div>
              <p style={{ color:'#2a2a3a', fontSize:13, lineHeight:1.7 }}>Premium AR Fashion Store — Experience fashion like never before with our immersive AR Virtual Try-On technology.</p>
            </div>

            {/* Links */}
            {[
              { title:'Shop', links:['Men','Women','Ethnic','Formal','Party Wear','New Arrivals'] },
              { title:'Help', links:['Size Guide','Shipping Info','Returns','Track Order','FAQs'] },
              { title:'Company', links:['About Us','Careers','Press','Sustainability','Contact'] },
            ].map(col => (
              <div key={col.title}>
                <h4 style={{ fontFamily:"Playfair Display,serif", fontSize:14, fontWeight:700, color:'#C9A84C', marginBottom:14, letterSpacing:'0.1em', textTransform:'uppercase' }}>{col.title}</h4>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {col.links.map(l => (
                    <a key={l} href="#" style={{ color:'#2a2a3a', fontSize:13, textDecoration:'none', transition:'color 0.15s' }}
                      onMouseOver={e=>e.target.style.color='#C9A84C'} onMouseOut={e=>e.target.style.color='#2a2a3a'}>{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, paddingTop:24, borderTop:'1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize:12, color:'#1a1a2e' }}>© 2025 Webion AR Store. All rights reserved.</p>
            <div style={{ display:'flex', gap:12 }}>
              {['Privacy','Terms','Cookies'].map(l => (
                <a key={l} href="#" style={{ fontSize:12, color:'#1a1a2e', textDecoration:'none' }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
