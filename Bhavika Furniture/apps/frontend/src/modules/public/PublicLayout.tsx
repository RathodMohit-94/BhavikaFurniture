import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import PageUnavailable from './PageUnavailable';
import { getStoreCatalog, getStoreContent } from '../../services/storefrontApi';
import Topbar from '../../components/common/Topbar';
import Footer from '../../components/common/Footer';
import CartDrawer from '../../components/common/CartDrawer';

export default function PublicLayout() {
  const location = useLocation();
  const [categories, setCategories] = useState<any[]>([]);
  const [visibility, setVisibility] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      getStoreCatalog(),
      getStoreContent('page_visibility')
    ])
      .then(([catsRes, visRes]) => {
        setCategories(catsRes.categories);
        if (visRes.length > 0) setVisibility(visRes[0]);
      })
      .catch(console.error);
  }, []);

  const navItems = [
    { key: '/', label: 'Home', show: visibility?.home_page !== false, pathId: 'home_page' },
    { key: '/category', label: 'Collections', show: visibility?.categories !== false, pathId: 'categories' },
    { key: '/about', label: 'Our story', show: visibility?.about_page !== false, pathId: 'about_page' },
    { key: '/contact', label: 'Say hello', show: visibility?.contact_settings !== false, pathId: 'contact_settings' },
  ];

  const currentPathId = navItems.find(item => {
    if (item.key === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(item.key);
  })?.pathId;

  const isPageActive = !currentPathId || visibility?.[currentPathId] !== false;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-warm-bg)] font-sans text-[var(--ink)]">
      <div className="marquee bg-[var(--ink)] py-2.5 text-xs font-bold uppercase tracking-[0.22em] text-white">
        <div className="marquee-track">
          {[0, 1].map(group => (
            <div className="flex items-center" key={group}>
              {['Designed for real life', 'Free styling advice', 'Made to be loved', 'Fresh forms, happy homes'].map(item => (
                <span className="flex items-center gap-4 px-7" key={`${group}-${item}`}>
                  {item} <Sparkles size={13} className="text-[var(--citrus)]" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Topbar categories={categories} navItems={navItems} />

      <main className="flex-grow">
        {visibility && !isPageActive ? <PageUnavailable /> : <Outlet context={{ visibility }} />}
      </main>

      <Footer navItems={navItems} />
      <CartDrawer />
    </div>
  );
}
