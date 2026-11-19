import React, { useState, useEffect } from 'react';
import { useRestaurant, STATIONS } from '../../context/RestaurantContext';

const ALLERGEN_OPTIONS = ['Dairy', 'Nuts', 'Gluten', 'Egg', 'Soy', 'Shellfish', 'Sesame'];
const COMMON_CATEGORIES = ['Mains', 'Starters', 'Breads', 'Drinks', 'Desserts', 'Snacks'];

const FOOD_PRESETS = [
  { name: 'Paneer Makhani', emoji: '🍛', cat: 'Mains', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=400&q=80' },
  { name: 'Veg Biryani', emoji: '🍚', cat: 'Mains', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80' },
  { name: 'Dal Makhani', emoji: '🥘', cat: 'Mains', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80' },
  { name: 'Garlic Naan', emoji: '🫓', cat: 'Breads', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=400&q=80' },
  { name: 'Paneer Tikka', emoji: '🍢', cat: 'Starters', url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=400&q=80' },
  { name: 'Veg Pizza', emoji: '🍕', cat: 'Mains', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80' },
  { name: 'Crispy Burger', emoji: '🍔', cat: 'Snacks', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80' },
  { name: 'Hakka Noodles', emoji: '🍜', cat: 'Starters', url: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&q=80' },
  { name: 'Crispy Samosa', emoji: '🥟', cat: 'Snacks', url: 'https://images.unsplash.com/photo-1601050690187-54d924d5b244?auto=format&fit=crop&w=400&q=80' },
  { name: 'Masala Dosa', emoji: '🥞', cat: 'Mains', url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80' },
  { name: 'Mango Lassi', emoji: '🥭', cat: 'Drinks', url: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80' },
  { name: 'Masala Chai', emoji: '🍵', cat: 'Drinks', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80' },
  { name: 'Gulab Jamun', emoji: '🍮', cat: 'Desserts', url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80' },
  { name: 'Green Salad', emoji: '🥗', cat: 'Starters', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80' },
];

export default function MenuModal() {
  const { menuModalDish, setMenuModalDish, saveDish, deleteDish } = useRestaurant();

  const isNew = !menuModalDish?.id;
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    desc: '',
    cat: 'Mains',
    station: 'CURRY',
    prep: 10,
    emoji: '🍽️',
    al: [],
    size: false,
    spice: false,
    img: '',
    avail: true,
  });
  const [imgTab, setImgTab] = useState('gallery'); // 'gallery' | 'upload' | 'url'
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (menuModalDish) {
      setFormData({
        id: menuModalDish.id || null,
        name: menuModalDish.name || '',
        price: menuModalDish.price !== undefined ? String(menuModalDish.price) : '',
        desc: menuModalDish.desc || '',
        cat: menuModalDish.cat || 'Mains',
        station: menuModalDish.station || 'CURRY',
        prep: menuModalDish.prep || 10,
        emoji: menuModalDish.emoji || '🍽️',
        al: Array.isArray(menuModalDish.al) ? [...menuModalDish.al] : [],
        size: !!menuModalDish.size,
        spice: !!menuModalDish.spice,
        img: menuModalDish.img || '',
        avail: menuModalDish.avail !== false,
      });
      setUrlInput(menuModalDish.img || '');
      setImgTab(menuModalDish.img ? 'upload' : 'gallery');
      setError('');
      setConfirmDelete(false);
    }
  }, [menuModalDish]);

  if (!menuModalDish) return null;

  const handleImageFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    processImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  };

  const processImageFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        const canvas = document.createElement('canvas');
        canvas.width = 450;
        canvas.height = 450;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, side, side, 0, 0, 450, 450);
        const compressedUrl = canvas.toDataURL('image/jpeg', 0.85);
        setFormData((prev) => ({ ...prev, img: compressedUrl }));
        setUrlInput('');
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (preset) => {
    setFormData((prev) => ({
      ...prev,
      img: preset.url,
      name: prev.name.trim() ? prev.name : preset.name,
      emoji: preset.emoji,
      cat: prev.name.trim() ? prev.cat : (preset.cat || prev.cat),
    }));
  };

  const handleUrlApply = () => {
    if (urlInput.trim()) {
      setFormData((prev) => ({ ...prev, img: urlInput.trim() }));
    }
  };

  const handleAllergenToggle = (allergen) => {
    setFormData((prev) => {
      const exists = prev.al.includes(allergen);
      return {
        ...prev,
        al: exists ? prev.al.filter((a) => a !== allergen) : [...prev.al, allergen],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return setError('Please enter a dish name');
    }
    const priceNum = Number(formData.price);
    if (!priceNum || priceNum <= 0) {
      return setError('Please enter a valid price above ₹0');
    }

    saveDish({
      ...formData,
      price: priceNum,
      prep: Number(formData.prep) || 10,
    });
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteDish(menuModalDish.id);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-5 sm:p-6 w-full max-w-2xl text-[#F2EEE8] shadow-2xl animate-rin my-auto max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2A2A2A]">
          <div>
            <h3 className="text-lg font-black tracking-tight text-[#F2EEE8]">
              {isNew ? '✨ Add New Dish to Menu' : `✎ Edit Dish: ${formData.name}`}
            </h3>
            <p className="text-xs text-[#8D8780] mt-0.5">
              Select or upload an image — dish will be auto-listed live on guest menu
            </p>
          </div>
          <button
            onClick={() => setMenuModalDish(null)}
            className="w-8 h-8 rounded-full bg-[#2A2A2A] hover:bg-[#333] text-[#8D8780] hover:text-white flex items-center justify-center text-sm transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PHOTO SELECTION SECTION */}
          <div className="bg-[#1F1F1F] p-4 rounded-2xl border border-[#2F2F2F] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-[#ff7a47] flex items-center gap-1.5">
                <span>📸</span> Dish Image &amp; Visual
              </label>

              {/* Source Tabs */}
              <div className="flex gap-1 bg-[#141414] p-1 rounded-xl border border-[#2A2A2A] text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setImgTab('gallery')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    imgTab === 'gallery'
                      ? 'bg-[#F25C2A] text-white shadow'
                      : 'text-[#8D8780] hover:text-white'
                  }`}
                >
                  🍱 Photo Gallery
                </button>
                <button
                  type="button"
                  onClick={() => setImgTab('upload')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    imgTab === 'upload'
                      ? 'bg-[#F25C2A] text-white shadow'
                      : 'text-[#8D8780] hover:text-white'
                  }`}
                >
                  📁 Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImgTab('url')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    imgTab === 'url'
                      ? 'bg-[#F25C2A] text-white shadow'
                      : 'text-[#8D8780] hover:text-white'
                  }`}
                >
                  🔗 Image URL
                </button>
              </div>
            </div>

            {/* Live Preview Box */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-[#171717] p-3 rounded-xl border border-[#282828]">
              {/* Selected Image Thumbnail */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex-none bg-[#242424] text-4xl grid place-items-center overflow-hidden border-2 border-[#383838] shadow-md group">
                {formData.img ? (
                  <>
                    <img
                      src={formData.img}
                      alt="Dish preview"
                      className="w-full h-full object-cover"
                      onError={() => setFormData((prev) => ({ ...prev, img: '' }))}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, img: '' }));
                        setUrlInput('');
                      }}
                      className="absolute top-1 right-1 bg-black/80 hover:bg-[#EF4444] text-white w-6 h-6 rounded-full text-xs font-black flex items-center justify-center transition shadow"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <span className="text-4xl animate-pulse">{formData.emoji || '🍽️'}</span>
                )}
              </div>

              {/* Status / Instructions */}
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <div className="text-xs font-bold text-[#F2EEE8]">
                  {formData.img ? '✓ Photo Selected & Ready' : 'No photo chosen (Emoji will be used)'}
                </div>
                <p className="text-[11px] text-[#8D8780]">
                  This high-definition photo will be auto-listed on guest table screens and staff KDS orders immediately.
                </p>
                {formData.img && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, img: '' }));
                      setUrlInput('');
                    }}
                    className="text-[11px] font-bold text-[#EF4444] hover:underline inline-block mt-1"
                  >
                    Remove photo and use emoji
                  </button>
                )}
              </div>
            </div>

            {/* TAB 1: CURATED FOOD PRESET GALLERY */}
            {imgTab === 'gallery' && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] text-[#8D8780] font-semibold block">
                  Click any food photo below to select it instantly:
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 max-h-48 overflow-y-auto p-1 bg-[#141414] rounded-xl border border-[#252525]">
                  {FOOD_PRESETS.map((p) => {
                    const isSelected = formData.img === p.url;
                    return (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => handlePresetSelect(p)}
                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition transform active:scale-95 ${
                          isSelected
                            ? 'border-[#F25C2A] ring-2 ring-[#F25C2A]/50 scale-102'
                            : 'border-[#2D2D2D] hover:border-[#F25C2A]/60'
                        }`}
                      >
                        <img
                          src={p.url}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-end p-1 opacity-0 group-hover:opacity-100 transition">
                          <span className="text-[9px] font-extrabold text-white leading-tight truncate">
                            {p.name}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-[#F25C2A] text-white w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center shadow">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: UPLOAD FILE / DRAG & DROP */}
            {imgTab === 'upload' && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-[#383838] hover:border-[#F25C2A] bg-[#141414] rounded-xl p-5 text-center transition cursor-pointer"
              >
                <input
                  type="file"
                  id="dish-file-input"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
                <label htmlFor="dish-file-input" className="cursor-pointer space-y-1 block">
                  <div className="text-2xl">📤</div>
                  <div className="text-xs font-bold text-[#F2EEE8]">
                    Click to browse or drag &amp; drop dish image
                  </div>
                  <div className="text-[11px] text-[#8D8780]">
                    PNG, JPG, WEBP accepted (automatically resized for fast loading)
                  </div>
                </label>
              </div>
            )}

            {/* TAB 3: PASTE WEB IMAGE URL */}
            {imgTab === 'url' && (
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/dish-photo.jpg"
                  className="flex-1 bg-[#141414] text-[#F2EEE8] border border-[#333] focus:border-[#F25C2A] rounded-xl px-3 py-2 text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={handleUrlApply}
                  className="bg-[#2A2A2A] hover:bg-[#383838] text-white px-4 py-2 rounded-xl text-xs font-bold border border-[#383838]"
                >
                  Set URL
                </button>
              </div>
            )}
          </div>

          {/* DISH DETAILS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#8D8780] mb-1">Dish Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Paneer Makhani"
                maxLength={60}
                className="w-full bg-[#0F0F0F] text-[#F2EEE8] border border-[#333] focus:border-[#F25C2A] rounded-xl px-3 py-2 text-xs outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8D8780] mb-1">Price (₹) *</label>
              <input
                type="number"
                min="1"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="320"
                className="w-full bg-[#0F0F0F] text-[#F2EEE8] border border-[#333] focus:border-[#F25C2A] rounded-xl px-3 py-2 text-xs outline-none font-mono"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#8D8780] mb-1">Description</label>
              <textarea
                rows={2}
                maxLength={140}
                value={formData.desc}
                onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                placeholder="Short, mouthwatering description for the guest menu"
                className="w-full bg-[#0F0F0F] text-[#F2EEE8] border border-[#333] focus:border-[#F25C2A] rounded-xl px-3 py-2 text-xs outline-none"
              />
            </div>

            {/* Category with quick pills */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#8D8780] mb-1">Category (auto-creates filter chip on guest menu)</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {COMMON_CATEGORIES.map((catName) => (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => setFormData({ ...formData, cat: catName })}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition ${
                      formData.cat === catName
                        ? 'bg-[#F25C2A] text-white border-[#F25C2A]'
                        : 'bg-[#212121] border-[#333] text-[#8D8780] hover:text-[#F2EEE8]'
                    }`}
                  >
                    {catName}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={formData.cat}
                onChange={(e) => setFormData({ ...formData, cat: e.target.value })}
                placeholder="Or type custom category e.g. Chaat, Mocktails..."
                className="w-full bg-[#0F0F0F] text-[#F2EEE8] border border-[#333] focus:border-[#F25C2A] rounded-xl px-3 py-2 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8D8780] mb-1">Kitchen Station</label>
              <select
                value={formData.station}
                onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                className="w-full bg-[#0F0F0F] text-[#F2EEE8] border border-[#333] focus:border-[#F25C2A] rounded-xl px-3 py-2 text-xs outline-none"
              >
                {STATIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8D8780] mb-1">Prep Time (minutes)</label>
              <input
                type="number"
                min="1"
                value={formData.prep}
                onChange={(e) => setFormData({ ...formData, prep: Number(e.target.value) })}
                className="w-full bg-[#0F0F0F] text-[#F2EEE8] border border-[#333] focus:border-[#F25C2A] rounded-xl px-3 py-2 text-xs outline-none font-mono"
              />
            </div>
          </div>

          {/* Allergens Selection */}
          <div>
            <label className="block text-xs font-bold text-[#8D8780] mb-1.5">Allergens</label>
            <div className="flex gap-2 flex-wrap">
              {ALLERGEN_OPTIONS.map((al) => {
                const checked = formData.al.includes(al);
                return (
                  <button
                    key={al}
                    type="button"
                    onClick={() => handleAllergenToggle(al)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                      checked
                        ? 'bg-[#F25C2A]/20 border-[#F25C2A] text-[#ff7a47]'
                        : 'bg-[#212121] border-[#333] text-[#8D8780] hover:text-[#F2EEE8]'
                    }`}
                  >
                    {al}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options Toggles */}
          <div className="flex gap-3 flex-wrap pt-1">
            <label className="flex items-center gap-2 cursor-pointer bg-[#212121] border border-[#333] px-3 py-2 rounded-xl text-xs font-bold">
              <input
                type="checkbox"
                checked={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.checked })}
                className="accent-[#F25C2A]"
              />
              <span>Half / Full sizes</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-[#212121] border border-[#333] px-3 py-2 rounded-xl text-xs font-bold">
              <input
                type="checkbox"
                checked={formData.spice}
                onChange={(e) => setFormData({ ...formData, spice: e.target.checked })}
                className="accent-[#F25C2A]"
              />
              <span>Spice level option</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer bg-[#212121] border border-[#333] px-3 py-2 rounded-xl text-xs font-bold">
              <input
                type="checkbox"
                checked={formData.avail}
                onChange={(e) => setFormData({ ...formData, avail: e.target.checked })}
                className="accent-[#F25C2A]"
              />
              <span>Available on menu</span>
            </label>
          </div>

          {error && <div className="text-xs font-bold text-[#EF4444] pt-1">{error}</div>}

          {/* Footer Controls */}
          <div className="flex items-center gap-2 pt-3 border-t border-[#2A2A2A]">
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-[#EF4444] bg-[#2A2A2A] hover:bg-[#EF4444]/20 border border-[#333] transition"
              >
                {confirmDelete ? 'Tap again to delete' : '🗑 Delete'}
              </button>
            )}

            <button
              type="button"
              onClick={() => setMenuModalDish(null)}
              className="ml-auto py-2.5 px-4 rounded-xl text-xs font-bold text-[#8D8780] hover:text-[#F2EEE8] bg-[#2A2A2A] border border-[#333] transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl text-xs font-extrabold text-white bg-[#F25C2A] hover:bg-[#e04d1d] shadow-md transition transform active:scale-95 flex items-center gap-1.5"
            >
              <span>✓</span>
              <span>{isNew ? 'Add Dish & Auto-List' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
