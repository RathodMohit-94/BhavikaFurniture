import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Armchair, Sparkles } from 'lucide-react';

interface NavItem {
  key: string;
  label: string;
  show: boolean;
  pathId: string;
}

interface FooterProps {
  navItems: NavItem[];
}

export default function Footer({ navItems }: FooterProps) {
  const navigate = useNavigate();

  return (
    <footer className="mx-3 mb-3 mt-16 overflow-hidden rounded-[34px] bg-[var(--ink)] text-white md:mx-6 md:mb-6">
      <div className="grid gap-12 px-7 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-14 md:py-16">
        <div>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--citrus)] text-[var(--ink)]"><Armchair size={25} /></span>
            <span className="brand-display text-3xl font-extrabold">BHAVIKA FURNITURE</span>
          </div>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/65">
            Characterful furniture for homes that refuse to blend in.
          </p>
        </div>
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[var(--citrus)]">Explore</p>
          <div className="flex flex-col gap-3 text-white/75">
            {navItems.filter(item => item.show).map(item => <Link className="hover:text-white" to={item.key} key={item.key}>{item.label}</Link>)}
            <button onClick={() => navigate('/admin')} className="w-fit text-left hover:text-white">Admin portal</button>
          </div>
        </div>
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[var(--citrus)]">Keep in touch</p>
          <p className="mb-5 text-white/65">New drops, joyful rooms, zero inbox clutter.</p>
          <div className="flex gap-2">
            <input aria-label="Email address" type="email" placeholder="Your email" className="min-w-0 flex-1 rounded-full border border-white/15 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/40" />
            <button aria-label="Subscribe" className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--coral)]"><ArrowUpRight size={19} /></button>
            <button aria-label="Social media" className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-white/15"><Sparkles size={19} /></button>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-between gap-2 border-t border-white/10 px-7 py-5 text-xs text-white/45 md:flex-row md:px-14">
        <span>© {new Date().getFullYear()} Bhavika Furniture. Made for better living.</span>
        <span>Furniture with a pulse.</span>
      </div>
    </footer>
  );
}
