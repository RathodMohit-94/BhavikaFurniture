import React, { useEffect, useMemo, useState } from 'react';
import { Button, Progress, Spin, Tag } from 'antd';
import {
  AlertTriangle,
  ArrowRight,
  BadgePercent,
  Boxes,
  CircleDollarSign,
  Clock3,
  Package,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  UserRound,
} from 'lucide-react';
import axios from 'axios';

interface AdminOverviewProps {
  onNavigate: (entity: string) => void;
}

export default function AdminOverview({ onNavigate }: AdminOverviewProps) {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:3000/api/admin/data/orders'),
      axios.get('http://localhost:3000/api/admin/data/products'),
      axios.get('http://localhost:3000/api/admin/data/customers'),
      axios.get('http://localhost:3000/api/admin/data/coupons'),
      axios.get('http://localhost:3000/api/admin/data/activity_log'),
    ])
      .then(([ordersRes, productsRes, customersRes, couponsRes, activityRes]) => {
        setOrders(ordersRes.data.data);
        setProducts(productsRes.data.data);
        setCustomers(customersRes.data.data);
        setCoupons(couponsRes.data.data);
        setActivity(activityRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const revenue = useMemo(() => orders
    .filter(order => order.payment_status === 'Paid')
    .reduce((sum, order) => sum + Number(order.total || 0), 0), [orders]);
  const lowStock = products.filter(product => Number(product.stock || 0) <= 5);
  const pendingOrders = orders.filter(order => !['Completed', 'Cancelled'].includes(order.status));
  const activeCoupons = coupons.filter(coupon => coupon.active === true || coupon.active === 'true');

  if (loading) {
    return <div className="grid min-h-[500px] place-items-center rounded-[28px] bg-white"><Spin size="large" /></div>;
  }

  const metrics = [
    { label: 'Paid revenue', value: `₹${revenue.toLocaleString()}`, note: 'Across recorded orders', icon: CircleDollarSign, color: 'bg-[#e5f8ec] text-[#16864a]' },
    { label: 'Open orders', value: pendingOrders.length, note: 'Need fulfilment attention', icon: ShoppingBag, color: 'bg-[var(--lavender)] text-[var(--violet)]' },
    { label: 'Customers', value: customers.length, note: 'In your customer directory', icon: UserRound, color: 'bg-[#e2f5ff] text-[#1671a3]' },
    { label: 'Low stock', value: lowStock.length, note: 'Products at 5 units or less', icon: AlertTriangle, color: lowStock.length ? 'bg-[#fff1dc] text-[#b66b00]' : 'bg-[#e5f8ec] text-[#16864a]' },
  ];

  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(metric => {
          const Icon = metric.icon;
          return (
            <article className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm" key={metric.label}>
              <div className="flex items-start justify-between">
                <span className={`grid h-11 w-11 place-items-center rounded-[15px] ${metric.color}`}><Icon size={21} /></span>
                <TrendingUp size={17} className="text-[#31a36b]" />
              </div>
              <p className="brand-display mt-5 text-3xl font-extrabold">{metric.value}</p>
              <p className="mt-1 text-sm font-bold">{metric.label}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{metric.note}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <div className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-5 md:px-7">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--violet)]">Keep things moving</p>
              <h2 className="brand-display mt-1 text-2xl font-extrabold">Recent orders</h2>
            </div>
            <Button onClick={() => onNavigate('orders')} className="!rounded-full">View all <ArrowRight size={15} /></Button>
          </div>
          <div className="divide-y divide-[var(--line)]">
            {orders.slice(0, 5).map(order => (
              <button onClick={() => onNavigate('orders')} className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#faf8ff] md:px-7" key={order.id}>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[var(--lavender)] text-[var(--violet)]"><Package size={19} /></span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <strong className="text-sm">{order.order_number}</strong>
                    <Tag color={order.status === 'Completed' ? 'success' : order.status === 'Cancelled' ? 'error' : 'processing'} className="!m-0 !rounded-full">{order.status}</Tag>
                  </span>
                  <span className="mt-1 block truncate text-xs text-[var(--muted)]">{order.customer_name} · {order.customer_email}</span>
                </span>
                <strong className="text-sm">₹{Number(order.total || 0).toLocaleString()}</strong>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] bg-[var(--ink)] p-6 text-white shadow-sm md:p-7">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--citrus)]">Store health</p>
              <h2 className="brand-display mt-1 text-2xl font-extrabold">Looking good.</h2>
            </div>
            <Sparkles className="text-[var(--citrus)]" />
          </div>
          <div className="mt-7 space-y-6">
            <div>
              <div className="mb-2 flex justify-between text-xs font-bold"><span>Catalog readiness</span><span>{products.length ? Math.round(products.filter(product => product.images?.length && product.price).length / products.length * 100) : 0}%</span></div>
              <Progress percent={products.length ? Math.round(products.filter(product => product.images?.length && product.price).length / products.length * 100) : 0} showInfo={false} strokeColor="#dfff5b" trailColor="rgba(255,255,255,.12)" />
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs font-bold"><span>Order completion</span><span>{orders.length ? Math.round(orders.filter(order => order.status === 'Completed').length / orders.length * 100) : 0}%</span></div>
              <Progress percent={orders.length ? Math.round(orders.filter(order => order.status === 'Completed').length / orders.length * 100) : 0} showInfo={false} strokeColor="#ff5c4d" trailColor="rgba(255,255,255,.12)" />
            </div>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <button onClick={() => onNavigate('coupons')} className="rounded-2xl bg-white/8 p-4 text-left transition hover:bg-white/14">
              <BadgePercent size={20} className="text-[var(--citrus)]" />
              <strong className="mt-4 block text-xl">{activeCoupons.length}</strong>
              <span className="text-xs text-white/50">Active offers</span>
            </button>
            <button onClick={() => onNavigate('products')} className="rounded-2xl bg-white/8 p-4 text-left transition hover:bg-white/14">
              <Boxes size={20} className="text-[var(--coral)]" />
              <strong className="mt-4 block text-xl">{products.length}</strong>
              <span className="text-xs text-white/50">Products</span>
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-[28px] border border-[var(--line)] bg-white p-5 shadow-sm md:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--coral)]">Inventory watch</p>
              <h2 className="brand-display mt-1 text-xl font-extrabold">Low-stock products</h2>
            </div>
            <button onClick={() => onNavigate('products')} className="text-xs font-bold text-[var(--violet)]">Manage stock</button>
          </div>
          {lowStock.length ? (
            <div className="space-y-3">
              {lowStock.slice(0, 5).map(product => (
                <div className="flex items-center gap-3 rounded-2xl bg-[#fff9ef] p-3" key={product.id}>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#fff1dc] text-[#b66b00]"><AlertTriangle size={17} /></span>
                  <span className="min-w-0 flex-1"><strong className="block truncate text-sm">{product.title}</strong><span className="text-xs text-[var(--muted)]">{product.sku}</span></span>
                  <strong className="text-sm text-[#a65d00]">{product.stock || 0} left</strong>
                </div>
              ))}
            </div>
          ) : <p className="rounded-2xl bg-[#effbf3] p-5 text-sm font-semibold text-[#16864a]">Everything is comfortably stocked.</p>}
        </div>

        <div className="rounded-[28px] border border-[var(--line)] bg-white p-5 shadow-sm md:p-7">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--violet)]">Accountability</p>
              <h2 className="brand-display mt-1 text-xl font-extrabold">Latest activity</h2>
            </div>
            <button onClick={() => onNavigate('activity_log')} className="text-xs font-bold text-[var(--violet)]">Full history</button>
          </div>
          <div className="space-y-4">
            {activity.slice(0, 5).map(entry => (
              <div className="flex gap-3" key={entry.id}>
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--lavender)] text-[var(--violet)]"><Clock3 size={14} /></span>
                <div className="min-w-0">
                  <p className="truncate text-sm"><strong>{entry.user}</strong> {String(entry.action).toLowerCase()} <strong>{entry.item}</strong></p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-[var(--muted)]">{entry.entity} · {new Date(entry.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
