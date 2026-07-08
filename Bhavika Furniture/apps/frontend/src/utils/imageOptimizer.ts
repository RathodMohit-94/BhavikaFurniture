export function optimizeImage(url: string, width = 800): string {
  if (!url) return '';
  
  // Only optimize Unsplash images for now
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      
      // Force next-gen webp format and lower quality for massive performance gain
      urlObj.searchParams.set('fm', 'webp');
      urlObj.searchParams.set('q', '75');
      
      // Override width if it's currently set too high
      const currentWidth = urlObj.searchParams.get('w');
      if (!currentWidth || parseInt(currentWidth, 10) > width) {
        urlObj.searchParams.set('w', width.toString());
      }
      
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }
  
  return url;
}
