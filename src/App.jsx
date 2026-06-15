import { useState, useEffect, useCallback } from "react";
import * as api from "./api.js";

// ── Google Fonts ──────────────────────────────────────────────────────────
const FontLink = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap');`}</style>
);

// ── Theme ─────────────────────────────────────────────────────────────────
const T = {
  rose:"#C9857A", roseDark:"#9C5C53", roseLight:"#F5E8E6", rosePale:"#FAF3F2",
  cream:"#FDF8F3", gold:"#BFA07A",    goldLight:"#E8D9C4",
  charcoal:"#2A2420", muted:"#7A6B66", border:"#E8D9D6",
  white:"#FFFFFF", success:"#6B9E76", danger:"#C46060",
};
const appStyle = { display:"block", fontFamily:"'Jost',sans-serif", background:T.cream, color:T.charcoal, minHeight:"100vh", WebkitFontSmoothing:"antialiased" };

const CATEGORIES    = ["All","Hair","Bags","Rings","Necklaces","Earrings","Sunglasses","Bracelets"];
const STATUS_COLORS = { Delivered:{bg:"#E8F5EA",color:"#3D7A4A"}, Shipped:{bg:"#E8F0FB",color:"#2B5EA7"}, Processing:{bg:"#FDF3E0",color:"#8A5B1A"}, Pending:{bg:"#F5E8E6",color:"#9C5C53"}, Cancelled:{bg:"#F5E8E8",color:"#A03030"} };
const FALLBACK_EMOJI = { Hair:"🎀", Bags:"👜", Rings:"💍", Necklaces:"📿", Earrings:"✨", Sunglasses:"🕶️", Bracelets:"💎" };

// ── Reusable UI helpers ───────────────────────────────────────────────────
const Badge = ({ status }) => {
  const s = STATUS_COLORS[status] || STATUS_COLORS.Pending;
  return <span style={{ background:s.bg, color:s.color, fontSize:11, fontWeight:500, padding:"3px 10px", borderRadius:20, letterSpacing:"0.04em", fontFamily:"'Jost',sans-serif" }}>{status}</span>;
};

const Btn = ({ children, onClick, variant="primary", small, style:sx={}, disabled }) => {
  const v = { primary:{background:T.rose,color:T.white,border:"none"}, outline:{background:"transparent",color:T.rose,border:`1.5px solid ${T.rose}`}, ghost:{background:"transparent",color:T.muted,border:`1px solid ${T.border}`}, danger:{background:T.danger,color:T.white,border:"none"} };
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...v[variant], padding:small?"6px 14px":"10px 22px", borderRadius:8, fontSize:small?12:13, fontWeight:500, fontFamily:"'Jost',sans-serif", cursor:disabled?"not-allowed":"pointer", letterSpacing:"0.05em", transition:"opacity 0.15s", opacity:disabled?0.5:1, ...sx }}
      onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.opacity="0.82"; }}
      onMouseLeave={e=>{ e.currentTarget.style.opacity=disabled?"0.5":"1"; }}>
      {children}
    </button>
  );
};

const Input = ({ value, onChange, placeholder, type="text", style:sx={} }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder}
    style={{ width:"100%", padding:"9px 14px", border:`1px solid ${T.border}`, borderRadius:8, fontSize:13, fontFamily:"'Jost',sans-serif", color:T.charcoal, background:T.white, outline:"none", boxSizing:"border-box", ...sx }} />
);

const Select = ({ value, onChange, children, style:sx={} }) => (
  <select value={value} onChange={onChange} style={{ padding:"9px 14px", border:`1px solid ${T.border}`, borderRadius:8, fontSize:13, fontFamily:"'Jost',sans-serif", color:T.charcoal, background:T.white, cursor:"pointer", ...sx }}>
    {children}
  </select>
);

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(42,36,32,0.55)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ background:T.white, borderRadius:16, padding:32, width:"100%", maxWidth:520, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 24px 80px rgba(0,0,0,0.18)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:500, margin:0, color:T.charcoal }}>{title}</h2>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, cursor:"pointer", color:T.muted, lineHeight:1 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Toast = ({ msg, onClose }) => msg ? (
  <div style={{ position:"fixed", bottom:28, right:28, background:T.charcoal, color:T.white, padding:"12px 22px", borderRadius:10, fontSize:13, fontFamily:"'Jost',sans-serif", zIndex:2000, display:"flex", alignItems:"center", gap:12, boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
    ✓ {msg}
    <button onClick={onClose} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.7)", cursor:"pointer", fontSize:16, lineHeight:1 }}>✕</button>
  </div>
) : null;

const Spinner = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:80 }}>
    <div style={{ width:36, height:36, border:`3px solid ${T.border}`, borderTop:`3px solid ${T.rose}`, borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// Image with graceful fallback — always fills parent container
const ProductImg = ({ src, alt, category, contain=false }) => {
  const [err, setErr] = useState(false);
  if (err || !src) return (
    <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:52, background:`linear-gradient(135deg,${T.roseLight},${T.goldLight})` }}>
      {FALLBACK_EMOJI[category]||"🎀"}
    </div>
  );
  return (
    <img src={src} alt={alt} onError={()=>setErr(true)}
      style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit: contain ? "contain" : "cover", objectPosition:"center", display:"block" }}
    />
  );
};

// ── STORE FRONT ───────────────────────────────────────────────────────────
function StoreFront({ onGoAdmin }) {
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [category,  setCategory]  = useState("All");
  const [search,    setSearch]    = useState("");
  const [sort,      setSort]      = useState("featured");
  const [cart,      setCart]      = useState([]);
  const [page,      setPage]      = useState("shop"); // shop | product | cart | checkout | thanks
  const [selected,  setSelected]  = useState(null);
  const [detailQty, setDetailQty] = useState(1);
  const [toast,     setToast]     = useState("");
  const [placing,   setPlacing]   = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [form,      setForm]      = useState({ name:"", email:"", phone:"", address:"", city:"", pin:"" });

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""), 3000); };

  // Fetch products whenever filters change
  useEffect(() => {
    setLoading(true);
    api.getProducts({ category, search, sort })
      .then(setProducts)
      .catch(e => showToast("Failed to load products: " + e.message))
      .finally(() => setLoading(false));
  }, [category, search, sort]);

  const addToCart = (product, qty=1) => {
    setCart(c => { const ex=c.find(x=>x._id===product._id); if(ex) return c.map(x=>x._id===product._id?{...x,qty:x.qty+qty}:x); return [...c,{...product,qty}]; });
    showToast(`${product.name} added to cart`);
  };
  const removeFromCart = id => setCart(c=>c.filter(x=>x._id!==id));
  const updateQty = (id, qty) => { if(qty<1){removeFromCart(id);return;} setCart(c=>c.map(x=>x._id===id?{...x,qty}:x)); };
  const cartTotal = cart.reduce((s,x)=>s+x.price*x.qty, 0);
  const cartCount = cart.reduce((s,x)=>s+x.qty, 0);

  const placeOrder = async () => {
    setPlacing(true);
    try {
      const body = {
        ...form,
        customer: form.name,
        items: cart.map(x=>({ productId:x._id, qty:x.qty })),
        total: cartTotal,
      };
      const order = await api.createOrder(body);
      setLastOrder(order);
      setCart([]);
      setPage("thanks");
    } catch(e) {
      showToast("Order failed: " + e.message);
    } finally {
      setPlacing(false);
    }
  };

  // ── Navbar
  const NavBar = () => (
    <nav style={{ background:T.white, borderBottom:`1px solid ${T.border}`, position:"sticky", top:0, zIndex:100 }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64 }}>
        <div onClick={()=>setPage("shop")} style={{ cursor:"pointer", display:"flex", alignItems:"baseline", gap:8 }}>
          <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:600, color:T.rose }}>Petal & Bow</span>
          <span style={{ fontSize:10, color:T.muted, letterSpacing:"0.15em", textTransform:"uppercase", fontWeight:300 }}>accessories</span>
        </div>
        <div style={{ display:"flex", gap:20, alignItems:"center", flexWrap:"wrap" }}>
          {CATEGORIES.filter(c=>c!=="All").map(c=>(
            <span key={c} onClick={()=>{ setCategory(c); setPage("shop"); }} style={{ fontSize:11, color:category===c?T.rose:T.muted, cursor:"pointer", letterSpacing:"0.08em", textTransform:"uppercase", borderBottom:category===c?`1.5px solid ${T.rose}`:"1.5px solid transparent", paddingBottom:2, transition:"color 0.2s", whiteSpace:"nowrap" }}>{c}</span>
          ))}
        </div>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <button onClick={()=>setPage("cart")} style={{ background:"none", border:`1px solid ${T.border}`, borderRadius:8, padding:"8px 16px", cursor:"pointer", fontFamily:"'Jost',sans-serif", fontSize:13, color:T.charcoal, display:"flex", alignItems:"center", gap:6 }}>
            🛒 {cartCount>0&&<span style={{ background:T.rose, color:"#fff", borderRadius:20, padding:"1px 7px", fontSize:10, fontWeight:600 }}>{cartCount}</span>}
          </button>
          <Btn onClick={onGoAdmin} variant="ghost" small>Admin ↗</Btn>
        </div>
      </div>
    </nav>
  );

  // ── SHOP
  if (page==="shop") return (
    <div style={appStyle}>
      <FontLink />
      <NavBar />
      {/* Hero */}
      <div style={{ position:"relative", height:"60vh", minHeight:420, maxHeight:600, overflow:"hidden" }}>
        <img src="/images/heroimage.png" alt="Petal & Bow" onError={e=>e.target.style.display="none"}
          style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center 30%", display:"block" }} />
        <div style={{ position:"absolute", inset:0, background:"rgba(42,24,20,0.3)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:24 }}>
          <p style={{ fontSize:11, letterSpacing:"0.3em", textTransform:"uppercase", color:"rgba(255,255,255,0.85)", fontWeight:300, marginBottom:16 }}>New Season Collection</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"clamp(40px,6vw,80px)", fontWeight:400, color:"#fff", margin:"0 0 18px", lineHeight:1.1, textShadow:"0 2px 24px rgba(0,0,0,0.25)" }}>Adorn Every<br/><em>Little Moment</em></h1>
          <p style={{ fontSize:15, color:"rgba(255,255,255,0.82)", maxWidth:460, margin:"0 0 36px", lineHeight:1.8, fontWeight:300 }}>Handpicked accessories for the girl who blooms in every season.</p>
          <Btn onClick={()=>window.scrollTo({top:600,behavior:"smooth"})} style={{ padding:"14px 36px", fontSize:14, letterSpacing:"0.1em", background:"rgba(255,255,255,0.18)", backdropFilter:"blur(8px)", border:"1.5px solid rgba(255,255,255,0.5)", color:"#fff" }}>Shop All Pieces</Btn>
        </div>
      </div>

      {/* Category pills */}
      <div style={{ background:T.white, borderBottom:`1px solid ${T.border}`, padding:"14px 0" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", display:"flex", gap:8, flexWrap:"wrap", justifyContent:"center" }}>
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setCategory(c)} style={{ padding:"7px 20px", borderRadius:20, border:`1.5px solid ${category===c?T.rose:T.border}`, background:category===c?T.roseLight:T.white, color:category===c?T.rose:T.muted, fontSize:12, fontWeight:category===c?500:400, cursor:"pointer", fontFamily:"'Jost',sans-serif", transition:"all 0.15s" }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 24px 16px", display:"flex", gap:12, flexWrap:"wrap", justifyContent:"space-between", alignItems:"center" }}>
        <p style={{ fontSize:13, color:T.muted, margin:0 }}>{products.length} products</p>
        <div style={{ display:"flex", gap:10 }}>
          <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{ width:200 }} />
          <Select value={sort} onChange={e=>setSort(e.target.value)} style={{ width:170 }}>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low–High</option>
            <option value="price-desc">Price: High–Low</option>
            <option value="name">Name A–Z</option>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {loading ? <Spinner /> : (
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px 64px", display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:24 }}>
          {products.map(p=>(
            <div key={p._id} onClick={()=>{ setSelected(p); setDetailQty(1); setPage("product"); }}
              style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden", cursor:"pointer", transition:"transform 0.2s,box-shadow 0.2s" }}
              onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(201,133,122,0.15)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
              <div style={{ height:220, position:"relative", background:`linear-gradient(135deg,${T.roseLight},${T.goldLight})`, overflow:"hidden", borderRadius:"16px 16px 0 0" }}>
                <ProductImg src={p.image} alt={p.name} category={p.category} />
              </div>
              <div style={{ padding:"16px 18px 20px" }}>
                <p style={{ fontSize:10, color:T.gold, letterSpacing:"0.15em", textTransform:"uppercase", margin:"0 0 6px", fontWeight:500 }}>{p.category}</p>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:500, color:T.charcoal, margin:"0 0 8px", lineHeight:1.3 }}>{p.name}</h3>
                <p style={{ fontSize:12, color:T.muted, margin:"0 0 14px", lineHeight:1.6, fontWeight:300 }}>{p.description.slice(0,62)}…</p>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:500, color:T.rose }}>₹{p.price}</span>
                  <Btn small onClick={e=>{ e.stopPropagation(); addToCart(p); }}>Add to Cart</Btn>
                </div>
                {p.stock<=10 && <p style={{ fontSize:10, color:T.danger, marginTop:8, fontWeight:500 }}>Only {p.stock} left!</p>}
              </div>
            </div>
          ))}
          {!loading && products.length===0 && (
            <div style={{ gridColumn:"1/-1", textAlign:"center", padding:60, color:T.muted }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22 }}>No accessories found</p>
            </div>
          )}
        </div>
      )}
      <Toast msg={toast} onClose={()=>setToast("")} />
    </div>
  );

  // ── PRODUCT DETAIL
  if (page==="product" && selected) return (
    <div style={appStyle}>
      <FontLink />
      <NavBar />
      <div style={{ maxWidth:1100, margin:"40px auto", padding:"0 24px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:56 }}>
        <div style={{ borderRadius:20, height:460, position:"relative", background:T.rosePale, overflow:"hidden" }}>
          <ProductImg src={selected.image} alt={selected.name} category={selected.category} contain={true} />
        </div>
        <div style={{ paddingTop:24 }}>
          <button onClick={()=>setPage("shop")} style={{ background:"none", border:"none", color:T.muted, fontSize:12, cursor:"pointer", marginBottom:24, padding:0, fontFamily:"'Jost',sans-serif", letterSpacing:"0.06em" }}>← Back to Shop</button>
          <p style={{ fontSize:10, color:T.gold, letterSpacing:"0.2em", textTransform:"uppercase", margin:"0 0 10px", fontWeight:500 }}>{selected.category}</p>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:38, fontWeight:400, color:T.charcoal, margin:"0 0 16px", lineHeight:1.2 }}>{selected.name}</h1>
          <p style={{ fontSize:28, fontFamily:"'Cormorant Garamond',serif", color:T.rose, fontWeight:500, margin:"0 0 24px" }}>₹{selected.price}</p>
          <p style={{ fontSize:14, color:T.muted, lineHeight:1.8, margin:"0 0 32px", fontWeight:300 }}>{selected.description}</p>
          <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:24 }}>
            <label style={{ fontSize:12, color:T.muted, letterSpacing:"0.08em" }}>QTY</label>
            <div style={{ display:"flex", alignItems:"center", border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden" }}>
              <button onClick={()=>setDetailQty(q=>Math.max(1,q-1))} style={{ padding:"8px 14px", background:"none", border:"none", cursor:"pointer", fontSize:16 }}>−</button>
              <span style={{ padding:"8px 16px", fontSize:14, fontWeight:500, borderLeft:`1px solid ${T.border}`, borderRight:`1px solid ${T.border}` }}>{detailQty}</span>
              <button onClick={()=>setDetailQty(q=>Math.min(selected.stock,q+1))} style={{ padding:"8px 14px", background:"none", border:"none", cursor:"pointer", fontSize:16 }}>+</button>
            </div>
            <span style={{ fontSize:12, color:T.muted }}>In stock: {selected.stock}</span>
          </div>
          <Btn onClick={()=>{ addToCart(selected,detailQty); setPage("cart"); }} style={{ width:"100%", padding:"14px", fontSize:14 }}>Add to Cart — ₹{selected.price*detailQty}</Btn>
          <div style={{ marginTop:28, padding:20, background:T.rosePale, borderRadius:12, fontSize:12, color:T.muted, lineHeight:1.8 }}>
            <strong style={{ color:T.charcoal }}>SKU:</strong> {selected.sku} &nbsp;|&nbsp; <strong style={{ color:T.charcoal }}>Category:</strong> {selected.category}
          </div>
        </div>
      </div>
      <Toast msg={toast} onClose={()=>setToast("")} />
    </div>
  );

  // ── CART
  if (page==="cart") return (
    <div style={appStyle}>
      <FontLink />
      <NavBar />
      <div style={{ maxWidth:900, margin:"48px auto", padding:"0 24px" }}>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:36, fontWeight:400, marginBottom:8, color:T.charcoal }}>Your Cart</h1>
        <p style={{ color:T.muted, fontSize:13, marginBottom:36 }}>{cartCount} item{cartCount!==1?"s":""}</p>
        {cart.length===0 ? (
          <div style={{ textAlign:"center", padding:"80px 0" }}>
            <div style={{ fontSize:64, marginBottom:20 }}>🛒</div>
            <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:400, color:T.muted }}>Your cart is empty</h2>
            <Btn onClick={()=>setPage("shop")} style={{ marginTop:24 }}>Continue Shopping</Btn>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:32 }}>
            <div>
              {cart.map(item=>(
                <div key={item._id} style={{ display:"flex", gap:20, padding:"20px 0", borderBottom:`1px solid ${T.border}`, alignItems:"center" }}>
                  <div style={{ width:80, height:80, borderRadius:12, overflow:"hidden", flexShrink:0, position:"relative", background:`linear-gradient(135deg,${T.roseLight},${T.goldLight})` }}>
                    <ProductImg src={item.image} alt={item.name} category={item.category} />
                  </div>
                  <div style={{ flex:1 }}>
                    <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:500, margin:"0 0 4px" }}>{item.name}</h3>
                    <p style={{ fontSize:12, color:T.muted, margin:"0 0 12px" }}>{item.category}</p>
                    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                      <div style={{ display:"flex", alignItems:"center", border:`1px solid ${T.border}`, borderRadius:6, overflow:"hidden" }}>
                        <button onClick={()=>updateQty(item._id,item.qty-1)} style={{ padding:"4px 10px", background:"none", border:"none", cursor:"pointer" }}>−</button>
                        <span style={{ padding:"4px 12px", fontSize:13, borderLeft:`1px solid ${T.border}`, borderRight:`1px solid ${T.border}` }}>{item.qty}</span>
                        <button onClick={()=>updateQty(item._id,item.qty+1)} style={{ padding:"4px 10px", background:"none", border:"none", cursor:"pointer" }}>+</button>
                      </div>
                      <button onClick={()=>removeFromCart(item._id)} style={{ background:"none", border:"none", color:T.danger, cursor:"pointer", fontSize:12, fontFamily:"'Jost',sans-serif" }}>Remove</button>
                    </div>
                  </div>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:500 }}>₹{item.price*item.qty}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:16, padding:28, position:"sticky", top:80 }}>
                <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:500, marginBottom:24 }}>Order Summary</h2>
                {cart.map(item=>(<div key={item._id} style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:T.muted, marginBottom:10 }}><span>{item.name} × {item.qty}</span><span>₹{item.price*item.qty}</span></div>))}
                <div style={{ borderTop:`1px solid ${T.border}`, marginTop:16, paddingTop:16, display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:14, fontWeight:500 }}>Shipping</span>
                  <span style={{ fontSize:14, color:T.success }}>Free</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:12 }}>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:500 }}>Total</span>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:600, color:T.rose }}>₹{cartTotal}</span>
                </div>
                <Btn onClick={()=>setPage("checkout")} style={{ width:"100%", marginTop:24, padding:"13px", fontSize:14 }}>Checkout →</Btn>
                <button onClick={()=>setPage("shop")} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", marginTop:12, fontSize:12, color:T.muted, fontFamily:"'Jost',sans-serif" }}>Continue Shopping</button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Toast msg={toast} onClose={()=>setToast("")} />
    </div>
  );

  // ── CHECKOUT
  if (page==="checkout") {
    const fields = [
      {key:"name",label:"Full Name",placeholder:"Priya Sharma"},
      {key:"email",label:"Email",placeholder:"priya@email.com",type:"email"},
      {key:"phone",label:"Phone",placeholder:"9876543210"},
      {key:"address",label:"Address",placeholder:"123, Rose Garden Lane"},
      {key:"city",label:"City",placeholder:"Mumbai"},
      {key:"pin",label:"PIN Code",placeholder:"400001"},
    ];
    const isValid = fields.every(f=>form[f.key].trim().length>2);
    return (
      <div style={appStyle}>
        <FontLink />
        <NavBar />
        <div style={{ maxWidth:860, margin:"48px auto", padding:"0 24px", display:"grid", gridTemplateColumns:"1fr 320px", gap:40 }}>
          <div>
            <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:34, fontWeight:400, marginBottom:32, color:T.charcoal }}>Checkout</h1>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {fields.map(f=>(
                <div key={f.key} style={{ gridColumn:f.key==="address"?"1/-1":"auto" }}>
                  <label style={{ fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color:T.muted, display:"block", marginBottom:6, fontWeight:500 }}>{f.label}</label>
                  <Input value={form[f.key]} onChange={e=>setForm(d=>({...d,[f.key]:e.target.value}))} placeholder={f.placeholder} type={f.type||"text"} />
                </div>
              ))}
            </div>
            <div style={{ marginTop:32, padding:20, background:T.rosePale, borderRadius:12, fontSize:13, color:T.muted }}>
              🔒 Secure checkout. Free delivery on all orders.
            </div>
            <Btn onClick={placeOrder} disabled={!isValid || placing} style={{ marginTop:24, width:"100%", padding:"14px", fontSize:14 }}>
              {placing ? "Placing Order…" : "Place Order →"}
            </Btn>
          </div>
          <div>
            <div style={{ background:T.white, border:`1px solid ${T.border}`, borderRadius:16, padding:24, position:"sticky", top:80 }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:500, marginBottom:20 }}>Your Order</h2>
              {cart.map(item=>(
                <div key={item._id} style={{ display:"flex", gap:12, marginBottom:14, alignItems:"center" }}>
                  <div style={{ width:36, height:36, borderRadius:8, overflow:"hidden", flexShrink:0, position:"relative", background:`linear-gradient(135deg,${T.roseLight},${T.goldLight})` }}>
                    <ProductImg src={item.image} alt={item.name} category={item.category} />
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:500, margin:0 }}>{item.name}</p>
                    <p style={{ fontSize:11, color:T.muted, margin:"2px 0 0" }}>Qty {item.qty}</p>
                  </div>
                  <span style={{ fontSize:14, fontWeight:500 }}>₹{item.price*item.qty}</span>
                </div>
              ))}
              <div style={{ borderTop:`1px solid ${T.border}`, marginTop:16, paddingTop:16, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:500 }}>Total</span>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, color:T.rose, fontWeight:600 }}>₹{cartTotal}</span>
              </div>
            </div>
          </div>
        </div>
        <Toast msg={toast} onClose={()=>setToast("")} />
      </div>
    );
  }

  // ── THANK YOU
  if (page==="thanks" && lastOrder) return (
    <div style={{ ...appStyle, display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}>
      <FontLink />
      <div style={{ textAlign:"center", maxWidth:480, padding:40 }}>
        <div style={{ fontSize:72, marginBottom:24 }}>🌸</div>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:38, fontWeight:400, color:T.charcoal, marginBottom:12 }}>Thank You, {lastOrder.customer.split(" ")[0]}!</h1>
        <p style={{ fontSize:14, color:T.muted, marginBottom:8, lineHeight:1.8 }}>Order <strong style={{ color:T.rose }}>{lastOrder.orderId}</strong> placed successfully.</p>
        <p style={{ fontSize:13, color:T.muted, marginBottom:36, lineHeight:1.8 }}>A confirmation has been sent to {lastOrder.email}. We'll pack your order with love 🎀</p>
        <div style={{ background:T.rosePale, border:`1px solid ${T.border}`, borderRadius:16, padding:24, marginBottom:32 }}>
          <p style={{ fontSize:12, color:T.muted, margin:0, lineHeight:1.8 }}>
            <strong style={{ color:T.charcoal }}>Order ID:</strong> {lastOrder.orderId}<br/>
            <strong style={{ color:T.charcoal }}>Total:</strong> ₹{lastOrder.total}<br/>
            <strong style={{ color:T.charcoal }}>Deliver to:</strong> {lastOrder.city}
          </p>
        </div>
        <Btn onClick={()=>{ setPage("shop"); setLastOrder(null); }}>Continue Shopping</Btn>
      </div>
    </div>
  );

  return null;
}

// ── ADMIN DASHBOARD ───────────────────────────────────────────────────────
function AdminDashboard({ onGoStore }) {
  const [tab,           setTab]           = useState("overview");
  const [products,      setProducts]      = useState([]);
  const [orders,        setOrders]        = useState([]);
  const [customers,     setCustomers]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [toast,         setToast]         = useState("");
  const [productModal,  setProductModal]  = useState(null);
  const [orderModal,    setOrderModal]    = useState(null);
  const [customerModal, setCustomerModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [orderSearch,   setOrderSearch]   = useState("");
  const [orderFilter,   setOrderFilter]   = useState("All");
  const [productSearch, setProductSearch] = useState("");
  const [productCat,    setProductCat]    = useState("All");
  const [formData,      setFormData]      = useState({});

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [p, o, c] = await Promise.all([api.getProducts(), api.getOrders(), api.getCustomers()]);
      setProducts(p); setOrders(o); setCustomers(c);
    } catch(e) { showToast("Load error: " + e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const loadOrders = async () => {
    try { setOrders(await api.getOrders({ status:orderFilter, search:orderSearch })); }
    catch(e) { showToast(e.message); }
  };
  useEffect(() => { loadOrders(); }, [orderFilter, orderSearch]);

  const totalRevenue = orders.reduce((s,o)=>s+o.total,0);
  const lowStock     = products.filter(p=>p.stock<=10).length;
  const avgOrder     = orders.length ? Math.round(totalRevenue/orders.length) : 0;

  // Product CRUD
  const openAdd  = () => { setFormData({ name:"", category:"Hair", price:"", stock:"", description:"", sku:"", imageKey:"" }); setProductModal("add"); };
  const openEdit = p  => { setFormData({ ...p, price:String(p.price), stock:String(p.stock) }); setProductModal(p); };

  const saveProduct = async () => {
    setSaving(true);
    try {
      const body = { ...formData, price:parseInt(formData.price)||0, stock:parseInt(formData.stock)||0 };
      if (productModal==="add") { await api.createProduct(body); showToast("Product added"); }
      else { await api.updateProduct(productModal._id, body); showToast("Product updated"); }
      setProductModal(null);
      setProducts(await api.getProducts());
    } catch(e) { showToast(e.message); }
    finally { setSaving(false); }
  };

  const handleDeleteConfirmed = async () => {
    try {
      if (deleteConfirm.type==="product")  { await api.deleteProduct(deleteConfirm.id);   setProducts(p=>p.filter(x=>x._id!==deleteConfirm.id)); showToast("Product deleted"); }
      if (deleteConfirm.type==="order")    { await api.deleteOrder(deleteConfirm.id);     setOrders(o=>o.filter(x=>x._id!==deleteConfirm.id));   showToast("Order removed"); }
      if (deleteConfirm.type==="customer") { await api.deleteCustomer(deleteConfirm.id); setCustomers(c=>c.filter(x=>x._id!==deleteConfirm.id)); showToast("Customer removed"); }
    } catch(e) { showToast(e.message); }
    finally { setDeleteConfirm(null); }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      const updated = await api.updateOrderStatus(orderId, status);
      setOrders(o=>o.map(x=>x._id===orderId?updated:x));
      setOrderModal(m=>m?{...m,status}:m);
      showToast("Status updated");
    } catch(e) { showToast(e.message); }
  };

  const TABS = [{id:"overview",icon:"📊",label:"Overview"},{id:"products",icon:"🛍️",label:"Products"},{id:"orders",icon:"📦",label:"Orders"},{id:"customers",icon:"👤",label:"Customers"}];

  const visibleProducts = products.filter(p=>(productCat==="All"||p.category===productCat)&&p.name.toLowerCase().includes(productSearch.toLowerCase()));

  return (
    <div style={{ ...appStyle, display:"flex", minHeight:"100vh" }}>
      <FontLink />
      {/* Sidebar */}
      <div style={{ width:220, background:T.charcoal, display:"flex", flexDirection:"column", flexShrink:0, position:"sticky", top:0, height:"100vh" }}>
        <div style={{ padding:"28px 24px 20px" }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:600, color:T.roseLight, margin:0 }}>Petal & Bow</p>
          <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:4, letterSpacing:"0.15em", textTransform:"uppercase" }}>Admin Panel</p>
        </div>
        <div style={{ flex:1, padding:"8px 12px" }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:10, border:"none", cursor:"pointer", background:tab===t.id?"rgba(201,133,122,0.2)":"transparent", color:tab===t.id?T.roseLight:"rgba(255,255,255,0.5)", fontSize:13, fontFamily:"'Jost',sans-serif", fontWeight:tab===t.id?500:400, textAlign:"left", marginBottom:2, transition:"all 0.15s" }}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
        <div style={{ padding:"16px 12px 24px" }}>
          <Btn onClick={onGoStore} variant="ghost" style={{ width:"100%", color:"rgba(255,255,255,0.45)", borderColor:"rgba(255,255,255,0.15)", fontSize:12 }}>← Visit Store</Btn>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, overflowY:"auto" }}>
        <div style={{ background:T.white, borderBottom:`1px solid ${T.border}`, padding:"0 32px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10 }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:500, margin:0, color:T.charcoal, textTransform:"capitalize" }}>{tab}</h2>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            {lowStock>0&&<span style={{ background:"#FDF3E0",color:"#8A5B1A",fontSize:11,fontWeight:500,padding:"4px 12px",borderRadius:20 }}>⚠ {lowStock} Low Stock</span>}
            <button onClick={loadAll} style={{ background:"none",border:`1px solid ${T.border}`,borderRadius:8,padding:"6px 14px",cursor:"pointer",fontSize:12,fontFamily:"'Jost',sans-serif",color:T.muted }}>↻ Refresh</button>
            <div style={{ width:32,height:32,borderRadius:"50%",background:T.roseLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14 }}>👩</div>
          </div>
        </div>

        <div style={{ padding:32 }}>
          {loading ? <Spinner /> : (<>

          {/* OVERVIEW */}
          {tab==="overview" && (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:32 }}>
                {[
                  {label:"Total Revenue",value:`₹${totalRevenue.toLocaleString()}`,sub:`${orders.length} orders`,icon:"💰"},
                  {label:"Products",value:products.length,sub:`${lowStock} low stock`,icon:"🛍️"},
                  {label:"Customers",value:customers.length,sub:"registered",icon:"👥"},
                  {label:"Avg. Order",value:`₹${avgOrder.toLocaleString()}`,sub:"per transaction",icon:"📈"},
                ].map(s=>(
                  <div key={s.label} style={{ background:T.white,border:`1px solid ${T.border}`,borderRadius:14,padding:"20px 22px" }}>
                    <div style={{ fontSize:28,marginBottom:10 }}>{s.icon}</div>
                    <p style={{ fontSize:11,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",margin:"0 0 6px",fontWeight:500 }}>{s.label}</p>
                    <p style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:500,margin:"0 0 4px",color:T.charcoal }}>{s.value}</p>
                    <p style={{ fontSize:11,color:T.muted,margin:0 }}>{s.sub}</p>
                  </div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:24 }}>
                <div style={{ background:T.white,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden" }}>
                  <div style={{ padding:"18px 22px 14px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                    <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:500,margin:0 }}>Recent Orders</h3>
                    <button onClick={()=>setTab("orders")} style={{ fontSize:11,color:T.rose,background:"none",border:"none",cursor:"pointer",fontFamily:"'Jost',sans-serif" }}>View all →</button>
                  </div>
                  {orders.slice(0,5).map(o=>(
                    <div key={o._id} style={{ padding:"14px 22px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                      <div>
                        <p style={{ fontWeight:500,fontSize:13,margin:"0 0 3px" }}>{o.customer}</p>
                        <p style={{ fontSize:11,color:T.muted,margin:0 }}>{o.orderId} · {new Date(o.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <p style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:500,margin:"0 0 4px" }}>₹{o.total}</p>
                        <Badge status={o.status} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ background:T.white,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden" }}>
                  <div style={{ padding:"18px 22px 14px",borderBottom:`1px solid ${T.border}` }}>
                    <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:500,margin:0 }}>Top Products</h3>
                  </div>
                  {[...products].sort((a,b)=>b.sales-a.sales).slice(0,6).map(p=>(
                    <div key={p._id} style={{ padding:"12px 22px",borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",gap:12 }}>
                      <div style={{ width:32, height:32, borderRadius:8, overflow:"hidden", flexShrink:0, position:"relative", background:`linear-gradient(135deg,${T.roseLight},${T.goldLight})` }}>
                        <ProductImg src={p.image} alt={p.name} category={p.category} />
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:13,fontWeight:500,margin:"0 0 4px" }}>{p.name}</p>
                        <div style={{ background:T.border,borderRadius:4,height:4 }}>
                          <div style={{ background:T.rose,borderRadius:4,height:4,width:`${Math.min(100,p.sales/1.6)}%` }} />
                        </div>
                      </div>
                      <span style={{ fontSize:12,color:T.muted,fontWeight:500 }}>{p.sales}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS */}
          {tab==="products" && (
            <div>
              <div style={{ display:"flex",gap:12,marginBottom:24,justifyContent:"space-between",alignItems:"center" }}>
                <div style={{ display:"flex",gap:10 }}>
                  <Input value={productSearch} onChange={e=>setProductSearch(e.target.value)} placeholder="Search products…" style={{ width:220 }} />
                  <Select value={productCat} onChange={e=>setProductCat(e.target.value)} style={{ width:150 }}>
                    {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                  </Select>
                </div>
                <Btn onClick={openAdd}>+ Add Product</Btn>
              </div>
              <div style={{ background:T.white,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden" }}>
                <table style={{ width:"100%",borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:T.rosePale }}>
                      {["Product","Category","Price","Stock","Sales","Actions"].map(h=>(
                        <th key={h} style={{ padding:"12px 18px",textAlign:"left",fontSize:11,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:500,borderBottom:`1px solid ${T.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleProducts.map(p=>(
                      <tr key={p._id} style={{ borderBottom:`1px solid ${T.border}` }} onMouseEnter={e=>e.currentTarget.style.background=T.rosePale} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"14px 18px" }}>
                          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
                            <div style={{ width:40, height:40, borderRadius:8, overflow:"hidden", flexShrink:0, position:"relative", background:`linear-gradient(135deg,${T.roseLight},${T.goldLight})` }}>
                              <ProductImg src={p.image} alt={p.name} category={p.category} />
                            </div>
                            <div>
                              <p style={{ fontWeight:500,fontSize:13,margin:0 }}>{p.name}</p>
                              <p style={{ fontSize:11,color:T.muted,margin:"2px 0 0" }}>{p.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding:"14px 18px",fontSize:12,color:T.muted }}>{p.category}</td>
                        <td style={{ padding:"14px 18px",fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:500 }}>₹{p.price}</td>
                        <td style={{ padding:"14px 18px" }}><span style={{ fontSize:13,fontWeight:500,color:p.stock<=10?T.danger:p.stock<=20?"#8A5B1A":T.success }}>{p.stock}</span></td>
                        <td style={{ padding:"14px 18px",fontSize:13 }}>{p.sales}</td>
                        <td style={{ padding:"14px 18px" }}>
                          <div style={{ display:"flex",gap:6 }}>
                            <Btn small variant="outline" onClick={()=>openEdit(p)}>Edit</Btn>
                            <Btn small variant="ghost" onClick={()=>setDeleteConfirm({type:"product",id:p._id,name:p.name})}>Del</Btn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {tab==="orders" && (
            <div>
              <div style={{ display:"flex",gap:12,marginBottom:24,justifyContent:"space-between",alignItems:"center" }}>
                <div style={{ display:"flex",gap:10 }}>
                  <Input value={orderSearch} onChange={e=>setOrderSearch(e.target.value)} placeholder="Search orders…" style={{ width:220 }} />
                  <Select value={orderFilter} onChange={e=>setOrderFilter(e.target.value)} style={{ width:150 }}>
                    {["All","Pending","Processing","Shipped","Delivered","Cancelled"].map(s=><option key={s} value={s}>{s}</option>)}
                  </Select>
                </div>
                <span style={{ fontSize:12,color:T.muted }}>{orders.length} orders</span>
              </div>
              <div style={{ background:T.white,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden" }}>
                <table style={{ width:"100%",borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:T.rosePale }}>
                      {["Order ID","Customer","Date","Items","Total","Status","Actions"].map(h=>(
                        <th key={h} style={{ padding:"12px 18px",textAlign:"left",fontSize:11,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:500,borderBottom:`1px solid ${T.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o=>(
                      <tr key={o._id} style={{ borderBottom:`1px solid ${T.border}` }} onMouseEnter={e=>e.currentTarget.style.background=T.rosePale} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <td style={{ padding:"14px 18px",fontWeight:500,fontSize:12,color:T.rose }}>{o.orderId}</td>
                        <td style={{ padding:"14px 18px" }}>
                          <p style={{ fontWeight:500,fontSize:13,margin:0 }}>{o.customer}</p>
                          <p style={{ fontSize:11,color:T.muted,margin:"2px 0 0" }}>{o.email}</p>
                        </td>
                        <td style={{ padding:"14px 18px",fontSize:12,color:T.muted }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding:"14px 18px",fontSize:13 }}>{o.items.reduce((s,i)=>s+i.qty,0)}</td>
                        <td style={{ padding:"14px 18px",fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:500 }}>₹{o.total}</td>
                        <td style={{ padding:"14px 18px" }}><Badge status={o.status} /></td>
                        <td style={{ padding:"14px 18px" }}>
                          <div style={{ display:"flex",gap:6 }}>
                            <Btn small variant="outline" onClick={()=>setOrderModal(o)}>View</Btn>
                            <Btn small variant="ghost" onClick={()=>setDeleteConfirm({type:"order",id:o._id,name:o.orderId})}>Del</Btn>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CUSTOMERS */}
          {tab==="customers" && (
            <div style={{ background:T.white,border:`1px solid ${T.border}`,borderRadius:14,overflow:"hidden" }}>
              <table style={{ width:"100%",borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ background:T.rosePale }}>
                    {["Customer","Email","City","Joined","Orders","Total Spent","Actions"].map(h=>(
                      <th key={h} style={{ padding:"12px 18px",textAlign:"left",fontSize:11,color:T.muted,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:500,borderBottom:`1px solid ${T.border}` }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {customers.map(c=>(
                    <tr key={c._id} style={{ borderBottom:`1px solid ${T.border}` }} onMouseEnter={e=>e.currentTarget.style.background=T.rosePale} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <td style={{ padding:"14px 18px" }}>
                        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                          <div style={{ width:32,height:32,borderRadius:"50%",background:T.roseLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:T.rose,fontWeight:600,flexShrink:0 }}>{c.name.split(" ").map(n=>n[0]).join("")}</div>
                          <span style={{ fontWeight:500,fontSize:13 }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ padding:"14px 18px",fontSize:12,color:T.muted }}>{c.email}</td>
                      <td style={{ padding:"14px 18px",fontSize:12 }}>{c.city}</td>
                      <td style={{ padding:"14px 18px",fontSize:12,color:T.muted }}>{c.joined}</td>
                      <td style={{ padding:"14px 18px",fontSize:13,textAlign:"center" }}>{c.totalOrders}</td>
                      <td style={{ padding:"14px 18px",fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:500,color:T.rose }}>₹{c.totalSpent.toLocaleString()}</td>
                      <td style={{ padding:"14px 18px" }}>
                        <div style={{ display:"flex",gap:6 }}>
                          <Btn small variant="outline" onClick={()=>setCustomerModal(c)}>View</Btn>
                          <Btn small variant="ghost" onClick={()=>setDeleteConfirm({type:"customer",id:c._id,name:c.name})}>Del</Btn>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </>)}
        </div>
      </div>

      {/* MODALS */}
      <Modal open={productModal!==null} onClose={()=>setProductModal(null)} title={productModal==="add"?"Add New Product":"Edit Product"}>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:T.muted,display:"block",marginBottom:6 }}>Product Name</label>
            <Input value={formData.name||""} onChange={e=>setFormData(f=>({...f,name:e.target.value}))} placeholder="e.g. Pearl Scrunchie" />
          </div>
          {[{key:"sku",label:"SKU",ph:"HA-001"},{key:"price",label:"Price (₹)",ph:"299"},{key:"stock",label:"Stock",ph:"50"}].map(f=>(
            <div key={f.key}>
              <label style={{ fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:T.muted,display:"block",marginBottom:6 }}>{f.label}</label>
              <Input value={formData[f.key]||""} onChange={e=>setFormData(d=>({...d,[f.key]:e.target.value}))} placeholder={f.ph} />
            </div>
          ))}
          <div>
            <label style={{ fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:T.muted,display:"block",marginBottom:6 }}>Category</label>
            <Select value={formData.category||"Hair"} onChange={e=>setFormData(d=>({...d,category:e.target.value}))} style={{ width:"100%" }}>
              {CATEGORIES.filter(c=>c!=="All").map(c=><option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:T.muted,display:"block",marginBottom:6 }}>Image filename (no extension)</label>
            <Input value={formData.imageKey||""} onChange={e=>setFormData(d=>({...d,imageKey:e.target.value}))} placeholder="e.g. hair1 or ring3" />
            <p style={{ fontSize:11,color:T.muted,marginTop:4 }}>File must be in client/src/assets/ e.g. hair1.jpg</p>
          </div>
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:T.muted,display:"block",marginBottom:6 }}>Description</label>
            <textarea value={formData.description||""} onChange={e=>setFormData(d=>({...d,description:e.target.value}))} rows={3}
              style={{ width:"100%",padding:"9px 14px",border:`1px solid ${T.border}`,borderRadius:8,fontSize:13,fontFamily:"'Jost',sans-serif",color:T.charcoal,resize:"vertical",boxSizing:"border-box" }} />
          </div>
        </div>
        <div style={{ display:"flex",gap:10,marginTop:24,justifyContent:"flex-end" }}>
          <Btn variant="ghost" onClick={()=>setProductModal(null)}>Cancel</Btn>
          <Btn onClick={saveProduct} disabled={saving}>{saving?"Saving…":productModal==="add"?"Add Product":"Save Changes"}</Btn>
        </div>
      </Modal>

      <Modal open={!!orderModal} onClose={()=>setOrderModal(null)} title={`Order ${orderModal?.orderId}`}>
        {orderModal&&(
          <div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20 }}>
              {[["Customer",orderModal.customer],["Email",orderModal.email],["Date",new Date(orderModal.createdAt).toLocaleDateString()],["Total","₹"+orderModal.total]].map(([k,v])=>(
                <div key={k} style={{ padding:"10px 14px",background:T.rosePale,borderRadius:8 }}>
                  <p style={{ fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",margin:"0 0 4px" }}>{k}</p>
                  <p style={{ fontSize:14,fontWeight:500,margin:0 }}>{v}</p>
                </div>
              ))}
            </div>
            <label style={{ fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",color:T.muted,display:"block",marginBottom:8 }}>Update Status</label>
            <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
              {["Pending","Processing","Shipped","Delivered","Cancelled"].map(s=>(
                <button key={s} onClick={()=>handleStatusChange(orderModal._id,s)} style={{ padding:"6px 14px",borderRadius:20,border:`1.5px solid ${orderModal.status===s?T.rose:T.border}`,background:orderModal.status===s?T.roseLight:T.white,color:orderModal.status===s?T.rose:T.muted,fontSize:12,cursor:"pointer",fontFamily:"'Jost',sans-serif",fontWeight:orderModal.status===s?500:400 }}>{s}</button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!customerModal} onClose={()=>setCustomerModal(null)} title="Customer Details">
        {customerModal&&(
          <div>
            <div style={{ display:"flex",alignItems:"center",gap:16,marginBottom:24,padding:20,background:T.rosePale,borderRadius:12 }}>
              <div style={{ width:52,height:52,borderRadius:"50%",background:T.roseLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:T.rose,fontWeight:600 }}>{customerModal.name.split(" ").map(n=>n[0]).join("")}</div>
              <div>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:500,margin:0 }}>{customerModal.name}</h3>
                <p style={{ fontSize:12,color:T.muted,margin:"4px 0 0" }}>{customerModal.email}</p>
              </div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10 }}>
              {[["Phone",customerModal.phone],["City",customerModal.city],["Joined",customerModal.joined],["Orders",customerModal.totalOrders],["Total Spent","₹"+customerModal.totalSpent.toLocaleString()]].map(([k,v])=>(
                <div key={k} style={{ padding:"10px 14px",background:T.cream,borderRadius:8,border:`1px solid ${T.border}` }}>
                  <p style={{ fontSize:10,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",margin:"0 0 4px" }}>{k}</p>
                  <p style={{ fontSize:14,fontWeight:500,margin:0 }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!deleteConfirm} onClose={()=>setDeleteConfirm(null)} title="Confirm Delete">
        {deleteConfirm&&(
          <div>
            <p style={{ fontSize:14,color:T.muted,marginBottom:28,lineHeight:1.7 }}>Delete <strong style={{ color:T.charcoal }}>{deleteConfirm.name}</strong>? This cannot be undone.</p>
            <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
              <Btn variant="ghost" onClick={()=>setDeleteConfirm(null)}>Cancel</Btn>
              <Btn variant="danger" onClick={handleDeleteConfirmed}>Delete</Btn>
            </div>
          </div>
        )}
      </Modal>

      <Toast msg={toast} onClose={()=>setToast("")} />
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("store");
  return view==="admin"
    ? <AdminDashboard onGoStore={()=>setView("store")} />
    : <StoreFront     onGoAdmin={()=>setView("admin")} />;
}