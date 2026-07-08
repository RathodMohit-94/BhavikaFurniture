import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Send, Store } from 'lucide-react';
import { getStoreContent } from '../../services/storefrontApi';

export default function ContactPage() {
  const [searchParams] = useSearchParams();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [phones, setPhones] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    Promise.all([
      getStoreContent('contact_addresses'),
      getStoreContent('contact_phones'),
      getStoreContent('contact_emails'),
      getStoreContent('contact_locations')
    ])
    .then(([addressesRes, phonesRes, emailsRes, locationsRes]) => {
      setAddresses(addressesRes.filter((a: any) => a.active === 'true' || a.active === true));
      setPhones(phonesRes.filter((p: any) => p.active === 'true' || p.active === true));
      setEmails(emailsRes.filter((e: any) => e.active === 'true' || e.active === true));
      setLocations(locationsRes.filter((l: any) => l.active === 'true' || l.active === true));
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    (e.target as HTMLFormElement).reset();
  };

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--color-terracotta)]"></div>
    </div>
  );

  return (
    <div className="py-24 px-6 max-w-7xl mx-auto font-sans">
      <div className="text-center mb-20">
        <h1 className="text-5xl font-extrabold text-[var(--color-dark-wood)] mb-4">Get in Touch</h1>
        <p className="text-xl text-[var(--color-terracotta)] font-medium">
          Have a question about our products? We're here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Contact Info */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <h2 className="text-3xl font-bold text-[var(--color-dark-wood)] mb-6">Contact Information</h2>
          
          {/* Addresses */}
          {addresses.length > 0 && addresses.map(address => (
            <div key={address.id} className="bg-[#FFF8F3] p-8 rounded-2xl flex items-start gap-6 border border-[#E8D3C3] shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-white p-4 rounded-full shadow-sm flex-shrink-0">
                <MapPin className="text-[var(--color-terracotta)]" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--color-dark-wood)] mb-2">Office Address</h3>
                <p className="text-gray-600 leading-relaxed">
                  {address.street}<br/>
                  {address.city}, {address.state} {address.zip}<br/>
                  {address.country}
                </p>
              </div>
            </div>
          ))}

          {/* Phones */}
          {phones.length > 0 && phones.map(phone => (
            <div key={phone.id} className="bg-[#FFF8F3] p-8 rounded-2xl flex items-start gap-6 border border-[#E8D3C3] shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-white p-4 rounded-full shadow-sm flex-shrink-0">
                <Phone className="text-[var(--color-terracotta)]" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--color-dark-wood)] mb-2">{phone.label}</h3>
                <p className="text-gray-600 leading-relaxed font-semibold">{phone.number}</p>
              </div>
            </div>
          ))}

          {/* Emails */}
          {emails.length > 0 && emails.map(email => (
            <div key={email.id} className="bg-[#FFF8F3] p-8 rounded-2xl flex items-start gap-6 border border-[#E8D3C3] shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-white p-4 rounded-full shadow-sm flex-shrink-0">
                <Mail className="text-[var(--color-terracotta)]" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--color-dark-wood)] mb-2">{email.label}</h3>
                <p className="text-gray-600 leading-relaxed font-semibold">{email.email}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
            <h2 className="text-3xl font-bold text-[var(--color-dark-wood)] mb-8">Send a Message</h2>
            
            {submitted ? (
              <div className="bg-green-50 text-green-700 p-6 rounded-2xl border border-green-200 mb-8 font-medium text-lg text-center">
                Thank you for reaching out! We will get back to you soon.
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">Your Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="John Doe"
                    className="px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-terracotta)] transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">Your Email</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="john@example.com"
                    className="px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-terracotta)] transition-all bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700">Subject</label>
                <input 
                  type="text" 
                  required 
                  placeholder="How can we help you?"
                  className="px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-terracotta)] transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-semibold text-gray-700">Message</label>
                <textarea 
                  required 
                  rows={6} 
                  defaultValue={searchParams.get('message') || ''}
                  placeholder="Write your message here..."
                  className="px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-terracotta)] transition-all bg-gray-50 focus:bg-white resize-none"
                />
              </div>

              <button 
                type="submit" 
                className="mt-4 flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold bg-[var(--color-terracotta)] text-white rounded-xl shadow-md hover:bg-orange-700 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 w-full sm:w-auto self-start"
              >
                Send Message <Send size={20} />
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Store Locations */}
      {locations.length > 0 && (
        <div className="mt-32">
          <h2 className="text-4xl font-bold text-center text-[var(--color-dark-wood)] mb-16">Our Store Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.map(store => (
              <div key={store.id} className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow group">
                <div className="h-64 overflow-hidden relative">
                  <div 
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundImage: `url("${store.image}")` }}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-sm">
                    <Store className="text-[var(--color-terracotta)]" size={24} />
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-[var(--color-dark-wood)] mb-3">{store.name}</h3>
                  <div className="flex items-start gap-3 text-gray-600">
                    <MapPin className="text-[var(--color-terracotta)] flex-shrink-0 mt-1" size={20} />
                    <p className="leading-relaxed">{store.address}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
