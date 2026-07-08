import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Armchair, ChevronDown, Menu, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

interface NavItem {
  key: string;
  label: string;
  show: boolean;
  pathId: string;
}

interface TopbarProps {
  categories: any[];
  navItems: NavItem[];
}

export default function Topbar({ categories, navItems }: TopbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const { itemCount, openCart } = useCart();

  useEffect(() => {
    setMobileMenuOpen(false);
    setCollectionsOpen(false);
  }, [location.pathname, location.search]);

  const activeCategories = categories.filter(c => c.active === 'true' || c.active === true);

  return (
    <>
      <header className="sticky top-0 z-50 px-4 py-3 md:px-8">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between rounded-[22px] border border-white/70 bg-white/80 px-4 shadow-[0_12px_42px_rgba(34,23,75,0.12)] backdrop-blur-xl md:px-6">
          <Link to="/" className="group flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[15px] bg-[var(--violet)] text-white transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
              <Armchair size={23} strokeWidth={2.4} />
            </span>
            <span>
              <span className="brand-display block text-xl font-extrabold leading-none">BHAVIKA FURNITURE</span>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--coral)]">Living, reimagined</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.filter(item => item.show).map(item => {
              const isActive = location.pathname === item.key || (item.key !== '/' && location.pathname.startsWith(item.key));
              if (item.key === '/category') {
                return (
                  <div
                    className="relative"
                    key={item.key}
                    onMouseEnter={() => setCollectionsOpen(true)}
                    onMouseLeave={() => setCollectionsOpen(false)}
                  >
                    <button
                      type="button"
                      aria-expanded={collectionsOpen}
                      aria-haspopup="menu"
                      onClick={() => setCollectionsOpen(open => !open)}
                      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all ${
                        isActive ? 'bg-[var(--ink)] text-white' : 'text-[var(--ink)] hover:bg-[var(--lavender)]'
                      }`}
                    >
                      {item.label}
                      <ChevronDown size={15} className={`transition-transform duration-200 ${collectionsOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`absolute left-1/2 top-full w-[560px] -translate-x-1/2 pt-4 transition-all duration-200 ${
                      collectionsOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'
                    }`}>
                      <div role="menu" className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-white p-3 shadow-[var(--shadow)]">
                        <div className="mb-2 flex items-center justify-between rounded-[20px] bg-[var(--ink)] px-5 py-4 text-white">
                          <div>
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--citrus)]">Shop by collection</p>
                            <p className="brand-display mt-1 text-xl font-extrabold">Find your room’s new favourite.</p>
                          </div>
                          <Link to="/category" className="grid h-11 w-11 place-items-center rounded-full bg-[var(--citrus)] text-[var(--ink)] transition hover:rotate-45" aria-label="View all collections">
                            <ArrowUpRight size={19} />
                          </Link>
                        </div>
                        <div className="grid max-h-[360px] grid-cols-2 gap-1 overflow-y-auto">
                          {activeCategories.map((cat, index) => (
                            <Link
                              role="menuitem"
                              key={cat.id}
                              to={`/category?type=${cat.slug}`}
                              className="group flex items-center gap-3 rounded-[18px] p-2.5 transition hover:bg-[var(--lavender)]"
                            >
                              <span className="h-12 w-12 shrink-0 overflow-hidden rounded-[14px] bg-[var(--lavender)]">
                                {cat.image ? <img src={cat.image} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-110" /> : <span className="grid h-full place-items-center font-bold text-[var(--violet)]">0{index + 1}</span>}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-bold text-[var(--ink)]">{cat.name}</span>
                                <span className="mt-0.5 block text-[10px] font-semibold text-[var(--muted)]">From {cat.starting_price ? `₹${Number(cat.starting_price).toLocaleString()}` : '₹9,999'}</span>
                              </span>
                              <ArrowUpRight size={15} className="text-[var(--violet)] opacity-0 transition group-hover:opacity-100" />
                            </Link>
                          ))}
                        </div>
                        <Link to="/category" className="mt-2 flex items-center justify-center gap-2 rounded-[18px] bg-[var(--citrus)] py-3 text-sm font-extrabold text-[var(--ink)]">
                          Browse all collections <ArrowUpRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.key}
                  to={item.key}
                  className={`block rounded-full px-4 py-2 text-sm font-bold transition-all ${
                    isActive ? 'bg-[var(--ink)] text-white' : 'text-[var(--ink)] hover:bg-[var(--lavender)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button 
              aria-label="Shopping bag" 
              onClick={openCart}
              className="relative grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] bg-white transition hover:-translate-y-0.5 hover:border-[var(--violet)] hover:text-[var(--violet)]"
            >
              <ShoppingBag size={20} />
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--coral)] px-1 text-[10px] font-bold text-white">{itemCount}</span>
            </button>
            <button
              onClick={() => navigate('/category')}
              className="hidden items-center gap-2 rounded-full bg-[var(--coral)] px-5 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(255,92,77,0.28)] transition hover:-translate-y-0.5 hover:bg-[var(--violet)] md:flex"
            >
              Shop now <ArrowUpRight size={17} />
            </button>
            <button
              aria-label="Toggle menu"
              className="grid h-11 w-11 place-items-center rounded-full bg-[var(--ink)] text-white lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-x-4 top-[132px] z-40 rounded-[28px] border border-white bg-[var(--ink)] p-5 text-white shadow-2xl lg:hidden">
          <nav className="flex flex-col">
            {navItems.filter(item => item.show).map((item, index) => (
              <React.Fragment key={item.key}>
                <Link to={item.key} className="brand-display flex items-center justify-between border-b border-white/15 py-4 text-2xl font-extrabold">
                  <span><span className="mr-3 text-xs text-[var(--citrus)]">0{index + 1}</span>{item.label}</span>
                  <ArrowUpRight size={20} />
                </Link>
                {item.key === '/category' && activeCategories.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 border-b border-white/15 py-3">
                    {activeCategories.map(cat => (
                      <Link key={cat.id} to={`/category?type=${cat.slug}`} className="truncate rounded-xl bg-white/8 px-3 py-2 text-xs font-bold text-white/70 hover:bg-[var(--citrus)] hover:text-[var(--ink)]">
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
          </nav>
          <button onClick={() => navigate('/category')} className="mt-5 w-full rounded-2xl bg-[var(--citrus)] py-4 font-bold text-[var(--ink)]">
            Explore the collection
          </button>
        </div>
      )}
    </>
  );
}
