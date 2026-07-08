import React from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 bg-[var(--ink)]/40 backdrop-blur-sm transition-opacity" 
        onClick={closeCart}
      />
      
      <div className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-[var(--line)] p-5">
          <h2 className="brand-display flex items-center gap-2 text-2xl font-extrabold text-[var(--ink)]">
            <ShoppingBag size={24} className="text-[var(--violet)]" />
            Your Cart
          </h2>
          <button onClick={closeCart} className="grid h-10 w-10 place-items-center rounded-full bg-black/5 transition hover:bg-[var(--coral)] hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 grid h-20 w-20 place-items-center rounded-full bg-[var(--lavender)] text-[var(--violet)]">
                <ShoppingBag size={32} />
              </div>
              <p className="text-lg font-bold text-[var(--ink)]">Your cart is empty</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Looks like you haven't added any furniture to your cart yet.</p>
              <button onClick={closeCart} className="mt-6 rounded-xl bg-[var(--ink)] px-6 py-3 font-bold text-white transition hover:bg-[var(--violet)]">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-[var(--ink)]">{item.title}</h3>
                      <p className="font-semibold text-[var(--coral)]">₹{item.price}</p>
                    </div>
                    
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-white p-1">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="grid h-7 w-7 place-items-center rounded bg-black/5 hover:bg-black/10"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="grid h-7 w-7 place-items-center rounded bg-black/5 hover:bg-black/10"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-[var(--muted)] transition hover:text-[var(--coral)]"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-[var(--line)] bg-[#f4f1fb] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-[var(--muted)]">Subtotal</span>
              <span className="text-xl font-extrabold text-[var(--ink)]">₹{totalPrice}</span>
            </div>
            <p className="mb-4 text-xs text-[var(--muted)]">Shipping and taxes calculated at checkout.</p>
            <button 
              onClick={() => {
                const productInfo = items.map(item => `${item.quantity}x ${item.title} (₹${item.price})`).join('\n');
                const message = encodeURIComponent(`Hi, I would like to purchase the following items:\n\n${productInfo}\n\nTotal: ₹${totalPrice}`);
                closeCart();
                window.location.href = `/contact?message=${message}`;
              }}
              className="w-full rounded-2xl bg-[var(--coral)] py-4 font-bold text-white transition hover:bg-[var(--violet)] hover:shadow-lg hover:shadow-[var(--violet)]/30"
            >
              Checkout Now
            </button>
          </div>
        )}
      </div>
    </>
  );
}
