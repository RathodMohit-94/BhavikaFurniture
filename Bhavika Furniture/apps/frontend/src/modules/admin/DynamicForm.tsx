import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Input, InputNumber, message, Select, Upload } from 'antd';
import {
  Check,
  Image as ImageIcon,
  Info,
  Plus,
  Save,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface DynamicFormProps {
  entity: string;
  config: any;
  editItem?: any;
  onCancel: () => void;
  onSuccess: () => void;
}

const fieldHints: Record<string, string> = {
  hero_title: 'Keep it punchy—five to eight words works beautifully.',
  hero_subtitle: 'Explain the feeling and value of your collection in one or two sentences.',
  hero_bg_image: 'Use a bright landscape image, ideally 1800 × 1200 px or larger.',
  hero_cta_text: 'A short action such as “Explore the collection”.',
  hero_cta_link: 'Use a website path such as /category.',
  slug: 'Lowercase words separated by hyphens, for example: living-room.',
  sku: 'A unique internal product code, for example: SOF-001.',
  sale_price: 'Optional. Leave blank when the product is not on sale.',
  stock: 'The number of units currently available.',
  images: 'Add several angles so customers can understand the piece.',
  order: 'Lower numbers appear first.',
  active: 'Choose Active to show this item to visitors.',
  rating: 'Use a number from 1 to 5.',
  publish_status: 'Use Draft while working, Published when ready, or Scheduled for a future launch.',
  publish_at: 'Choose a future time only when Publishing Status is Scheduled.',
};

function KeyValueInput({ value, onChange }: { value?: any[], onChange?: (value: any[]) => void }) {
  const items = value || [];

  const update = (index: number, key: string, nextValue: string) => {
    const nextItems = [...items];
    nextItems[index] = { key, value: nextValue };
    onChange?.(nextItems);
  };

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="grid gap-2 rounded-2xl border border-[var(--line)] bg-[#faf9fd] p-3 sm:grid-cols-[1fr_1.4fr_auto]">
          <Input
            placeholder="Property, e.g. Material"
            value={item.key}
            onChange={event => update(index, event.target.value, item.value)}
          />
          <Input
            placeholder="Value, e.g. Solid oak"
            value={item.value}
            onChange={event => update(index, item.key, event.target.value)}
          />
          <Button aria-label="Remove specification" danger icon={<Trash2 size={15} />} onClick={() => onChange?.(items.filter((_, itemIndex) => itemIndex !== index))} />
        </div>
      ))}
      <Button
        type="dashed"
        icon={<Plus size={16} />}
        block
        className="!h-11 !rounded-xl"
        onClick={() => onChange?.([...items, { key: '', value: '' }])}
      >
        Add specification
      </Button>
    </div>
  );
}

export default function DynamicForm({ entity, config, editItem, onCancel, onSuccess }: DynamicFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isDirty },
  } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [mediaLibrary, setMediaLibrary] = useState<any[]>([]);

  useEffect(() => {
    if (editItem) {
      reset(editItem);
      return;
    }
    const defaults = config.fields.reduce((values: Record<string, any>, field: any) => {
      if (field.name === 'active') values[field.name] = 'true';
      if (field.name === 'publish_status') values[field.name] = 'Draft';
      if (field.name === 'created_at' || field.name === 'joined_at') {
        values[field.name] = new Date().toISOString().slice(0, 16);
      }
      return values;
    }, {});
    reset(defaults);
  }, [editItem, reset, config]);

  useEffect(() => {
    if (config.fields.some((field: any) => field.type === 'category-select')) {
      axios.get('http://localhost:3000/api/admin/data/categories')
        .then(res => setCategories(res.data.data.filter((category: any) => category.active === 'true' || category.active === true)))
        .catch(console.error);
    }
  }, [config]);

  useEffect(() => {
    if (config.fields.some((field: any) => field.type === 'image' || field.type === 'image-gallery')) {
      axios.get('http://localhost:3000/api/admin/data/media')
        .then(res => setMediaLibrary(res.data.data))
        .catch(console.error);
    }
  }, [config]);

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      if (editItem) {
        await axios.put(`http://localhost:3000/api/admin/data/${entity}/${editItem.id}`, data);
        message.success('Your changes are live.');
      } else {
        await axios.post(`http://localhost:3000/api/admin/data/${entity}`, data);
        message.success('New content added successfully.');
      }
      onSuccess();
    } catch (error: any) {
      const detail = error?.response?.data?.details?.[0] || error?.response?.data?.error;
      message.error(detail || (editItem ? 'Your changes could not be saved.' : 'The new item could not be created.'));
    } finally {
      setSubmitting(false);
    }
  };

  const uploadImage = async (options: any, fieldName: string, currentImages?: string[]) => {
    const { file, onSuccess: uploadSuccess, onError } = options;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await axios.post('http://localhost:3000/api/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const value = currentImages ? [...currentImages, response.data.url] : response.data.url;
      setValue(fieldName, value, { shouldDirty: true, shouldValidate: true });
      uploadSuccess(response.data, file);
      message.success(currentImages ? 'Image added to the gallery.' : 'Image uploaded.');
    } catch (error) {
      onError(error);
      message.error('Image upload failed. Please try again.');
    }
  };

  const isWideField = (field: any) => ['rich-text', 'image', 'image-gallery', 'key-value', 'tags'].includes(field.type);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-x-6 gap-y-1 p-5 md:grid-cols-2 md:p-7">
        {config.fields.map((field: any) => {
          const fieldError = errors[field.name];
          return (
            <div className={`mb-5 ${isWideField(field) ? 'md:col-span-2' : ''}`} key={field.name}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor={field.name} className="text-sm font-bold text-[var(--ink)]">
                  {field.label}
                  {field.required && <span className="ml-1 text-[var(--coral)]">*</span>}
                </label>
                {!field.required && <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--muted)]">Optional</span>}
              </div>
              {fieldHints[field.name] && (
                <p className="mb-2.5 flex items-start gap-1.5 text-xs leading-5 text-[var(--muted)]">
                  <Info size={13} className="mt-0.5 shrink-0 text-[var(--violet)]" /> {fieldHints[field.name]}
                </p>
              )}

              <Controller
                name={field.name}
                control={control}
                rules={{ required: field.required ? `${field.label} is required` : false }}
                render={({ field: controllerField }) => {
                  if (field.type === 'number') {
                    return <InputNumber id={field.name} className="!w-full" placeholder={`Enter ${field.label.toLowerCase()}`} {...controllerField} />;
                  }
                  if (field.type === 'datetime') {
                    const value = controllerField.value ? String(controllerField.value).slice(0, 16) : '';
                    return <Input id={field.name} type="datetime-local" {...controllerField} value={value} />;
                  }
                  if (field.type === 'textarea') {
                    return <Input.TextArea id={field.name} rows={5} placeholder={`Enter ${field.label.toLowerCase()}`} {...controllerField} />;
                  }
                  if (field.type === 'select') {
                    return (
                      <Select
                        id={field.name}
                        className="w-full"
                        placeholder={`Choose ${field.label.toLowerCase()}`}
                        options={field.options?.map((option: string) => ({
                          label: option === 'true' ? 'Active — visible to visitors' : option === 'false' ? 'Hidden — not shown' : option,
                          value: option,
                        }))}
                        {...controllerField}
                      />
                    );
                  }
                  if (field.type === 'category-select') {
                    return (
                      <Select
                        id={field.name}
                        className="w-full"
                        placeholder="Choose a collection"
                        options={categories.map(category => ({ label: category.name, value: category.slug }))}
                        {...controllerField}
                      />
                    );
                  }
                  if (field.type === 'tags') {
                    return <Select id={field.name} mode="tags" className="w-full" placeholder="Type a tag and press Enter" tokenSeparators={[',']} {...controllerField} />;
                  }
                  if (field.type === 'key-value') {
                    return <KeyValueInput value={controllerField.value} onChange={controllerField.onChange} />;
                  }
                  if (field.type === 'rich-text') {
                    return (
                      <div className="admin-rich-editor overflow-hidden rounded-2xl border border-[var(--line)] bg-white">
                        <ReactQuill theme="snow" value={controllerField.value || ''} onChange={controllerField.onChange} />
                      </div>
                    );
                  }
                  if (field.type === 'image') {
                    return (
                      <div className="space-y-3 rounded-[22px] border-2 border-dashed border-[#d8d1e9] bg-[#faf9fd] p-4">
                        {mediaLibrary.length > 0 && (
                          <Select
                            className="w-full"
                            showSearch
                            optionFilterProp="label"
                            placeholder="Choose an existing image from the media library"
                            value={controllerField.value || undefined}
                            onChange={controllerField.onChange}
                            options={mediaLibrary.map(media => ({ label: `${media.name} · ${media.folder}`, value: media.url }))}
                          />
                        )}
                        {controllerField.value ? (
                          <div className="group relative overflow-hidden rounded-2xl">
                            <img src={controllerField.value} alt="Current preview" className="h-56 w-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-[var(--ink)]/55 opacity-0 transition group-hover:opacity-100">
                              <Upload customRequest={options => uploadImage(options, field.name)} showUploadList={false} accept="image/*">
                                <Button icon={<UploadCloud size={16} />}>Replace image</Button>
                              </Upload>
                              <Button danger icon={<Trash2 size={16} />} onClick={() => controllerField.onChange('')}>Remove</Button>
                            </div>
                          </div>
                        ) : (
                          <Upload customRequest={options => uploadImage(options, field.name)} showUploadList={false} accept="image/*" className="block">
                            <button type="button" className="flex w-full flex-col items-center justify-center py-9 text-center">
                              <span className="grid h-14 w-14 place-items-center rounded-[18px] bg-[var(--lavender)] text-[var(--violet)]"><UploadCloud size={25} /></span>
                              <span className="mt-4 font-bold text-[var(--ink)]">Choose an image</span>
                              <span className="mt-1 text-xs text-[var(--muted)]">JPG, PNG or WebP</span>
                            </button>
                          </Upload>
                        )}
                      </div>
                    );
                  }
                  if (field.type === 'image-gallery') {
                    const images = controllerField.value || [];
                    return (
                      <div className="rounded-[22px] border-2 border-dashed border-[#d8d1e9] bg-[#faf9fd] p-4">
                        {mediaLibrary.length > 0 && (
                          <Select
                            mode="multiple"
                            className="mb-4 w-full"
                            showSearch
                            optionFilterProp="label"
                            placeholder="Add images from the media library"
                            value={images}
                            onChange={controllerField.onChange}
                            options={mediaLibrary.map(media => ({ label: `${media.name} · ${media.folder}`, value: media.url }))}
                          />
                        )}
                        {images.length > 0 && (
                          <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                            {images.map((url: string, index: number) => (
                              <div className="group relative aspect-square overflow-hidden rounded-2xl bg-white" key={`${url}-${index}`}>
                                <img src={url} alt={`Product view ${index + 1}`} className="h-full w-full object-cover" />
                                <button
                                  type="button"
                                  aria-label={`Remove image ${index + 1}`}
                                  onClick={() => controllerField.onChange(images.filter((_: string, imageIndex: number) => imageIndex !== index))}
                                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white text-[var(--coral)] opacity-100 shadow-md transition hover:bg-[var(--coral)] hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                                >
                                  <X size={15} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <Upload customRequest={options => uploadImage(options, field.name, images)} showUploadList={false} accept="image/*" multiple>
                          <Button icon={<ImageIcon size={16} />} className="!h-11 !rounded-xl">{images.length ? 'Add more images' : 'Upload product images'}</Button>
                        </Upload>
                        <span className="ml-3 text-xs text-[var(--muted)]">{images.length} image{images.length === 1 ? '' : 's'} added</span>
                      </div>
                    );
                  }
                  return <Input id={field.name} placeholder={`Enter ${field.label.toLowerCase()}`} {...controllerField} />;
                }}
              />
              {fieldError && <p className="mt-2 text-xs font-semibold text-[var(--coral)]">{String(fieldError.message)}</p>}
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 z-10 flex flex-col-reverse justify-between gap-3 border-t border-[var(--line)] bg-white/92 px-5 py-4 backdrop-blur-xl sm:flex-row sm:items-center md:px-7">
        <p className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <span className={`grid h-6 w-6 place-items-center rounded-full ${isDirty ? 'bg-[#fff1dc] text-[#b66b00]' : 'bg-[#e5f8ec] text-[#16864a]'}`}>
            {isDirty ? <Info size={13} /> : <Check size={13} />}
          </span>
          {isDirty ? 'You have unsaved changes' : editItem ? 'No changes yet' : 'Complete the required fields'}
        </p>
        <div className="flex gap-2">
          <Button size="large" onClick={onCancel} className="!h-12 !rounded-full !px-6">Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={submitting}
            icon={<Save size={17} />}
            className="!h-12 !rounded-full !px-7 !font-bold !shadow-[0_10px_22px_rgba(108,76,255,.22)]"
          >
            {editItem ? 'Save changes' : 'Create item'}
          </Button>
        </div>
      </div>
    </form>
  );
}
