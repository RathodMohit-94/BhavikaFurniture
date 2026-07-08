import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { CartProvider } from './context/CartContext';
import {
  ArrowLeft,
  ArrowUpRight,
  BadgePercent,
  BarChart3,
  Boxes,
  ChevronRight,
  CircleHelp,
  Contact,
  GalleryHorizontalEnd,
  Globe2,
  Home,
  Images,
  LayoutDashboard,
  Mail,
  MapPin,
  Menu as MenuIcon,
  MessageSquareQuote,
  Package,
  Phone,
  ScrollText,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  UserRound,
  Users,
  X,
} from 'lucide-react';

// Public Pages
const PublicLayout = lazy(() => import('./modules/public/PublicLayout'));
const HomePage = lazy(() => import('./modules/public/HomePage'));
const CategoryPage = lazy(() => import('./modules/public/CategoryPage'));
const AboutPage = lazy(() => import('./modules/public/AboutPage'));
const ContactPage = lazy(() => import('./modules/public/ContactPage'));

// Admin Pages
const AdminDashboard = lazy(() => import('./modules/admin/AdminDashboard'));
const AdminOverview = lazy(() => import('./modules/admin/AdminOverview'));

const adminGroups = [
  {
    label: 'Business',
    items: [
      { key: 'overview', label: 'Overview', description: 'Store health at a glance', icon: BarChart3 },
      { key: 'orders', label: 'Orders', description: 'Payments and fulfilment', icon: ShoppingBag },
      { key: 'customers', label: 'Customers', description: 'Profiles and purchase history', icon: UserRound },
    ],
  },
  {
    label: 'Website',
    items: [
      { key: 'home_page', label: 'Home hero', description: 'Main headline and image', icon: Home },
      { key: 'home_features', label: 'Highlights', description: 'Why customers choose you', icon: Sparkles },
      { key: 'home_testimonials', label: 'Testimonials', description: 'Customer love notes', icon: MessageSquareQuote },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { key: 'categories', label: 'Collections', description: 'Organise the shop', icon: Boxes },
      { key: 'products', label: 'Products', description: 'Items, prices and stock', icon: Package },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { key: 'coupons', label: 'Discounts', description: 'Coupons and promotions', icon: BadgePercent },
      { key: 'media', label: 'Media library', description: 'Reusable brand imagery', icon: Images },
      { key: 'seo_settings', label: 'SEO & sharing', description: 'Search and social previews', icon: Globe2 },
    ],
  },
  {
    label: 'About',
    items: [
      { key: 'about_page', label: 'Our story', description: 'Brand story and mission', icon: LayoutDashboard },
      { key: 'about_team', label: 'Team', description: 'The people behind Bhavika Furniture', icon: Users },
      { key: 'about_gallery', label: 'Gallery', description: 'Studio and process imagery', icon: GalleryHorizontalEnd },
    ],
  },
  {
    label: 'Contact',
    items: [
      { key: 'contact_addresses', label: 'Addresses', description: 'Office and postal details', icon: Contact },
      { key: 'contact_phones', label: 'Phone numbers', description: 'Sales and support lines', icon: Phone },
      { key: 'contact_emails', label: 'Email addresses', description: 'Customer contact inboxes', icon: Mail },
      { key: 'contact_locations', label: 'Store locations', description: 'Physical stores', icon: MapPin },
    ],
  },
  {
    label: 'Administration',
    items: [
      { key: 'shipping_settings', label: 'Shipping', description: 'Rates, zones and delivery', icon: Truck },
      { key: 'admin_users', label: 'Team access', description: 'Roles and permissions', icon: ShieldCheck },
      { key: 'activity_log', label: 'Activity history', description: 'A record of every change', icon: ScrollText },
    ],
  },
];

const allAdminItems = adminGroups.flatMap(group => group.items);

function AdminLayout() {
  const navigate = useNavigate();
  const [selectedEntity, setSelectedEntity] = useState('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('admin_auth') === 'true');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const activeItem = allAdminItems.find(item => item.key === selectedEntity) || allAdminItems[0];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Mohit942') {
      localStorage.setItem('admin_auth', 'true');
      setIsAuthenticated(true);
    } else {
      setError('Incorrect password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f4f1fb] font-sans">
        <form onSubmit={handleLogin} className="flex w-full max-w-sm flex-col gap-5 rounded-[24px] bg-white p-8 shadow-[0_20px_60px_rgba(41,30,87,0.08)]">
          <div className="text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-[18px] bg-gradient-to-br from-[var(--violet)] to-[var(--coral)] shadow-lg">
              <Store size={28} className="text-white" />
            </div>
            <h2 className="brand-display text-2xl font-extrabold text-[var(--ink)]">Admin Access</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Please enter the master password</p>
          </div>
          
          {error && <div className="rounded-xl bg-red-50 p-3 text-center text-sm font-semibold text-red-600">{error}</div>}
          
          <div className="flex flex-col gap-2">
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-[var(--ink)] focus:border-[var(--violet)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--violet)]/20"
              autoFocus
            />
          </div>
          
          <button type="submit" className="mt-2 rounded-xl bg-[var(--ink)] py-3 font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--violet)]">
            Login to Workspace
          </button>
        </form>
      </div>
    );
  }

  const chooseEntity = (key: string) => {
    setSelectedEntity(key);
    setMobileNavOpen(false);
  };

  return (
    <div className="admin-shell min-h-screen bg-[#f4f1fb] text-[var(--ink)]">
      {mobileNavOpen && <button aria-label="Close navigation" className="fixed inset-0 z-40 bg-[var(--ink)]/45 backdrop-blur-sm lg:hidden" onClick={() => setMobileNavOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[292px] flex-col bg-[var(--ink)] p-4 text-white transition-transform duration-300 lg:translate-x-0 ${mobileNavOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-5 flex items-center justify-between px-2 pt-1">
          <button onClick={() => navigate('/')} className="group flex items-center gap-3 text-left">
            <span className="grid h-12 w-12 place-items-center rounded-[17px] bg-gradient-to-br from-[var(--violet)] to-[var(--coral)] shadow-lg transition group-hover:-rotate-6">
              <Store size={23} />
            </span>
            <span>
              <span className="brand-display block text-xl font-extrabold leading-none">BHAVIKA FURNITURE</span>
              <span className="mt-1.5 block text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--citrus)]">Content studio</span>
            </span>
          </button>
          <button aria-label="Close menu" onClick={() => setMobileNavOpen(false)} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 lg:hidden"><X size={19} /></button>
        </div>

        <nav className="admin-scrollbar flex-1 overflow-y-auto pr-1">
          {adminGroups.map(group => (
            <div className="mb-5" key={group.label}>
              <p className="mb-2 px-3 text-[9px] font-extrabold uppercase tracking-[0.24em] text-white/35">{group.label}</p>
              <div className="space-y-1">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const selected = selectedEntity === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => chooseEntity(item.key)}
                      className={`group flex w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-left transition ${
                        selected ? 'bg-white text-[var(--ink)] shadow-lg' : 'text-white/68 hover:bg-white/8 hover:text-white'
                      }`}
                    >
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-[12px] ${selected ? 'bg-[var(--lavender)] text-[var(--violet)]' : 'bg-white/8'}`}>
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[13px] font-bold leading-tight">{item.label}</span>
                        <span className={`mt-0.5 block truncate text-[10px] ${selected ? 'text-[var(--muted)]' : 'text-white/35'}`}>{item.description}</span>
                      </span>
                      <ChevronRight size={15} className={selected ? 'text-[var(--violet)]' : 'opacity-0 transition group-hover:opacity-60'} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-3 rounded-[20px] border border-white/10 bg-white/[0.06] p-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--citrus)] font-extrabold text-[var(--ink)]">A</span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold">Admin workspace</span>
              <span className="block truncate text-[10px] text-white/40">Changes save instantly</span>
            </span>
            <Settings2 size={16} className="text-white/40" />
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[292px]">
        <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[#f4f1fb]/85 px-4 py-3 backdrop-blur-xl md:px-7">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <button aria-label="Open navigation" onClick={() => setMobileNavOpen(true)} className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[var(--ink)] text-white lg:hidden"><MenuIcon size={20} /></button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Content studio <ChevronRight size={12} /> <span className="truncate text-[var(--violet)]">{activeItem.label}</span>
                </div>
                <h1 className="brand-display mt-1 truncate text-xl font-extrabold md:text-2xl">{activeItem.label}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="hidden h-11 items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-bold text-[var(--muted)] transition hover:border-[var(--violet)] hover:text-[var(--violet)] md:flex">
                <CircleHelp size={17} /> Help
              </button>
              <button onClick={() => navigate('/')} className="flex h-11 items-center gap-2 rounded-full bg-[var(--ink)] px-4 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[var(--violet)] md:px-5">
                <span className="hidden sm:inline">View website</span><ArrowUpRight size={17} />
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-5 md:px-7 md:py-7">
          <div className="mx-auto max-w-[1500px]">
            <div className="mb-5 flex flex-col justify-between gap-3 rounded-[24px] bg-gradient-to-r from-[var(--violet)] to-[#8f75ff] px-5 py-5 text-white shadow-[0_14px_40px_rgba(108,76,255,.2)] sm:flex-row sm:items-center md:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.17em] text-[var(--citrus)]">You’re editing</p>
                <p className="mt-1 text-sm text-white/75">{activeItem.description}. Updates appear on your storefront immediately.</p>
              </div>
              <button onClick={() => navigate('/')} className="flex w-fit items-center gap-2 rounded-full bg-white/14 px-4 py-2.5 text-xs font-bold backdrop-blur transition hover:bg-white hover:text-[var(--violet)]">
                <ArrowLeft size={15} /> Back to storefront
              </button>
            </div>
            {selectedEntity === 'overview' ? (
              <AdminOverview onNavigate={chooseEntity} />
            ) : (
              <AdminDashboard entity={selectedEntity} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6c4cff',
          colorInfo: '#6c4cff',
          colorSuccess: '#31a36b',
          colorWarning: '#f59e0b',
          colorError: '#ff5c4d',
          colorText: '#171329',
          borderRadius: 14,
          fontFamily: "'DM Sans', sans-serif",
        },
        components: {
          Button: { controlHeight: 42, fontWeight: 700 },
          Card: { borderRadiusLG: 22 },
          Table: { headerBg: '#eee9ff', headerColor: '#171329' },
          Menu: { darkItemBg: '#171329', darkItemSelectedBg: '#6c4cff', darkItemHoverBg: '#2b2347', itemBorderRadius: 12 },
        },
      }}
    >
      <CartProvider>
        <BrowserRouter>
          <Suspense fallback={
            <div className="flex h-screen w-screen items-center justify-center bg-[#f4f1fb]">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#6c4cff] border-t-transparent"></div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="category" element={<CategoryPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
              </Route>
              <Route path="/admin" element={<AdminLayout />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CartProvider>
    </ConfigProvider>
  );
}
