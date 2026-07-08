import React, { useEffect, useState } from 'react';
import { ShoppingCart, Armchair, Tag as TagIcon, ArrowRight, LayoutGrid } from 'lucide-react';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import { getStoreCatalog } from '../../services/storefrontApi';
import { optimizeImage } from '../../utils/imageOptimizer';
import { useCart } from '../../context/CartContext';

export default function CategoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const categoryType = searchParams.get('type') || '';
  const { visibility } = useOutletContext<any>();
  const { addToCart } = useCart();

  useEffect(() => {
    getStoreCatalog()
    .then((catalog) => {
      // Filter only active categories and sort by order
      let fetchedCategories = catalog.categories
        .filter((c: any) => c.active === 'true' || c.active === true)
        .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

      setCategories(fetchedCategories);

      // Filter active products that belong to an active category
      let fetchedProducts = catalog.products.filter((p: any) => {
        const isActiveCat = fetchedCategories.some((c: any) => c.slug === p.category);
        const isActiveProduct = p.active === 'true' || p.active === true;
        return isActiveCat && isActiveProduct;
      });

      if (categoryType) {
         fetchedProducts = fetchedProducts.filter((p: any) => p.category === categoryType);
      }
      setProducts(fetchedProducts);
    })
    .catch(err => console.error(err))
    .finally(() => setLoading(false));
  }, [categoryType]);

  const activeCat = categories.find(c => c.slug === categoryType);
  const displayTitle = activeCat ? `${activeCat.name} Collection` : 'All Categories';

  return (
    <div className="min-h-screen bg-[var(--color-warm-bg)] pb-20 font-sans">
      {/* Category Banner */}
      <div className="surface-grid mx-4 mt-4 overflow-hidden rounded-[32px] bg-[var(--lavender)] px-6 py-14 text-center md:mx-8 md:rounded-[42px] md:py-20">
        <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.22em] text-[var(--violet)]">The Bhavika Furniture edit</p>
        <h1 className="brand-display m-0 text-5xl font-extrabold leading-none text-[var(--ink)] md:text-7xl">{displayTitle}</h1>
        <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-7 text-[var(--muted)] md:text-lg">Hand-picked pieces with comfort, colour, and plenty of character.</p>
      </div>

      {/* Category Top Bar Filter */}
      <div className="sticky top-[92px] z-40 mb-12 mt-5 px-4 md:px-8">
        <div className="mx-auto max-w-[1360px] rounded-[24px] border border-white/80 bg-white/90 p-2.5 shadow-[0_14px_42px_rgba(53,39,105,.13)] backdrop-blur-xl">
          <div className="admin-scrollbar flex items-center gap-2 overflow-x-auto">
          <button 
            onClick={() => navigate(`/category`)}
            aria-pressed={categoryType === ''}
            className={`flex shrink-0 items-center gap-2 rounded-[17px] px-4 py-3 text-sm font-bold transition-all duration-300 ${
              categoryType === '' 
                ? 'bg-[var(--ink)] text-white shadow-md' 
                : 'text-[var(--ink)] hover:bg-[var(--lavender)]'
            }`}
          >
            <span className={`grid h-8 w-8 place-items-center rounded-[11px] ${categoryType === '' ? 'bg-white/12 text-[var(--citrus)]' : 'bg-[var(--lavender)] text-[var(--violet)]'}`}>
              <LayoutGrid size={16} />
            </span>
            All collections
          </button>
          {categories.map((cat, index) => (
            <button 
              key={cat.slug}
              onClick={() => navigate(`/category?type=${cat.slug}`)}
              aria-pressed={categoryType === cat.slug}
              className={`flex shrink-0 items-center gap-2 rounded-[17px] px-3 py-2.5 text-sm font-bold transition-all duration-300 ${
                categoryType === cat.slug 
                  ? 'bg-[var(--violet)] text-white shadow-md' 
                  : 'text-[var(--ink)] hover:bg-[var(--lavender)]'
              }`}
            >
              <span className={`h-9 w-9 overflow-hidden rounded-[12px] ${categoryType === cat.slug ? 'ring-2 ring-white/40' : 'bg-[var(--lavender)]'}`}>
                {cat.image ? <img src={optimizeImage(cat.image, 200)} alt="" loading="lazy" className="h-full w-full object-cover" /> : <span className="grid h-full place-items-center text-xs text-[var(--violet)]">0{index + 1}</span>}
              </span>
              {cat.name}
            </button>
          ))}
          </div>
        </div>
      </div>

      <div className="px-6 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[var(--color-terracotta)]"></div>
          </div>
        ) : visibility?.products === false ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Products are currently unavailable</h3>
            <p className="text-gray-500">Please check back later.</p>
          </div>
        ) : categoryType === '' ? (
          // Directory of Categories
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map(cat => (
              <div 
                key={cat.slug} 
                onClick={() => navigate(`/category?type=${cat.slug}`)}
                className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-col sm:flex-row"
              >
                <div className="w-full sm:w-2/5 h-64 sm:h-auto relative overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundImage: `url("${cat.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'}")` }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
                <div className="p-8 w-full sm:w-3/5 flex flex-col justify-center">
                  <h3 className="text-3xl font-extrabold text-[var(--color-dark-wood)] mb-2 group-hover:text-[var(--color-terracotta)] transition-colors">{cat.name}</h3>
                  <div 
                    className="text-gray-600 mb-6 line-clamp-2 prose prose-sm"
                    dangerouslySetInnerHTML={{ __html: cat.description || '<p>Explore our beautiful collection.</p>' }}
                  />
                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-1">Starting at</p>
                      <p className="text-xl font-bold text-[var(--color-dark-wood)]">{cat.starting_price ? `₹${Number(cat.starting_price).toLocaleString()}` : '₹9,999'}</p>
                    </div>
                    <div className="bg-[#FFF8F3] text-[var(--color-terracotta)] p-3 rounded-full group-hover:bg-[var(--color-terracotta)] group-hover:text-white transition-colors duration-300">
                      <ArrowRight size={24} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          // Empty Category Products
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No products found in this category</h3>
            <p className="text-gray-500">Head to the Admin Panel to add some!</p>
          </div>
        ) : (
          // Products Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <div key={product.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="relative h-64 bg-[#E8D3C3] flex items-center justify-center overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img src={optimizeImage(product.images[0], 600)} alt={product.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <Armchair size={64} className="text-white opacity-50" />
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[var(--color-terracotta)] flex items-center gap-1 shadow-sm">
                    <TagIcon size={12} /> {product.category || 'Furniture'}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-[var(--color-dark-wood)] mb-2 line-clamp-2">{product.title}</h3>
                  <div className="text-2xl font-black text-[var(--color-terracotta)] mb-6 mt-auto">
                    {product.sale_price ? (
                      <>
                        <span className="text-gray-400 line-through text-lg mr-2">₹{product.price}</span>
                        ₹{product.sale_price}
                      </>
                    ) : (
                      <>₹{product.price}</>
                    )}
                  </div>
                  
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart(product);
                    }}
                    className="w-full py-3 bg-[var(--color-dark-wood)] text-white font-semibold rounded-xl flex justify-center items-center gap-2 group-hover:bg-[var(--color-terracotta)] transition-colors duration-300"
                  >
                    <ShoppingCart size={18} /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
