import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Empty,
  Input,
  message,
  Popconfirm,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import {
  Archive,
  Check,
  ChevronLeft,
  CirclePlus,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Image as ImageIcon,
  Layers3,
  PackageCheck,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import axios from 'axios';
import DynamicForm from './DynamicForm';

interface AdminDashboardProps {
  entity: string;
}

const entityHelp: Record<string, string> = {
  home_page: 'Control the first impression: your main headline, supporting message, hero image, and primary button.',
  home_features: 'Show the strongest reasons customers should feel confident shopping with you.',
  home_testimonials: 'Build trust with genuine feedback from happy customers.',
  categories: 'Group products into collections so shoppers can find what suits their space.',
  products: 'Manage product details, pricing, inventory, imagery, and publishing status.',
  about_page: 'Share the story, purpose, and people behind your brand.',
  about_team: 'Introduce the makers and personalities that bring Bhavika Furniture to life.',
  about_gallery: 'Curate visual moments from your studio, workshop, and process.',
  contact_addresses: 'Keep office and mailing addresses accurate.',
  contact_phones: 'Manage customer-facing phone numbers and their purposes.',
  contact_emails: 'Direct customer questions to the right inbox.',
  contact_locations: 'Help customers discover your physical stores.',
  orders: 'Track payments, update fulfilment progress, and keep delivery details accurate.',
  customers: 'Maintain a helpful view of every customer relationship and its value.',
  coupons: 'Create promotions with clear limits, minimum orders, and expiry dates.',
  media: 'Keep reusable website imagery organised and accessible.',
  seo_settings: 'Shape how your pages appear in search engines and social sharing.',
  admin_users: 'Control who can access the workspace and what role they hold.',
  shipping_settings: 'Manage delivery zones, rates, thresholds, and customer expectations.',
  activity_log: 'Review a chronological, read-only record of important workspace changes.',
};

function plainText(value: unknown) {
  if (typeof value !== 'string') return value;
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function AdminDashboard({ entity }: AdminDashboardProps) {
  const [config, setConfig] = useState<any>(null);
  const [data, setData] = useState<any[]>([]);
  const [visibility, setVisibility] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [configRes, dataRes, visRes] = await Promise.all([
        axios.get(`http://localhost:3000/api/admin/config/${entity}`),
        axios.get(`http://localhost:3000/api/admin/data/${entity}`),
        axios.get('http://localhost:3000/api/admin/data/page_visibility')
      ]);
      setConfig(configRes.data.config);
      setData(dataRes.data.data);
      if (visRes.data.data.length > 0) setVisibility(visRes.data.data[0]);
    } catch {
      message.error('We could not load this section. Please check that the server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    setIsFormVisible(false);
    setEditItem(null);
    setSelectedRowKeys([]);
    setSearchText('');
    setCategoryFilter('');

    if (entity === 'products') {
      axios.get('http://localhost:3000/api/admin/data/categories')
        .then(res => setCategories(res.data.data))
        .catch(console.error);
    }
  }, [entity]);

  const toggleVisibility = async (checked: boolean) => {
    if (!visibility) return;
    try {
      const updatedVis = { ...visibility, [entity]: checked };
      await axios.put('http://localhost:3000/api/admin/data/page_visibility/1', updatedVis);
      setVisibility(updatedVis);
      message.success(checked ? 'This section is now visible on the website.' : 'This section is now hidden from visitors.');
    } catch {
      message.error('Publishing status could not be updated.');
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await axios.delete(`http://localhost:3000/api/admin/data/${entity}/${id}`);
      message.success('Item deleted.');
      fetchData();
    } catch {
      message.error('This item could not be deleted.');
    }
  };

  const handleBulkStatus = async (status: string) => {
    try {
      await axios.post(`http://localhost:3000/api/admin/data/${entity}/bulk-status`, {
        ids: selectedRowKeys,
        active: status
      });
      message.success(`${selectedRowKeys.length} item${selectedRowKeys.length === 1 ? '' : 's'} updated.`);
      setSelectedRowKeys([]);
      fetchData();
    } catch {
      message.error('The selected items could not be updated.');
    }
  };

  const filteredData = useMemo(() => data.filter((item: any) => {
    const searchable = Object.values(item)
      .filter(value => typeof value === 'string' || typeof value === 'number')
      .join(' ')
      .toLowerCase();
    if (searchText && !searchable.includes(searchText.toLowerCase())) return false;
    if (categoryFilter && item.category !== categoryFilter) return false;
    return true;
  }), [data, searchText, categoryFilter]);

  const activeCount = data.filter(item => item.active === true || item.active === 'true').length;
  const hasStatus = data.some(item => Object.prototype.hasOwnProperty.call(item, 'active'));
  const isPublishable = visibility && visibility[entity] !== undefined;
  const isReadOnly = entity === 'activity_log';

  if (loading || !config) {
    return (
      <div className="grid min-h-[420px] place-items-center rounded-[26px] border border-[var(--line)] bg-white">
        <div className="flex flex-col items-center gap-4">
          <Spin size="large" />
          <p className="text-sm font-semibold text-[var(--muted)]">Loading your content…</p>
        </div>
      </div>
    );
  }

  const columns = config.fields.map((field: any, index: number) => ({
    title: field.label,
    dataIndex: field.name,
    key: field.name,
    ellipsis: true,
    width: field.type === 'rich-text' ? 260 : field.type.includes('image') ? 100 : index === 0 ? 210 : 150,
    render: (value: any) => {
      if (field.type === 'image' && value) {
        return <img src={value} alt="" className="h-14 w-16 rounded-xl border border-[var(--line)] object-cover" />;
      }
      if (field.type === 'image-gallery') {
        return Array.isArray(value) && value.length > 0 ? (
          <div className="flex items-center">
            {value.slice(0, 3).map((url: string, imageIndex: number) => (
              <img key={url} src={url} alt="" className={`h-12 w-12 rounded-xl border-2 border-white object-cover ${imageIndex > 0 ? '-ml-3' : ''}`} />
            ))}
            {value.length > 3 && <span className="-ml-2 grid h-10 w-10 place-items-center rounded-full bg-[var(--lavender)] text-xs font-bold text-[var(--violet)]">+{value.length - 3}</span>}
          </div>
        ) : <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]"><ImageIcon size={14} /> No image</span>;
      }
      if (field.type === 'key-value' && Array.isArray(value)) {
        return <Tag color="purple">{value.length} specification{value.length === 1 ? '' : 's'}</Tag>;
      }
      if (field.type === 'tags' && Array.isArray(value)) {
        return <div className="flex flex-wrap gap-1">{value.slice(0, 2).map(tag => <Tag key={tag}>{tag}</Tag>)}</div>;
      }
      if (field.name === 'active') {
        const active = value === true || value === 'true';
        return <Tag color={active ? 'success' : 'default'} className="!rounded-full !px-2.5">{active ? 'Active' : 'Hidden'}</Tag>;
      }
      if (['status', 'payment_status', 'fulfillment_status', 'publish_status', 'index_status'].includes(field.name)) {
        const successValues = ['Active', 'Paid', 'Completed', 'Delivered', 'Published', 'Index'];
        const warningValues = ['New', 'Processing', 'Preparing', 'Pending', 'Scheduled', 'Invited'];
        const errorValues = ['Cancelled', 'Failed', 'Suspended'];
        return (
          <Tag
            color={successValues.includes(value) ? 'success' : warningValues.includes(value) ? 'processing' : errorValues.includes(value) ? 'error' : 'default'}
            className="!rounded-full !px-2.5"
          >
            {value}
          </Tag>
        );
      }
      if (['price', 'sale_price', 'total', 'lifetime_value', 'rate', 'minimum_order', 'free_shipping_threshold', 'starting_price'].includes(field.name) && value !== undefined && value !== '') {
        return <span className="font-bold text-[var(--ink)]">₹{value}</span>;
      }
      if (field.type === 'datetime' && value) {
        const parsed = new Date(value);
        return <span className="text-xs font-medium">{Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString()}</span>;
      }
      const displayValue = plainText(value);
      return displayValue || <span className="text-[var(--muted)]">—</span>;
    }
  }));

  if (!isReadOnly) columns.push({
    title: '',
    key: 'action',
    fixed: 'right',
    width: 116,
    render: (_: any, record: any) => (
      <div className="flex justify-end gap-1">
        <Tooltip title="Edit item">
          <Button
            aria-label="Edit item"
            icon={<Pencil size={16} />}
            onClick={() => {
              setEditItem(record);
              setIsFormVisible(true);
            }}
          />
        </Tooltip>
        <Popconfirm
          title="Delete this item?"
          description="This cannot be undone."
          onConfirm={() => handleDelete(record.id)}
          okText="Delete"
          cancelText="Keep it"
          okButtonProps={{ danger: true }}
        >
          <Tooltip title="Delete item"><Button aria-label="Delete item" danger icon={<Trash2 size={16} />} /></Tooltip>
        </Popconfirm>
      </div>
    ),
  } as any);

  if (isFormVisible) {
    return (
      <section className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-white shadow-[0_18px_50px_rgba(53,39,105,.08)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] bg-gradient-to-r from-[#faf8ff] to-white px-5 py-5 sm:flex-row sm:items-center md:px-7">
          <div className="flex items-center gap-4">
            <button
              aria-label="Back to list"
              onClick={() => {
                setIsFormVisible(false);
                setEditItem(null);
              }}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-white transition hover:border-[var(--violet)] hover:text-[var(--violet)]"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--violet)]">{editItem ? 'Editing existing item' : 'Creating new item'}</p>
              <h2 className="brand-display mt-1 text-2xl font-extrabold">{editItem ? `Edit ${config.title}` : `Add to ${config.title}`}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[var(--lavender)] px-4 py-2 text-xs font-bold text-[var(--violet)]">
            <FileText size={15} /> {config.fields.length} fields to review
          </div>
        </div>
        <DynamicForm
          entity={entity}
          config={config}
          editItem={editItem}
          onCancel={() => {
            setIsFormVisible(false);
            setEditItem(null);
          }}
          onSuccess={() => {
            setIsFormVisible(false);
            setEditItem(null);
            fetchData();
          }}
        />
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="grid h-11 w-11 place-items-center rounded-[15px] bg-[var(--lavender)] text-[var(--violet)]"><Layers3 size={21} /></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--muted)]">Total content</span>
          </div>
          <p className="brand-display mt-5 text-4xl font-extrabold">{data.length}</p>
          <p className="mt-1 text-xs font-medium text-[var(--muted)]">item{data.length === 1 ? '' : 's'} in this section</p>
        </div>
        <div className="rounded-[24px] border border-[var(--line)] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <span className="grid h-11 w-11 place-items-center rounded-[15px] bg-[#e5f8ec] text-[#16864a]"><PackageCheck size={21} /></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[var(--muted)]">Item status</span>
          </div>
          <p className="brand-display mt-5 text-4xl font-extrabold">{hasStatus ? activeCount : data.length}</p>
          <p className="mt-1 text-xs font-medium text-[var(--muted)]">{hasStatus ? 'active and ready' : 'available records'}</p>
        </div>
        <div className={`rounded-[24px] border p-5 shadow-sm ${isPublishable && visibility[entity] ? 'border-[#bce8ca] bg-[#effbf3]' : 'border-[var(--line)] bg-white'}`}>
          <div className="flex items-start justify-between">
            <span className={`grid h-11 w-11 place-items-center rounded-[15px] ${isPublishable && visibility[entity] ? 'bg-[#d8f5e1] text-[#16864a]' : 'bg-[#f0edf5] text-[var(--muted)]'}`}>
              {isPublishable && visibility[entity] ? <Eye size={21} /> : <EyeOff size={21} />}
            </span>
            {isPublishable ? (
              <Switch checked={visibility[entity]} onChange={toggleVisibility} checkedChildren="Live" unCheckedChildren="Hidden" />
            ) : (
              <span className="rounded-full bg-[#f0edf5] px-3 py-1 text-[10px] font-bold text-[var(--muted)]">Always available</span>
            )}
          </div>
          <p className="brand-display mt-5 text-xl font-extrabold">{isPublishable ? (visibility[entity] ? 'Published' : 'Not visible') : 'Content block'}</p>
          <p className="mt-1 text-xs font-medium text-[var(--muted)]">{isPublishable ? 'Website visibility' : 'Visibility follows its page'}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-white shadow-[0_18px_50px_rgba(53,39,105,.07)]">
        <div className="border-b border-[var(--line)] px-5 py-5 md:px-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="brand-display text-2xl font-extrabold">{config.title}</h2>
                <Tag className="!m-0 !rounded-full !border-0 !bg-[var(--lavender)] !px-3 !py-1 !font-bold !text-[var(--violet)]">{filteredData.length} shown</Tag>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">{entityHelp[entity] || 'Manage the content shown in this part of your website.'}</p>
            </div>
            {!isReadOnly && (
              <Button
                type="primary"
                size="large"
                icon={<Plus size={18} />}
                onClick={() => {
                  setEditItem(null);
                  setIsFormVisible(true);
                }}
                className="!h-12 !rounded-full !px-6 !font-bold !shadow-[0_10px_22px_rgba(108,76,255,.22)]"
              >
                Add new
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-b border-[var(--line)] bg-[#fcfbff] px-5 py-4 md:px-7 lg:flex-row lg:items-center">
          <Input
            prefix={<Search size={17} className="text-[var(--muted)]" />}
            placeholder="Search this section…"
            allowClear
            value={searchText}
            onChange={event => setSearchText(event.target.value)}
            className="!h-11 !max-w-md !rounded-full !px-4"
          />
          {entity === 'products' && (
            <Select
              suffixIcon={<Filter size={15} />}
              className="admin-pill-select w-full lg:w-56"
              placeholder="All collections"
              allowClear
              onChange={setCategoryFilter}
              value={categoryFilter || undefined}
              options={categories.map(category => ({ label: category.name, value: category.slug }))}
            />
          )}
          {selectedRowKeys.length > 0 && (
            <div className="flex flex-1 flex-wrap items-center gap-2 rounded-2xl bg-[var(--lavender)] p-2 lg:ml-auto lg:justify-end">
              <span className="px-2 text-xs font-bold text-[var(--violet)]">{selectedRowKeys.length} selected</span>
              <Button size="small" icon={<Check size={14} />} onClick={() => handleBulkStatus('true')}>Activate</Button>
              <Button size="small" icon={<Archive size={14} />} onClick={() => handleBulkStatus('false')}>Hide</Button>
              <Button size="small" type="text" aria-label="Clear selection" icon={<X size={14} />} onClick={() => setSelectedRowKeys([])} />
            </div>
          )}
        </div>

        {data.length === 0 ? (
          <div className="px-5 py-20 text-center">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-[var(--muted)]">{isReadOnly ? 'No activity has been recorded yet.' : 'Nothing here yet. Add your first item to get started.'}</span>}>
              {!isReadOnly && <Button type="primary" icon={<CirclePlus size={17} />} onClick={() => setIsFormVisible(true)}>Add first item</Button>}
            </Empty>
          </div>
        ) : (
          <>
            {filteredData.length === 0 && (
              <Alert className="!m-5 !rounded-2xl md:!mx-7" message="No matching content" description="Try a different search or remove the collection filter." type="info" showIcon />
            )}
            <Table
              rowSelection={entity === 'products' ? {
                selectedRowKeys,
                onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
              } : undefined}
              dataSource={filteredData}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 8,
                showSizeChanger: false,
                showTotal: total => `${total} item${total === 1 ? '' : 's'}`,
              }}
              scroll={{ x: 'max-content' }}
              className="admin-content-table"
            />
          </>
        )}
      </section>
    </div>
  );
}
