import React, { useEffect, useState } from 'react';
import { getStoreContent } from '../../services/storefrontApi';
import { optimizeImage } from '../../utils/imageOptimizer';

export default function AboutPage() {
  const [settings, setSettings] = useState<any>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getStoreContent('about_page'),
      getStoreContent('about_team'),
      getStoreContent('about_gallery')
    ])
    .then(([pageRes, teamRes, galleryRes]) => {
      if (pageRes.length > 0) {
        setSettings(pageRes[0]);
      }
      setTeam(teamRes.filter((m: any) => m.active === 'true' || m.active === true));
      setGallery(galleryRes);
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--color-terracotta)]"></div>
    </div>
  );

  const title = settings?.about_title || 'Our Story';
  const story = settings?.about_story || '<p>Founded with a passion for exceptional design...</p>';
  const image = settings?.about_image || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="font-sans pb-24">
      {/* Hero Section */}
      <div className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="h-[500px] w-full rounded-3xl shadow-2xl overflow-hidden relative group">
            <div 
              className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
              style={{ backgroundImage: `url("${optimizeImage(image, 800)}")` }}
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-5xl font-extrabold text-[var(--color-dark-wood)] mb-8">{title}</h1>
            <div 
              className="prose prose-lg text-gray-600 mb-8"
              dangerouslySetInnerHTML={{ __html: story }}
            />
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <div className="bg-[#FFF8F3] py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-[var(--color-dark-wood)] mb-16">Our Workshop & Showrooms</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {gallery.map(item => (
                <div key={item.id} className="rounded-2xl overflow-hidden shadow-md group h-72 relative">
                  <div 
                    className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundImage: `url("${item.image}")` }}
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <h3 className="text-white font-bold text-xl drop-shadow-md">{item.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Team Section */}
      {team.length > 0 && (
        <div className="py-24 px-6 max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-[var(--color-dark-wood)] mb-16">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {team.map(member => (
              <div key={member.id} className="flex flex-col items-center text-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <img src={optimizeImage(member.image, 300)} alt={member.name} loading="lazy" className="w-40 h-40 rounded-full object-cover mb-6 border-4 border-[#FFF8F3] shadow-md" />
                <h3 className="text-2xl font-bold text-[var(--color-dark-wood)] mb-2">{member.name}</h3>
                <p className="text-[var(--color-terracotta)] font-semibold mb-6">{member.role}</p>
                <div 
                  className="prose text-gray-600 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: member.bio }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

