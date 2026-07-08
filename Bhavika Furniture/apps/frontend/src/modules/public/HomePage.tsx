import React, { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowRight, ArrowUpRight, BadgeCheck, Quote, Sparkles, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getStoreCatalog, getStoreContent } from '../../services/storefrontApi';
import { optimizeImage } from '../../utils/imageOptimizer';

export default function HomePage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<any>(null);
  const [features, setFeatures] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getStoreContent('home_page'),
      getStoreContent('home_features'),
      getStoreContent('home_testimonials'),
      getStoreCatalog()
    ])
      .then(([pageRes, featuresRes, testimonialsRes, categoriesRes]) => {
        if (pageRes.length > 0) setSettings(pageRes[0]);
        setFeatures(featuresRes
          .filter((f: any) => f.active === 'true' || f.active === true)
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
        setTestimonials(testimonialsRes.filter((t: any) => t.active === 'true' || t.active === true));
        setCategories(categoriesRes.categories
          .filter((c: any) => c.active === 'true' || c.active === true)
          .sort((a: any, b: any) => (a.order || 0) - (b.order || 0)));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid min-h-[65vh] place-items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-14 w-14 animate-spin rounded-[20px] border-4 border-[var(--lavender)] border-t-[var(--violet)]" />
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Styling your space</p>
        </div>
      </div>
    );
  }

  const heroTitle = settings?.hero_title || 'Furniture for your most colourful life.';
  const heroSubtitle = settings?.hero_subtitle || 'Curated statement pieces, playful forms, and everyday comfort—made to turn your space into somewhere unmistakably yours.';
  const heroImage = optimizeImage(settings?.hero_bg_image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1800&q=85', 1800);
  const ctaText = settings?.hero_cta_text || 'Explore the collection';
  const ctaLink = settings?.hero_cta_link || '/category';

  return (
    <div className="overflow-hidden font-sans">
      <section className="px-4 pb-10 pt-4 md:px-8 md:pb-20 md:pt-6">
        <div className="surface-grid relative mx-auto min-h-[720px] max-w-[1440px] overflow-hidden rounded-[34px] bg-[var(--lavender)] md:min-h-[760px] md:rounded-[46px]">
          <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-[var(--citrus)] blur-[1px]" />
          <div className="absolute -right-28 -top-20 h-96 w-96 rounded-full bg-[var(--sky)]" />
          <div className="absolute bottom-12 right-[38%] hidden h-28 w-28 rotate-12 rounded-[30px] bg-[var(--coral)] xl:block" />

          <div className="relative z-10 grid min-h-[720px] items-center gap-10 px-6 py-12 md:min-h-[760px] md:px-12 lg:grid-cols-[0.92fr_1.08fr] lg:px-16">
            <div className="relative z-10 pt-4 lg:pt-0">
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[var(--ink)]/10 bg-white/75 px-4 py-2 text-xs font-bold uppercase tracking-[0.17em] shadow-sm backdrop-blur">
                <Sparkles size={14} className="text-[var(--violet)]" />
                The joyful living edit
              </div>
              <h1 className="brand-display max-w-[760px] text-[clamp(3.4rem,7vw,7.7rem)] font-extrabold leading-[0.91] text-[var(--ink)]">
                {heroTitle}
              </h1>
              <p className="mt-7 max-w-xl text-base leading-7 text-[var(--muted)] md:text-xl md:leading-8">
                {heroSubtitle}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => navigate(ctaLink)}
                  className="group flex items-center gap-3 rounded-full bg-[var(--ink)] px-7 py-4 font-bold text-white shadow-[0_16px_30px_rgba(23,19,41,0.22)] transition hover:-translate-y-1 hover:bg-[var(--violet)]"
                >
                  {ctaText}
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--citrus)] text-[var(--ink)] transition-transform group-hover:rotate-45">
                    <ArrowUpRight size={17} />
                  </span>
                </button>
                <button onClick={() => navigate('/about')} className="flex items-center gap-2 rounded-full px-5 py-4 font-bold text-[var(--ink)] transition hover:bg-white/60">
                  Meet the makers <ArrowRight size={18} />
                </button>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-bold text-[var(--ink)]">
                <span className="flex items-center gap-2"><BadgeCheck size={18} className="text-[var(--violet)]" /> Thoughtfully curated</span>
                <span className="flex items-center gap-2"><BadgeCheck size={18} className="text-[var(--coral)]" /> Built for real life</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[680px] lg:mx-0">
              <div className="relative ml-auto aspect-[4/4.35] w-[91%] overflow-hidden rounded-[38%_38%_24%_24%/32%_32%_18%_18%] border-[10px] border-white/75 bg-white shadow-[0_36px_90px_rgba(41,30,87,0.24)] md:border-[14px]">
                <img src={heroImage} alt="A colourful, thoughtfully styled living room" className="h-full w-full object-cover transition duration-1000 hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/35 via-transparent to-white/5" />
              </div>
              <div className="float-slow absolute -left-2 top-[16%] rounded-[24px] bg-[var(--citrus)] px-5 py-4 shadow-[var(--shadow)] md:-left-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em]">New season</p>
                <p className="brand-display mt-1 text-xl font-extrabold">Bold comfort</p>
              </div>
              <button
                onClick={() => navigate('/category')}
                className="absolute -bottom-4 right-0 grid h-24 w-24 place-items-center rounded-full border-[6px] border-[var(--lavender)] bg-[var(--coral)] text-center text-xs font-extrabold uppercase leading-tight tracking-wide text-white shadow-xl transition hover:rotate-12 hover:scale-105 md:-right-5 md:h-32 md:w-32"
              >
                Shop<br />the look
              </button>
            </div>
          </div>
          <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)] md:flex">
            Scroll to discover <ArrowDownRight size={16} />
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1360px]">
            <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[var(--coral)]">Pick your mood</p>
                <h2 className="brand-display max-w-3xl text-5xl font-extrabold leading-[0.98] md:text-7xl">
                  Rooms with a little more <span className="text-[var(--violet)]">personality.</span>
                </h2>
              </div>
              <button onClick={() => navigate('/category')} className="flex w-fit items-center gap-2 rounded-full border border-[var(--line)] bg-white px-5 py-3 font-bold transition hover:bg-[var(--citrus)]">
                See all collections <ArrowUpRight size={18} />
              </button>
            </div>

            <div className="grid auto-rows-[260px] grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-12">
              {categories.slice(0, 4).map((cat: any, index: number) => {
                const spans = [
                  'lg:col-span-7 lg:row-span-2',
                  'lg:col-span-5',
                  'lg:col-span-5',
                  'lg:col-span-12'
                ];
                return (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/category?type=${cat.slug}`)}
                    className={`group relative overflow-hidden rounded-[32px] bg-[var(--ink)] text-left shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-[var(--shadow)] ${spans[index]}`}
                  >
                    <img
                      src={optimizeImage(cat.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80', 800)}
                      alt={cat.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)]/85 via-[var(--ink)]/5 to-transparent" />
                    <span className="absolute left-5 top-5 rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.17em] text-[var(--ink)] backdrop-blur">
                      0{index + 1} / Collection
                    </span>
                    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 md:p-8">
                      <div>
                        <h3 className="brand-display text-3xl font-extrabold text-white md:text-4xl">{cat.name}</h3>
                        <p className="mt-2 font-medium text-white/70">From {cat.starting_price ? `₹${Number(cat.starting_price).toLocaleString()}` : '₹9,999'}</p>
                      </div>
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--citrus)] text-[var(--ink)] transition group-hover:rotate-45">
                        <ArrowUpRight size={22} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {features.length > 0 && (
        <section className="px-4 py-16 md:px-8 md:py-24">
          <div className="noise-overlay mx-auto max-w-[1360px] overflow-hidden rounded-[40px] bg-[var(--ink)] px-6 py-14 text-white md:px-12 md:py-20">
            <div className="mb-12 grid gap-6 md:grid-cols-2 md:items-end">
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[var(--citrus)]">Why Bhavika Furniture?</p>
                <h2 className="brand-display text-5xl font-extrabold leading-none md:text-7xl">Good design.<br />Zero stiffness.</h2>
              </div>
              <p className="max-w-md text-lg leading-relaxed text-white/60 md:justify-self-end">
                Beautiful furniture should feel welcoming, work hard, and make you grin every time you walk into the room.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {features.map((feature, index) => {
                const cardColors = ['bg-[var(--violet)]', 'bg-[var(--coral)]', 'bg-[var(--citrus)] text-[var(--ink)]'];
                return (
                  <article key={feature.id} className={`group min-h-[310px] rounded-[30px] p-7 ${cardColors[index % 3]}`}>
                    <div className="mb-16 flex items-start justify-between">
                      {feature.image ? (
                        <img src={optimizeImage(feature.image, 200)} alt="" loading="lazy" className="h-16 w-16 rounded-2xl bg-white/15 object-contain p-2" />
                      ) : (
                        <span className="brand-display text-5xl font-extrabold opacity-35">0{index + 1}</span>
                      )}
                      <ArrowUpRight className="transition-transform group-hover:rotate-45" />
                    </div>
                    <h3 className="brand-display text-2xl font-extrabold">{feature.title}</h3>
                    <div className="mt-3 text-sm leading-6 opacity-75" dangerouslySetInnerHTML={{ __html: feature.description }} />
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="px-4 py-16 md:px-8 md:py-24">
          <div className="mx-auto max-w-[1240px]">
            <div className="mb-12 text-center">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[var(--violet)]">The nice things people say</p>
              <h2 className="brand-display text-5xl font-extrabold md:text-7xl">Love at first sit.</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <article key={testimonial.id} className={`relative rounded-[30px] border border-[var(--line)] p-7 shadow-sm ${index % 2 === 1 ? 'bg-[var(--lavender)] md:-translate-y-5' : 'bg-white'}`}>
                  <Quote size={42} className="mb-8 text-[var(--coral)]" fill="currentColor" />
                  <div className="mb-5 flex gap-1 text-[var(--coral)]">
                    {[1, 2, 3, 4, 5].map(star => <Star size={15} fill="currentColor" key={star} />)}
                  </div>
                  <div className="text-lg font-medium leading-8 text-[var(--ink)]" dangerouslySetInnerHTML={{ __html: testimonial.quote }} />
                  <div className="mt-8 flex items-center gap-3 border-t border-[var(--line)] pt-5">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--ink)] font-extrabold text-white">
                      {testimonial.name?.charAt(0) || 'N'}
                    </div>
                    <div>
                      <p className="font-bold">{testimonial.name}</p>
                      <p className="text-sm text-[var(--muted)]">{testimonial.role || 'Happy customer'}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 py-12 md:px-8 md:py-20">
        <div className="surface-grid mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-8 overflow-hidden rounded-[36px] bg-[var(--citrus)] px-7 py-12 text-center md:flex-row md:px-14 md:py-16 md:text-left">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em]">Your room called</p>
            <h2 className="brand-display max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">It wants something with character.</h2>
          </div>
          <button onClick={() => navigate('/category')} className="group flex shrink-0 items-center gap-3 rounded-full bg-[var(--ink)] px-7 py-4 font-bold text-white transition hover:bg-[var(--violet)]">
            Start exploring <ArrowRight className="transition-transform group-hover:translate-x-1" size={19} />
          </button>
        </div>
      </section>
    </div>
  );
}
