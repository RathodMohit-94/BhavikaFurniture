const { AdminSchema, DynamicEntitySchema } = require('@repo/schemas');
const fs = require('fs').promises;
const path = require('path');
const DbState = require('../models/DbState');

// Initialize database if it doesn't exist
async function initDb() {
  try {
    const existing = await DbState.findOne();
    if (!existing) {
      const defaultData = {
        users: [{ id: 1, name: 'Alice', role: 'ADMIN' }],
        products: [
          { id: 1, title: 'Luxury Sofa', sku: 'SOF-001', description: '<p>A beautiful luxury sofa.</p>', price: 999, stock: 10, category: 'living-room', images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80'], active: 'true' },
          { id: 2, title: 'Oak Dining Table', sku: 'DIN-001', description: '<p>Solid oak dining table.</p>', price: 499, stock: 5, category: 'dining', images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'], active: 'true' }
        ],
        categories: [
          { id: 1, name: 'Living Room', slug: 'living-room', description: '<p>Cozy and stylish living room furniture.</p>', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80', starting_price: 14999, order: 1, active: 'true' },
          { id: 2, name: 'Bedroom', slug: 'bedroom', description: '<p>Restful and elegant bedroom pieces.</p>', image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=800&q=80', starting_price: 12499, order: 2, active: 'true' },
          { id: 3, name: 'Dining', slug: 'dining', description: '<p>Beautiful dining sets for every occasion.</p>', image: 'https://images.unsplash.com/photo-1617806118233-18e1c0945594?auto=format&fit=crop&w=800&q=80', starting_price: 22999, order: 3, active: 'true' },
          { id: 4, name: 'Office', slug: 'office', description: '<p>Productive and comfortable office setups.</p>', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80', starting_price: 8999, order: 4, active: 'true' }
        ],
        home_page: [{
          id: 1,
          hero_title: 'Elevate Your Space',
          hero_subtitle: 'Discover the finest selection of premium furniture designed to bring warmth, elegance, and absolute comfort into your home.',
          hero_bg_image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=80',
          hero_cta_text: 'Shop The Collection',
          hero_cta_link: '/category'
        }],
        home_features: [
          { id: 1, title: 'Artisan Quality', description: 'Sourced from the finest materials.', image: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&w=800&q=80', order: 1, active: 'true' },
          { id: 2, title: 'Secure Checkout', description: 'Encrypted and securely processed.', image: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&w=800&q=80', order: 2, active: 'true' },
          { id: 3, title: 'White Glove Delivery', description: 'Quick, safe delivery with assembly.', image: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?auto=format&fit=crop&w=800&q=80', order: 3, active: 'true' }
        ],
        home_testimonials: [
          { id: 1, name: 'Sarah Jenkins', text: 'Absolutely love my new sofa!', rating: 5, image: 'https://randomuser.me/api/portraits/women/44.jpg', active: 'true' }
        ],
        about_page: [{
          id: 1,
          about_title: 'Our Story',
          about_story: '<p>Founded with a passion for exceptional design, Bhavika Furniture has grown to become a leading provider of high-quality furniture.</p><p>Our mission is to bring you beautifully crafted, sustainable furniture that stands the test of time.</p>',
          about_image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80'
        }],
        about_team: [
          { id: 1, name: 'John Doe', role: 'Founder & CEO', bio: '<p>John loves furniture design.</p>', image: 'https://randomuser.me/api/portraits/men/32.jpg', active: 'true' }
        ],
        about_gallery: [
          { id: 1, title: 'Workshop 1', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80' }
        ],
        contact_addresses: [
          { id: 1, street: '123 MG Road', city: 'Mumbai', state: 'MH', zip: '400001', country: 'India', active: 'true' }
        ],
        contact_phones: [
          { id: 1, number: '+91 98765 43210', label: 'Sales & Inquiries', active: 'true' },
          { id: 2, number: '+91 91234 56789', label: 'Customer Support', active: 'true' }
        ],
        contact_emails: [
          { id: 1, email: 'hello@newfur.in', label: 'General Info', active: 'true' }
        ],
        contact_locations: [
          { id: 1, name: 'Mumbai Flagship Store', address: '123 MG Road, Mumbai 400001', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80', active: 'true' }
        ],
        page_visibility: [{
          id: 1,
          home_page: true,
          about_page: true,
          contact_settings: true,
          categories: true,
          products: true
        }]
      };
      await DbState.create({ data: defaultData });
    }
  } catch (err) {
    console.error('Error initializing DB:', err);
  }
}
// We defer running initDb and ensureCommerceData until the mongoose connection is established
// Mongoose caches commands until connected, so this is safe to run.
initDb().then(ensureCommerceData).catch(err => console.error('Error preparing commerce data:', err));

let mutationQueue = Promise.resolve();

async function readDbFile() {
  const state = await DbState.findOne();
  return state ? state.data : {};
}

async function writeDbFile(data) {
  let state = await DbState.findOne();
  if (!state) {
    await DbState.create({ data });
  } else {
    // Explicitly update the data field using findOneAndUpdate to ensure save
    await DbState.findOneAndUpdate({ _id: state._id }, { data }, { new: true });
  }
}

async function readDb() {
  await mutationQueue;
  return readDbFile();
}

async function writeDb(data) {
  const operation = mutationQueue.then(() => writeDbFile(data));
  mutationQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

async function mutateDb(mutator) {
  const operation = mutationQueue.then(async () => {
    const db = await readDbFile();
    const result = await mutator(db);
    await writeDbFile(db);
    return result;
  });
  mutationQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

async function ensureCommerceData() {
  const db = await readDb();
  const now = new Date().toISOString();
  let changed = false;
  const defaults = {
    orders: [
      { id: 1001, order_number: 'NF-1001', customer_name: 'Aarav Shah', customer_email: 'aarav@example.com', total: 1498, status: 'Processing', payment_status: 'Paid', fulfillment_status: 'Preparing', tracking_number: '', created_at: now },
      { id: 1002, order_number: 'NF-1002', customer_name: 'Maya Patel', customer_email: 'maya@example.com', total: 499, status: 'New', payment_status: 'Paid', fulfillment_status: 'Unfulfilled', tracking_number: '', created_at: now }
    ],
    customers: [
      { id: 2001, name: 'Aarav Shah', email: 'aarav@example.com', phone: '+91 98765 43210', total_orders: 3, lifetime_value: 2897, status: 'Active', joined_at: now },
      { id: 2002, name: 'Maya Patel', email: 'maya@example.com', phone: '+91 91234 56789', total_orders: 1, lifetime_value: 499, status: 'Active', joined_at: now }
    ],
    coupons: [
      { id: 3001, code: 'WELCOME10', type: 'Percentage', value: 10, minimum_order: 500, usage_limit: 100, expires_at: '', active: 'true' }
    ],
    media: [],
    seo_settings: [
      { id: 4001, page: 'Home', meta_title: 'Bhavika Furniture — Furniture for colourful living', meta_description: 'Discover characterful furniture, playful forms, and everyday comfort from Bhavika Furniture.', social_image: '', index_status: 'Index' }
    ],
    admin_users: [
      { id: 5001, name: 'Store Owner', email: 'admin@newfur.com', role: 'Owner', status: 'Active', last_active: now }
    ],
    shipping_settings: [
      { id: 6001, zone_name: 'Domestic', countries: 'India', rate: 499, free_shipping_threshold: 2500, estimated_delivery: '5–8 business days', active: 'true' }
    ],
    activity_log: [
      { id: 7001, action: 'Workspace created', entity: 'system', item: 'Bhavika Furniture commerce studio', user: 'Store Owner', timestamp: now }
    ]
  };

  for (const [key, value] of Object.entries(defaults)) {
    if (!Array.isArray(db[key])) {
      db[key] = value;
      changed = true;
    }
  }

  if (Array.isArray(db.products)) {
    const original = JSON.stringify(db.products);
    db.products = db.products.map((product, index) => ({
      sku: product.sku || `NF-${String(index + 1).padStart(3, '0')}`,
      description: product.description || '<p>Add a helpful product description.</p>',
      stock: product.stock ?? 10,
      images: product.images || (product.image ? [product.image] : []),
      active: product.active ?? 'true',
      publish_status: product.publish_status || 'Published',
      publish_at: product.publish_at || '',
      ...product
    }));
    if (JSON.stringify(db.products) !== original) changed = true;
  }

  if (Array.isArray(db.categories)) {
    const original = JSON.stringify(db.categories);
    db.categories = db.categories.map((category, index) => ({
      description: category.description || '<p>Explore this curated furniture collection.</p>',
      image: category.image || '',
      starting_price: category.starting_price || '₹9,999',
      order: category.order ?? index + 1,
      active: category.active ?? 'true',
      publish_status: category.publish_status || 'Published',
      publish_at: category.publish_at || '',
      ...category
    }));
    if (JSON.stringify(db.categories) !== original) changed = true;
  }

  if (changed) await writeDb(db);
}

function appendActivity(db, action, entity, item) {
  if (!Array.isArray(db.activity_log)) db.activity_log = [];
  db.activity_log.unshift({
    id: Date.now() + Math.floor(Math.random() * 1000),
    action,
    entity,
    item: item || 'Untitled item',
    user: 'Store Owner',
    timestamp: new Date().toISOString()
  });
  db.activity_log = db.activity_log.slice(0, 250);
}

function itemLabel(item) {
  return item.title || item.name || item.code || item.order_number || item.page || item.email || `Item ${item.id || ''}`.trim();
}

// Configuration schema for dynamic UI generation
const entityConfigs = {
  users: {
    title: 'User Management',
    fields: [
      { name: 'name', type: 'text', label: 'Full Name', required: true },
      { name: 'role', type: 'select', label: 'Role', options: ['ADMIN', 'EDITOR'], required: true }
    ]
  },
  products: {
    title: 'Product Catalog',
    fields: [
      { name: 'title', type: 'text', label: 'Product Title', required: true },
      { name: 'sku', type: 'text', label: 'SKU', required: true },
      { name: 'description', type: 'rich-text', label: 'Description', required: true },
      { name: 'price', type: 'number', label: 'Price (₹)', required: true },
      { name: 'sale_price', type: 'number', label: 'Sale Price (₹)', required: false },
      { name: 'stock', type: 'number', label: 'Stock Quantity', required: true },
      { name: 'images', type: 'image-gallery', label: 'Product Images', required: true },
      { name: 'category', type: 'category-select', label: 'Category', required: true },
      { name: 'specifications', type: 'key-value', label: 'Specifications', required: false },
      { name: 'tags', type: 'tags', label: 'Tags', required: false },
      { name: 'active', type: 'select', options: ['true', 'false'], label: 'Active', required: true },
      { name: 'publish_status', type: 'select', options: ['Published', 'Draft', 'Scheduled'], label: 'Publishing Status', required: true },
      { name: 'publish_at', type: 'datetime', label: 'Publish Date & Time', required: false }
    ]
  },
  categories: {
    title: 'Categories',
    fields: [
      { name: 'name', type: 'text', label: 'Category Name', required: true },
      { name: 'image', type: 'image', label: 'Category Image', required: true },
      { name: 'starting_price', type: 'number', label: 'Starting Price (₹)', required: true }
    ]
  },
  home_page: {
    title: 'Home Page Settings',
    fields: [
      { name: 'hero_title', type: 'text', label: 'Hero Title', required: true },
      { name: 'hero_subtitle', type: 'text', label: 'Hero Subtitle', required: true },
      { name: 'hero_bg_image', type: 'image', label: 'Background Image', required: true },
      { name: 'hero_cta_text', type: 'text', label: 'CTA Button Text', required: true },
      { name: 'hero_cta_link', type: 'text', label: 'CTA Button Link', required: true }
    ]
  },
  home_features: {
    title: 'Home Features',
    fields: [
      { name: 'title', type: 'text', label: 'Feature Title', required: true },
      { name: 'description', type: 'text', label: 'Description', required: true },
      { name: 'image', type: 'image', label: 'Icon / Image', required: true },
      { name: 'order', type: 'number', label: 'Display Order', required: true },
      { name: 'active', type: 'select', options: ['true', 'false'], label: 'Active', required: true }
    ]
  },
  home_testimonials: {
    title: 'Home Testimonials',
    fields: [
      { name: 'name', type: 'text', label: 'Customer Name', required: true },
      { name: 'text', type: 'text', label: 'Testimonial Text', required: true },
      { name: 'rating', type: 'number', label: 'Star Rating (1-5)', required: true },
      { name: 'image', type: 'image', label: 'Customer Photo', required: true },
      { name: 'active', type: 'select', options: ['true', 'false'], label: 'Active', required: true }
    ]
  },
  about_page: {
    title: 'About Page Settings',
    fields: [
      { name: 'about_title', type: 'text', label: 'Page Title', required: true },
      { name: 'about_story', type: 'rich-text', label: 'Company Story, Mission, & Vision', required: true },
      { name: 'about_image', type: 'image', label: 'About Us Header Image', required: true }
    ]
  },
  about_team: {
    title: 'About Team Members',
    fields: [
      { name: 'name', type: 'text', label: 'Name', required: true },
      { name: 'role', type: 'text', label: 'Role', required: true },
      { name: 'bio', type: 'rich-text', label: 'Short Bio', required: true },
      { name: 'image', type: 'image', label: 'Photo', required: true },
      { name: 'active', type: 'select', options: ['true', 'false'], label: 'Active', required: true }
    ]
  },
  about_gallery: {
    title: 'About Us Gallery',
    fields: [
      { name: 'title', type: 'text', label: 'Image Title', required: true },
      { name: 'image', type: 'image', label: 'Gallery Photo', required: true }
    ]
  },
  contact_addresses: {
    title: 'Contact Addresses',
    fields: [
      { name: 'street', type: 'text', label: 'Street', required: true },
      { name: 'city', type: 'text', label: 'City', required: true },
      { name: 'state', type: 'text', label: 'State/Province', required: true },
      { name: 'zip', type: 'text', label: 'ZIP/Postal Code', required: true },
      { name: 'country', type: 'text', label: 'Country', required: true },
      { name: 'active', type: 'select', options: ['true', 'false'], label: 'Active', required: true }
    ]
  },
  contact_phones: {
    title: 'Contact Phones',
    fields: [
      { name: 'number', type: 'text', label: 'Phone Number', required: true },
      { name: 'label', type: 'text', label: 'Label (e.g., Sales)', required: true },
      { name: 'active', type: 'select', options: ['true', 'false'], label: 'Active', required: true }
    ]
  },
  contact_emails: {
    title: 'Contact Emails',
    fields: [
      { name: 'email', type: 'text', label: 'Email Address', required: true },
      { name: 'label', type: 'text', label: 'Label (e.g., Support)', required: true },
      { name: 'active', type: 'select', options: ['true', 'false'], label: 'Active', required: true }
    ]
  },
  contact_locations: {
    title: 'Store Locations',
    fields: [
      { name: 'name', type: 'text', label: 'Location Name', required: true },
      { name: 'address', type: 'text', label: 'Full Address', required: true },
      { name: 'image', type: 'image', label: 'Store Photo', required: true },
      { name: 'active', type: 'select', options: ['true', 'false'], label: 'Active', required: true }
    ]
  },
  orders: {
    title: 'Orders',
    fields: [
      { name: 'order_number', type: 'text', label: 'Order Number', required: true },
      { name: 'customer_name', type: 'text', label: 'Customer Name', required: true },
      { name: 'customer_email', type: 'text', label: 'Customer Email', required: true },
      { name: 'total', type: 'number', label: 'Order Total (₹)', required: true },
      { name: 'status', type: 'select', options: ['New', 'Processing', 'Completed', 'Cancelled'], label: 'Order Status', required: true },
      { name: 'payment_status', type: 'select', options: ['Pending', 'Paid', 'Refunded', 'Failed'], label: 'Payment Status', required: true },
      { name: 'fulfillment_status', type: 'select', options: ['Unfulfilled', 'Preparing', 'Shipped', 'Delivered', 'Returned'], label: 'Fulfilment', required: true },
      { name: 'tracking_number', type: 'text', label: 'Tracking Number', required: false },
      { name: 'created_at', type: 'datetime', label: 'Order Date', required: true }
    ]
  },
  customers: {
    title: 'Customers',
    fields: [
      { name: 'name', type: 'text', label: 'Customer Name', required: true },
      { name: 'email', type: 'text', label: 'Email Address', required: true },
      { name: 'phone', type: 'text', label: 'Phone Number', required: false },
      { name: 'total_orders', type: 'number', label: 'Total Orders', required: true },
      { name: 'lifetime_value', type: 'number', label: 'Lifetime Value (₹)', required: true },
      { name: 'status', type: 'select', options: ['Active', 'Blocked'], label: 'Customer Status', required: true },
      { name: 'joined_at', type: 'datetime', label: 'Joined Date', required: true }
    ]
  },
  coupons: {
    title: 'Discounts & Coupons',
    fields: [
      { name: 'code', type: 'text', label: 'Coupon Code', required: true },
      { name: 'type', type: 'select', options: ['Percentage', 'Fixed Amount', 'Free Shipping'], label: 'Discount Type', required: true },
      { name: 'value', type: 'number', label: 'Discount Value', required: true },
      { name: 'minimum_order', type: 'number', label: 'Minimum Order (₹)', required: false },
      { name: 'usage_limit', type: 'number', label: 'Usage Limit', required: false },
      { name: 'expires_at', type: 'datetime', label: 'Expiry Date', required: false },
      { name: 'active', type: 'select', options: ['true', 'false'], label: 'Active', required: true }
    ]
  },
  media: {
    title: 'Media Library',
    fields: [
      { name: 'name', type: 'text', label: 'Image Name', required: true },
      { name: 'url', type: 'image', label: 'Image File', required: true },
      { name: 'alt_text', type: 'text', label: 'Alternative Text', required: true },
      { name: 'folder', type: 'select', options: ['Products', 'Collections', 'Website', 'Team', 'Other'], label: 'Folder', required: true }
    ]
  },
  seo_settings: {
    title: 'SEO & Social Sharing',
    fields: [
      { name: 'page', type: 'select', options: ['Home', 'Collections', 'About', 'Contact'], label: 'Website Page', required: true },
      { name: 'meta_title', type: 'text', label: 'Search Title', required: true },
      { name: 'meta_description', type: 'textarea', label: 'Search Description', required: true },
      { name: 'social_image', type: 'image', label: 'Social Sharing Image', required: false },
      { name: 'index_status', type: 'select', options: ['Index', 'Hide from search'], label: 'Search Visibility', required: true }
    ]
  },
  admin_users: {
    title: 'Team & Permissions',
    fields: [
      { name: 'name', type: 'text', label: 'Team Member', required: true },
      { name: 'email', type: 'text', label: 'Email Address', required: true },
      { name: 'role', type: 'select', options: ['Owner', 'Administrator', 'Content Editor', 'Order Manager'], label: 'Role', required: true },
      { name: 'status', type: 'select', options: ['Active', 'Invited', 'Suspended'], label: 'Access Status', required: true },
      { name: 'last_active', type: 'datetime', label: 'Last Active', required: false }
    ]
  },
  shipping_settings: {
    title: 'Shipping Settings',
    fields: [
      { name: 'zone_name', type: 'text', label: 'Shipping Zone', required: true },
      { name: 'countries', type: 'text', label: 'Countries / Regions', required: true },
      { name: 'rate', type: 'number', label: 'Standard Rate (₹)', required: true },
      { name: 'free_shipping_threshold', type: 'number', label: 'Free Shipping Above (₹)', required: false },
      { name: 'estimated_delivery', type: 'text', label: 'Delivery Estimate', required: true },
      { name: 'active', type: 'select', options: ['true', 'false'], label: 'Active', required: true }
    ]
  },
  activity_log: {
    title: 'Activity History',
    fields: [
      { name: 'action', type: 'text', label: 'Action', required: true },
      { name: 'entity', type: 'text', label: 'Area', required: true },
      { name: 'item', type: 'text', label: 'Item', required: true },
      { name: 'user', type: 'text', label: 'Team Member', required: true },
      { name: 'timestamp', type: 'datetime', label: 'Date & Time', required: true }
    ]
  },
  page_visibility: {
    title: 'Page Visibility (Master Toggles)',
    fields: [
      { name: 'home_page', type: 'select', options: ['true', 'false'], label: 'Home Page Active', required: true },
      { name: 'about_page', type: 'select', options: ['true', 'false'], label: 'About Us Active', required: true },
      { name: 'contact_settings', type: 'select', options: ['true', 'false'], label: 'Contact Us Active', required: true },
      { name: 'categories', type: 'select', options: ['true', 'false'], label: 'Categories Active', required: true },
      { name: 'products', type: 'select', options: ['true', 'false'], label: 'Products Active', required: true }
    ]
  }
};

const readOnlyEntities = new Set(['activity_log']);
const uniqueFields = {
  products: ['sku'],
  categories: ['slug', 'name'],
  coupons: ['code'],
  orders: ['order_number'],
  customers: ['email'],
  admin_users: ['email'],
  seo_settings: ['page']
};

function normalizePayload(entity, payload, existing = {}) {
  const config = entityConfigs[entity];
  if (!config) return {};
  const normalized = {};

  for (const field of config.fields) {
    if (!Object.prototype.hasOwnProperty.call(payload, field.name)) continue;
    let value = payload[field.name];
    if (typeof value === 'string') value = value.trim();
    if (field.type === 'number' && value !== '' && value !== null && value !== undefined) value = Number(value);
    if (field.type === 'datetime' && value) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) value = parsed.toISOString();
    }
    normalized[field.name] = value;
  }

  if (entity === 'products' && normalized.sale_price === '') normalized.sale_price = null;
  if (entity === 'orders' && !normalized.created_at && !existing.created_at) normalized.created_at = new Date().toISOString();
  if (entity === 'customers' && !normalized.joined_at && !existing.joined_at) normalized.joined_at = new Date().toISOString();
  if (entity === 'coupons' && normalized.code) normalized.code = normalized.code.toUpperCase().replace(/\s+/g, '');
  if (entity === 'categories') {
    if (normalized.name && !existing.slug) {
      normalized.slug = normalized.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    } else if (normalized.slug) {
      normalized.slug = normalized.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
    
    if (!existing.id) {
      normalized.description = `<p>Explore our ${normalized.name || 'new'} collection.</p>`;
      normalized.order = 99;
      normalized.active = 'true';
      normalized.publish_status = 'Published';
    }
  }
  return normalized;
}

function validatePayload(entity, payload, db, currentId = null) {
  const config = entityConfigs[entity];
  if (!config) return ['Unknown entity.'];
  const errors = [];

  for (const field of config.fields) {
    const value = payload[field.name];
    if (field.required && (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0))) {
      errors.push(`${field.label} is required.`);
    }
    if (field.type === 'number' && value !== undefined && value !== null && value !== '' && !Number.isFinite(Number(value))) {
      errors.push(`${field.label} must be a valid number.`);
    }
    if (field.type === 'select' && value !== undefined && value !== '' && field.options && !field.options.includes(String(value))) {
      errors.push(`${field.label} has an invalid value.`);
    }
  }

  if (payload.publish_status === 'Scheduled' && !payload.publish_at) errors.push('A publish date is required for scheduled content.');
  if (entity === 'products' && Number(payload.stock) < 0) errors.push('Stock cannot be negative.');
  if (entity === 'products' && payload.sale_price && Number(payload.sale_price) >= Number(payload.price)) errors.push('Sale price must be lower than the regular price.');
  if (entity === 'coupons' && payload.type !== 'Free Shipping' && Number(payload.value) <= 0) errors.push('Discount value must be greater than zero.');
  if (entity === 'coupons' && payload.type === 'Percentage' && Number(payload.value) > 100) errors.push('Percentage discounts cannot exceed 100%.');
  if (entity === 'seo_settings' && payload.meta_title && payload.meta_title.length > 70) errors.push('Search title should be 70 characters or fewer.');
  if (entity === 'seo_settings' && payload.meta_description && payload.meta_description.length > 170) errors.push('Search description should be 170 characters or fewer.');

  for (const fieldName of uniqueFields[entity] || []) {
    if (!payload[fieldName]) continue;
    const duplicate = (db[entity] || []).find(item =>
      item.id != currentId && String(item[fieldName]).toLowerCase() === String(payload[fieldName]).toLowerCase()
    );
    if (duplicate) errors.push(`${fieldName.replace(/_/g, ' ')} must be unique.`);
  }

  return errors;
}

function sendValidationError(res, errors) {
  return res.status(422).json({
    success: false,
    error: 'Validation failed',
    details: errors
  });
}

class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function sendError(res, error) {
  const status = error.status || 500;
  return res.status(status).json({
    success: false,
    error: status === 500 ? 'Internal server error' : error.message,
    ...(error.details ? { details: error.details } : {})
  });
}

const Image = require('../models/Image');

exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    
    // Save image to MongoDB
    const image = new Image({
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      data: req.file.buffer
    });
    const savedImage = await image.save();

    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/api/admin/images/${savedImage._id}`;
    res.json({ success: true, url: imageUrl });
  } catch (error) {
    sendError(res, error);
  }
};

exports.getImage = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.set('Content-Type', image.contentType);
    res.send(image.data);
  } catch (error) {
    res.status(404).json({ error: 'Image not found' });
  }
};

exports.getEntityConfig = (req, res) => {
  const entity = req.params.entity;
  const config = entityConfigs[entity];
  
  if (!config) {
    return res.status(404).json({ error: 'Entity configuration not found' });
  }
  
  res.json({ success: true, config });
};

exports.getEntityData = async (req, res) => {
  try {
    const entity = req.params.entity;
    if (!entityConfigs[entity]) throw new ApiError(404, 'Entity configuration not found');
    const db = await readDb();
    let data = db[entity] || [];
    const { search, status, page, limit } = req.query;
    if (search) {
      const term = String(search).toLowerCase();
      data = data.filter(item => Object.values(item).some(value => String(value).toLowerCase().includes(term)));
    }
    if (status) {
      data = data.filter(item => String(item.status || item.active || item.publish_status).toLowerCase() === String(status).toLowerCase());
    }
    const total = data.length;
    if (page || limit) {
      const pageNumber = Math.max(Number(page) || 1, 1);
      const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
      data = data.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
      return res.json({ success: true, data, meta: { total, page: pageNumber, limit: pageSize, pages: Math.ceil(total / pageSize) } });
    }
    res.json({ success: true, data, meta: { total } });
  } catch (err) {
    sendError(res, err);
  }
};

exports.createEntityData = async (req, res) => {
  try {
    const entity = req.params.entity;
    if (!entityConfigs[entity]) throw new ApiError(404, 'Entity configuration not found');
    if (readOnlyEntities.has(entity)) throw new ApiError(403, 'This entity is read-only');
    const newItem = await mutateDb(db => {
      if (!db[entity]) db[entity] = [];
      const normalized = normalizePayload(entity, req.body);
      const errors = validatePayload(entity, normalized, db);
      if (errors.length) throw new ApiError(422, 'Validation failed', errors);
      const item = { id: Date.now(), ...normalized };
      db[entity].push(item);
      appendActivity(db, 'Created', entity, itemLabel(item));
      return item;
    });
    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    sendError(res, err);
  }
};

exports.updateEntityData = async (req, res) => {
  const { entity, id } = req.params;
  try {
    if (!entityConfigs[entity]) throw new ApiError(404, 'Entity configuration not found');
    if (readOnlyEntities.has(entity)) throw new ApiError(403, 'This entity is read-only');
    const updatedItem = await mutateDb(db => {
      if (!db[entity]) throw new ApiError(404, 'Entity not found');
      const index = db[entity].findIndex(item => item.id == id);
      if (index === -1) throw new ApiError(404, 'Item not found');
      const normalized = normalizePayload(entity, req.body, db[entity][index]);
      const candidate = { ...db[entity][index], ...normalized, id: db[entity][index].id };
      const errors = validatePayload(entity, candidate, db, id);
      if (errors.length) throw new ApiError(422, 'Validation failed', errors);
      db[entity][index] = candidate;
      appendActivity(db, 'Updated', entity, itemLabel(candidate));
      return candidate;
    });
    res.json({ success: true, data: updatedItem });
  } catch (err) {
    sendError(res, err);
  }
};

exports.deleteEntityData = async (req, res) => {
  const { entity, id } = req.params;
  try {
    if (!entityConfigs[entity]) throw new ApiError(404, 'Entity configuration not found');
    if (readOnlyEntities.has(entity)) throw new ApiError(403, 'This entity is read-only');
    await mutateDb(db => {
      if (!db[entity]) throw new ApiError(404, 'Entity not found');
      const deletedItem = db[entity].find(item => item.id == id);
      if (!deletedItem) throw new ApiError(404, 'Item not found');
      db[entity] = db[entity].filter(item => item.id != id);
      appendActivity(db, 'Deleted', entity, itemLabel(deletedItem));
    });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    sendError(res, err);
  }
};

exports.bulkUpdateStatus = async (req, res) => {
  const { entity } = req.params;
  const { ids, active } = req.body;
  try {
    if (!Array.isArray(ids) || ids.length === 0) throw new ApiError(422, 'Select at least one item');
    if (!['true', 'false'].includes(String(active))) throw new ApiError(422, 'Active status must be true or false');
    await mutateDb(db => {
      if (!db[entity]) throw new ApiError(404, 'Entity not found');
      const idSet = new Set(ids.map(String));
      db[entity] = db[entity].map(item => idSet.has(String(item.id)) ? { ...item, active: String(active) } : item);
      appendActivity(db, active === 'true' ? 'Bulk activated' : 'Bulk hidden', entity, `${ids.length} items`);
    });
    res.json({ success: true, message: 'Bulk update successful' });
  } catch (err) {
    sendError(res, err);
  }
};

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const db = await readDb();
    const orders = db.orders || [];
    const products = db.products || [];
    const customers = db.customers || [];
    const paidOrders = orders.filter(order => order.payment_status === 'Paid');
    const revenue = paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const openOrders = orders.filter(order => !['Completed', 'Cancelled'].includes(order.status));
    const lowStock = products.filter(product => Number(product.stock || 0) <= 5);
    const topProducts = products
      .map(product => ({
        id: product.id,
        title: product.title,
        sku: product.sku,
        stock: Number(product.stock || 0),
        price: Number(product.sale_price || product.price || 0)
      }))
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        revenue,
        order_count: orders.length,
        open_orders: openOrders.length,
        customer_count: customers.length,
        product_count: products.length,
        low_stock_count: lowStock.length,
        recent_orders: orders.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6),
        low_stock: lowStock.slice(0, 8),
        top_products: topProducts
      }
    });
  } catch (error) {
    sendError(res, error);
  }
};

exports.getInventoryAlerts = async (req, res) => {
  try {
    const threshold = Math.max(Number(req.query.threshold) || 5, 0);
    const db = await readDb();
    const products = (db.products || [])
      .filter(product => Number(product.stock || 0) <= threshold)
      .sort((a, b) => Number(a.stock || 0) - Number(b.stock || 0));
    res.json({ success: true, data: products, meta: { threshold, total: products.length } });
  } catch (error) {
    sendError(res, error);
  }
};

exports.updateOrderWorkflow = async (req, res) => {
  try {
    const allowed = {
      status: ['New', 'Processing', 'Completed', 'Cancelled'],
      payment_status: ['Pending', 'Paid', 'Refunded', 'Failed'],
      fulfillment_status: ['Unfulfilled', 'Preparing', 'Shipped', 'Delivered', 'Returned']
    };
    const updates = {};
    for (const [field, options] of Object.entries(allowed)) {
      if (req.body[field] !== undefined) {
        if (!options.includes(req.body[field])) throw new ApiError(422, `Invalid ${field.replace(/_/g, ' ')}`);
        updates[field] = req.body[field];
      }
    }
    if (req.body.tracking_number !== undefined) updates.tracking_number = String(req.body.tracking_number).trim();
    if (updates.fulfillment_status === 'Shipped' && !updates.tracking_number && !req.body.keep_existing_tracking) {
      throw new ApiError(422, 'A tracking number is required when marking an order as shipped');
    }
    const order = await mutateDb(db => {
      const index = (db.orders || []).findIndex(item => item.id == req.params.id);
      if (index === -1) throw new ApiError(404, 'Order not found');
      db.orders[index] = { ...db.orders[index], ...updates, updated_at: new Date().toISOString() };
      appendActivity(db, 'Order workflow updated', 'orders', db.orders[index].order_number);
      return db.orders[index];
    });
    res.json({ success: true, data: order });
  } catch (error) {
    sendError(res, error);
  }
};

function isPublished(item) {
  if (item.active === false || item.active === 'false') return false;
  if (!item.publish_status || item.publish_status === 'Published') return true;
  if (item.publish_status === 'Scheduled' && item.publish_at) return new Date(item.publish_at).getTime() <= Date.now();
  return false;
}

exports.getPublicCatalog = async (req, res) => {
  try {
    const db = await readDb();
    const categories = (db.categories || []).filter(isPublished);
    const categorySlugs = new Set(categories.map(category => category.slug));
    const products = (db.products || []).filter(product => isPublished(product) && categorySlugs.has(product.category));
    res.json({
      success: true,
      data: {
        categories,
        products: products.map(({ specifications, ...product }) => ({ ...product, specifications: specifications || [] }))
      }
    });
  } catch (error) {
    sendError(res, error);
  }
};

const publicContentEntities = new Set([
  'home_page',
  'home_features',
  'home_testimonials',
  'about_page',
  'about_team',
  'about_gallery',
  'contact_addresses',
  'contact_phones',
  'contact_emails',
  'contact_locations',
  'page_visibility'
]);

exports.getPublicContent = async (req, res) => {
  try {
    const { entity } = req.params;
    if (!publicContentEntities.has(entity)) throw new ApiError(404, 'Public content section not found');
    const db = await readDb();
    const data = (db[entity] || []).filter(item => {
      if (entity === 'page_visibility') return true;
      return isPublished(item);
    });
    res.json({ success: true, data });
  } catch (error) {
    sendError(res, error);
  }
};

exports.validateCoupon = async (req, res) => {
  try {
    const code = String(req.body.code || '').trim().toUpperCase();
    const subtotal = Number(req.body.subtotal || 0);
    if (!code) throw new ApiError(422, 'Coupon code is required');
    const db = await readDb();
    const coupon = (db.coupons || []).find(item => item.code === code && (item.active === true || item.active === 'true'));
    if (!coupon) throw new ApiError(404, 'Coupon is invalid or inactive');
    if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) throw new ApiError(422, 'Coupon has expired');
    if (subtotal < Number(coupon.minimum_order || 0)) throw new ApiError(422, `Minimum order is $${coupon.minimum_order}`);
    const discount = coupon.type === 'Percentage'
      ? subtotal * Number(coupon.value || 0) / 100
      : coupon.type === 'Fixed Amount'
        ? Math.min(subtotal, Number(coupon.value || 0))
        : 0;
    res.json({ success: true, data: { code, type: coupon.type, discount, free_shipping: coupon.type === 'Free Shipping' } });
  } catch (error) {
    sendError(res, error);
  }
};

exports.createStoreOrder = async (req, res) => {
  try {
    const { customer, items, shipping_address, coupon_code } = req.body;
    if (!customer?.name || !customer?.email) throw new ApiError(422, 'Customer name and email are required');
    if (!Array.isArray(items) || items.length === 0) throw new ApiError(422, 'Your cart is empty');

    const order = await mutateDb(db => {
      let subtotal = 0;
      const orderItems = items.map(cartItem => {
        const product = (db.products || []).find(item => String(item.id) === String(cartItem.product_id) && isPublished(item));
        if (!product) throw new ApiError(422, `Product ${cartItem.product_id} is unavailable`);
        const quantity = Math.max(Math.floor(Number(cartItem.quantity || 1)), 1);
        if (Number(product.stock || 0) < quantity) throw new ApiError(422, `${product.title} does not have enough stock`);
        const unitPrice = Number(product.sale_price || product.price || 0);
        subtotal += unitPrice * quantity;
        return { product_id: product.id, title: product.title, sku: product.sku, quantity, unit_price: unitPrice };
      });

      let discount = 0;
      let freeShipping = false;
      if (coupon_code) {
        const coupon = (db.coupons || []).find(item => item.code === String(coupon_code).trim().toUpperCase() && (item.active === true || item.active === 'true'));
        if (!coupon) throw new ApiError(422, 'Coupon is invalid or inactive');
        if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) throw new ApiError(422, 'Coupon has expired');
        if (subtotal < Number(coupon.minimum_order || 0)) throw new ApiError(422, `Minimum order is $${coupon.minimum_order}`);
        discount = coupon.type === 'Percentage' ? subtotal * Number(coupon.value || 0) / 100 : coupon.type === 'Fixed Amount' ? Math.min(subtotal, Number(coupon.value || 0)) : 0;
        freeShipping = coupon.type === 'Free Shipping';
      }

      const shippingRule = (db.shipping_settings || []).find(rule => rule.active === true || rule.active === 'true');
      const shipping = freeShipping || subtotal >= Number(shippingRule?.free_shipping_threshold || Infinity) ? 0 : Number(shippingRule?.rate || 0);
      const total = Math.max(subtotal - discount + shipping, 0);
      const id = Date.now();
      const newOrder = {
        id,
        order_number: `NF-${String(id).slice(-6)}`,
        customer_name: customer.name.trim(),
        customer_email: customer.email.trim().toLowerCase(),
        customer_phone: String(customer.phone || '').trim(),
        items: orderItems,
        shipping_address: shipping_address || {},
        subtotal,
        discount,
        shipping,
        total,
        coupon_code: coupon_code ? String(coupon_code).trim().toUpperCase() : '',
        status: 'New',
        payment_status: 'Pending',
        fulfillment_status: 'Unfulfilled',
        tracking_number: '',
        created_at: new Date().toISOString()
      };
      if (!Array.isArray(db.orders)) db.orders = [];
      db.orders.unshift(newOrder);

      for (const orderItem of orderItems) {
        const product = db.products.find(item => String(item.id) === String(orderItem.product_id));
        product.stock = Number(product.stock || 0) - orderItem.quantity;
      }

      if (!Array.isArray(db.customers)) db.customers = [];
      const customerIndex = db.customers.findIndex(item => String(item.email).toLowerCase() === newOrder.customer_email);
      if (customerIndex === -1) {
        db.customers.push({
          id: id + 1,
          name: newOrder.customer_name,
          email: newOrder.customer_email,
          phone: newOrder.customer_phone,
          total_orders: 1,
          lifetime_value: total,
          status: 'Active',
          joined_at: newOrder.created_at
        });
      } else {
        db.customers[customerIndex].total_orders = Number(db.customers[customerIndex].total_orders || 0) + 1;
        db.customers[customerIndex].lifetime_value = Number(db.customers[customerIndex].lifetime_value || 0) + total;
      }

      appendActivity(db, 'Order placed', 'orders', newOrder.order_number);
      return newOrder;
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    sendError(res, error);
  }
};
