import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api.js';

const emptyService = () => ({ name: '', description: '', price: 0, duration: 30, image: { url: '', publicId: '' } });
const emptyCaseStudy = () => ({
  title: '',
  category: 'Other',
  description: '',
  treatmentDuration: '',
  beforeImage: { url: '', publicId: '' },
  afterImage: { url: '', publicId: '' },
  displayOrder: 0,
  isApproved: true,
});

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'https://dr-shivalika-saraswat-dental-1.onrender.com/api').replace(/\/api\/?$/, '');
const mediaUrl = (url) => (url?.startsWith('http') ? url : url ? `${API_ORIGIN}${url}` : '');

export default function ContentPage() {
  const [profile, setProfile] = useState(null);
  const [caseStudies, setCaseStudies] = useState([]);
  const [newCaseStudy, setNewCaseStudy] = useState(emptyCaseStudy());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingImages, setSavingImages] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingCaseId, setEditingCaseId] = useState(null);
  const [draftImages, setDraftImages] = useState({ beforeImage: null, afterImage: null });

  const stats = useMemo(() => ({
    serviceCount: profile?.services?.length || 0,
    caseCount: caseStudies.length,
  }), [profile, caseStudies]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/content');
      setProfile(data.data.profile);
      setCaseStudies(data.data.caseStudies || []);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateProfileField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const updateService = (index, field, value) => {
    setProfile((prev) => ({
      ...prev,
      services: (prev.services || []).map((service, i) => i === index ? { ...service, [field]: field === 'price' || field === 'duration' ? Number(value) || 0 : value } : service),
    }));
  };

  const addService = () => {
    setProfile((prev) => ({
      ...prev,
      services: [...(prev.services || []), emptyService()],
    }));
  };

  const removeService = (index) => {
    setProfile((prev) => ({
      ...prev,
      services: (prev.services || []).filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/admin/content/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateProfileField(field, { url: data.data.url, publicId: data.data.publicId });
      setSuccess('Image uploaded successfully.');
    } catch (e) {
      setError(e.response?.data?.message || 'Image upload failed');
    }
  };

  const handleServiceImageUpload = async (event, index) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/admin/content/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfile((prev) => ({
        ...prev,
        services: (prev.services || []).map((service, i) =>
          i === index ? { ...service, image: { url: data.data.url, publicId: data.data.publicId } } : service
        ),
      }));
      setSuccess('Service image uploaded. Click "Save content" to publish it.');
    } catch (e) {
      setError(e.response?.data?.message || 'Service image upload failed');
    }
  };

  const handleCaseImageUpload = async (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/admin/content/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewCaseStudy((prev) => ({
        ...prev,
        [field]: { url: data.data.url, publicId: data.data.publicId },
      }));
      setSuccess('Case image uploaded successfully.');
    } catch (e) {
      setError(e.response?.data?.message || 'Case image upload failed');
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        ...profile,
        services: (profile.services || []).map((service) => ({
          name: service.name,
          description: service.description,
          price: Number(service.price) || 0,
          duration: Number(service.duration) || 30,
          image: service.image?.url ? { url: service.image.url, publicId: service.image.publicId } : undefined,
        })),
      };

      await api.put('/admin/content/profile', payload);
      setSuccess('Content updates saved successfully.');
    } catch (e) {
      setError(e.response?.data?.message || 'Could not save profile content');
    } finally {
      setSaving(false);
    }
  };

  const createCaseStudy = async () => {
    setError('');
    setSuccess('');
    try {
      if (!newCaseStudy.title || !newCaseStudy.beforeImage.url || !newCaseStudy.afterImage.url) {
        throw new Error('Title, before image and after image are required');
      }

      await api.post('/admin/content/case-study', newCaseStudy);
      setNewCaseStudy(emptyCaseStudy());
      await load();
      setSuccess('Case Study created successfully.');
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Case study creation failed');
    }
  };

  const updateCaseStudy = async (id, payload) => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/admin/content/case-study/${id}`, payload);
      await load();
      setSuccess('Case study updated successfully.');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update case study');
    }
  };

  const removeCaseStudy = async (id) => {
    if (!window.confirm('Remove this case study permanently?')) return;
    try {
      await api.delete(`/admin/content/case-study/${id}`);
      setCaseStudies((prev) => prev.filter((item) => item._id !== id));
      setSuccess('Case study removed.');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to remove case study');
    }
  };

  // ── Advanced before/after image editing for existing case studies ──
  const openCaseImageEditor = (item) => {
    setEditingCaseId(item._id);
    setDraftImages({
      beforeImage: item.beforeImage?.url ? item.beforeImage : null,
      afterImage: item.afterImage?.url ? item.afterImage : null,
    });
    setError('');
    setSuccess('');
  };

  const handleEditCaseImageUpload = async (event, field) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await api.post('/admin/content/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setDraftImages((prev) => ({ ...prev, [field]: { url: data.data.url, publicId: data.data.publicId } }));
      setSuccess('Image uploaded — click "Save images" to publish.');
    } catch (e) {
      setError(e.response?.data?.message || 'Image upload failed');
    }
  };

  const removeDraftImage = (field) => {
    setDraftImages((prev) => ({ ...prev, [field]: null }));
  };

  const saveCaseImages = async () => {
    if (!editingCaseId) return;
    setSavingImages(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        beforeImage: draftImages.beforeImage?.url ? { url: draftImages.beforeImage.url, publicId: draftImages.beforeImage.publicId } : { url: '', publicId: '' },
        afterImage: draftImages.afterImage?.url ? { url: draftImages.afterImage.url, publicId: draftImages.afterImage.publicId } : { url: '', publicId: '' },
      };
      await api.put(`/admin/content/case-study/${editingCaseId}`, payload);
      setSuccess('Before/after images updated successfully.');
      setEditingCaseId(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to update case study images');
    } finally {
      setSavingImages(false);
    }
  };

  if (loading) return <p className="text-[#6E6D7A]">Loading content studio…</p>;
  if (!profile) return <p className="text-red-600">Unable to load content.</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="admin-pill">Content Studio</span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.06em] text-[#690A01]">Manage website content</h1>
        </div>
        <button onClick={saveProfile} disabled={saving} className="admin-button-primary disabled:opacity-60">
          {saving ? 'Saving…' : 'Save content'}
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="admin-card p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[#6E6D7A]">Services</p>
          <p className="mt-3 text-3xl font-extrabold text-[#690A01]">{stats.serviceCount}</p>
        </div>
        <div className="admin-card p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[#6E6D7A]">Case studies</p>
          <p className="mt-3 text-3xl font-extrabold text-[#D33616]">{stats.caseCount}</p>
        </div>
        <div className="admin-card p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[#6E6D7A]">Experience</p>
          <p className="mt-3 text-3xl font-extrabold text-[#C98A3A]">{profile.experience || 0} yrs</p>
        </div>
        <div className="admin-card p-5">
          <p className="text-xs uppercase tracking-[0.14em] text-[#6E6D7A]">Booking status</p>
          <p className="mt-3 text-xl font-bold text-[#1A7A54]">{profile.bookingEnabled ? 'Live' : 'Paused'}</p>
        </div>
      </div>

      <div className="admin-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#690A01]">Doctor profile</h2>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#E9D7CF] bg-white/70 px-3 py-2 text-sm font-medium text-[#690A01]">
            Upload image
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'profileImage')} />
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="field-label">First name</label>
            <input value={profile.firstName || ''} onChange={(e) => updateProfileField('firstName', e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="field-label">Last name</label>
            <input value={profile.lastName || ''} onChange={(e) => updateProfileField('lastName', e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="field-label">Email</label>
            <input value={profile.email || ''} onChange={(e) => updateProfileField('email', e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="field-label">Phone</label>
            <input value={profile.phone || ''} onChange={(e) => updateProfileField('phone', e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="field-label">Specialization</label>
            <input value={profile.specialization || ''} onChange={(e) => updateProfileField('specialization', e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="field-label">Experience (years)</label>
            <input type="number" value={profile.experience || 0} onChange={(e) => updateProfileField('experience', Number(e.target.value))} className="admin-input" />
          </div>
          <div>
            <label className="field-label">LinkedIn</label>
            <input value={profile.linkedinUrl || ''} onChange={(e) => updateProfileField('linkedinUrl', e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="field-label">Website</label>
            <input value={profile.websiteUrl || ''} onChange={(e) => updateProfileField('websiteUrl', e.target.value)} className="admin-input" />
          </div>
          <div className="md:col-span-2">
            <label className="field-label">Booking availability</label>
            <div className="flex items-center gap-3 rounded-2xl border border-[#F0DDCF] bg-[#fffaf8] px-4 py-3">
              <input type="checkbox" checked={Boolean(profile.bookingEnabled)} onChange={(e) => updateProfileField('bookingEnabled', e.target.checked)} className="h-4 w-4 accent-[#D33616]" />
              <span className="text-sm text-[#403E45]">Booking is currently live</span>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <label className="field-label">Short bio</label>
          <textarea rows={4} value={profile.bio || ''} onChange={(e) => updateProfileField('bio', e.target.value)} className="admin-input" />
        </div>

        {profile.profileImage?.url && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-[#F1D9D0] bg-[#FFF7F4] p-3">
                    <img src={mediaUrl(profile.profileImage.url)} alt="Profile preview" className="h-40 w-full rounded-xl object-cover" />
          </div>
        )}
      </div>

      <div className="admin-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#690A01]">Services & pricing</h2>
          <button type="button" onClick={addService} className="admin-button-secondary">Add service</button>
        </div>

        <div className="space-y-4">
          {(profile.services || []).map((service, index) => (
            <div key={`${service.name || 'service'}-${index}`} className="rounded-2xl border border-[#F0DDCF] bg-[#fffaf8] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold uppercase tracking-[0.12em] text-[#D33616]">Service {index + 1}</span>
                <button type="button" onClick={() => removeService(index)} className="text-xs font-medium text-red-600 hover:underline">Remove</button>
              </div>

              <div className="mb-4">
                <label className="field-label">Card image</label>
                <div className="flex flex-wrap items-center gap-4">
                  {service.image?.url ? (
                    <img src={mediaUrl(service.image.url)} alt={service.name || 'Service'} className="h-20 w-32 rounded-xl object-cover ring-1 ring-[#F0DDCF]" />
                  ) : (
                    <span className="text-xs text-[#6E6D7A]">No custom image yet — the public site shows a default curated photo.</span>
                  )}
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#E9D7CF] bg-[#fffaf8] px-4 py-2.5 text-sm font-medium text-[#690A01]">
                    {service.image?.url ? 'Replace image' : 'Upload image'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleServiceImageUpload(e, index)} />
                  </label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="field-label">Name</label>
                  <input value={service.name || ''} onChange={(e) => updateService(index, 'name', e.target.value)} className="admin-input" />
                </div>
                <div>
                  <label className="field-label">Price</label>
                  <input type="number" value={service.price || 0} onChange={(e) => updateService(index, 'price', e.target.value)} className="admin-input" />
                </div>
                <div className="md:col-span-2">
                  <label className="field-label">Description</label>
                  <textarea rows={3} value={service.description || ''} onChange={(e) => updateService(index, 'description', e.target.value)} className="admin-input" />
                </div>
                <div>
                  <label className="field-label">Duration (minutes)</label>
                  <input type="number" value={service.duration || 30} onChange={(e) => updateService(index, 'duration', e.target.value)} className="admin-input" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin-card p-6">
        <h2 className="mb-5 text-xl font-bold text-[#690A01]">Add new case story</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label">Title</label>
            <input value={newCaseStudy.title} onChange={(e) => setNewCaseStudy((prev) => ({ ...prev, title: e.target.value }))} className="admin-input" />
          </div>
          <div>
            <label className="field-label">Category</label>
            <select value={newCaseStudy.category} onChange={(e) => setNewCaseStudy((prev) => ({ ...prev, category: e.target.value }))} className="admin-input">
              {['Full Mouth Rehabilitation', 'Teeth Whitening', 'Aligners', 'Veneers', 'Implants', 'Other'].map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="field-label">Description</label>
            <textarea rows={3} value={newCaseStudy.description} onChange={(e) => setNewCaseStudy((prev) => ({ ...prev, description: e.target.value }))} className="admin-input" />
          </div>
          <div>
            <label className="field-label">Treatment duration</label>
            <input value={newCaseStudy.treatmentDuration} onChange={(e) => setNewCaseStudy((prev) => ({ ...prev, treatmentDuration: e.target.value }))} className="admin-input" />
          </div>
          <div>
            <label className="field-label">Display order</label>
            <input type="number" value={newCaseStudy.displayOrder} onChange={(e) => setNewCaseStudy((prev) => ({ ...prev, displayOrder: Number(e.target.value) }))} className="admin-input" />
          </div>
          <div>
            <label className="field-label">Before image</label>
            <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#E9D7CF] bg-[#fffaf8] px-4 py-3 text-sm font-medium text-[#690A01]">
              {newCaseStudy.beforeImage.url ? 'Replace before image' : 'Upload before image'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCaseImageUpload(e, 'beforeImage')} />
            </label>
            {newCaseStudy.beforeImage.url && <img src={newCaseStudy.beforeImage.url} alt="Before preview" className="mt-3 h-24 w-full rounded-xl object-cover" />}
          </div>
          <div>
            <label className="field-label">After image</label>
            <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#E9D7CF] bg-[#fffaf8] px-4 py-3 text-sm font-medium text-[#690A01]">
              {newCaseStudy.afterImage.url ? 'Replace after image' : 'Upload after image'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleCaseImageUpload(e, 'afterImage')} />
            </label>
            {newCaseStudy.afterImage.url && <img src={newCaseStudy.afterImage.url} alt="After preview" className="mt-3 h-24 w-full rounded-xl object-cover" />}
          </div>
        </div>
        <div className="mt-5">
          <button onClick={createCaseStudy} className="admin-button-primary">Create case study</button>
        </div>
      </div>

      <div className="admin-card p-6">
        <h2 className="mb-5 text-xl font-bold text-[#690A01]">Case studies</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {caseStudies.map((item) => (
            <div key={item._id} className="overflow-hidden rounded-2xl border border-[#F1D9D0] bg-[#fffaf8]">
              <img src={mediaUrl(item.beforeImage?.url)} alt={item.title} className="h-36 w-full object-cover" />
              <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#D33616]">{item.category}</p>
                <h3 className="mt-2 text-lg font-bold text-[#690A01]">{item.title}</h3>
                <p className="mt-2 text-sm text-[#6E6D7A]">{item.description}</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => updateCaseStudy(item._id, { isApproved: !item.isApproved })} className="admin-button-secondary flex-1 text-center">
                    {item.isApproved ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={() => openCaseImageEditor(item)} className="rounded-xl border border-[#D33616]/30 bg-[#D33616]/5 px-3 py-2 text-sm font-medium text-[#D33616] hover:bg-[#D33616]/10">
                    Edit Images
                  </button>
                  <button onClick={() => removeCaseStudy(item._id)} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">Delete</button>
                </div>
                <a href={item.afterImage?.url} target="_blank" rel="noreferrer" className="mt-2 block text-center text-sm font-medium text-[#690A01] underline">Open after image</a>
              </div>

              {editingCaseId === item._id && (
                <div className="border-t border-[#F1D9D0] bg-[#FFF7F4] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#D33616]">Advanced — before / after images</p>
                    <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-[#6E6D7A]">Click Save images to publish</span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="field-label">Before image</label>
                      {draftImages.beforeImage?.url ? (
                        <div className="relative">
                          <img src={mediaUrl(draftImages.beforeImage.url)} alt="Before" className="h-28 w-full rounded-xl object-cover ring-1 ring-[#F0DDCF]" />
                          <button onClick={() => removeDraftImage('beforeImage')} className="absolute right-2 top-2 rounded-full border border-red-200 bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-red-600 shadow-sm hover:bg-red-50">Remove</button>
                        </div>
                      ) : (
                        <p className="mb-2 text-xs italic text-[#6E6D7A]">No before image selected</p>
                      )}
                      <label className="mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#E9D7CF] bg-[#fffaf8] px-3 py-2 text-sm font-medium text-[#690A01]">
                        {draftImages.beforeImage?.url ? 'Replace before image' : 'Upload before image'}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleEditCaseImageUpload(e, 'beforeImage')} />
                      </label>
                    </div>

                    <div>
                      <label className="field-label">After image</label>
                      {draftImages.afterImage?.url ? (
                        <div className="relative">
                          <img src={mediaUrl(draftImages.afterImage.url)} alt="After" className="h-28 w-full rounded-xl object-cover ring-1 ring-[#F0DDCF]" />
                          <button onClick={() => removeDraftImage('afterImage')} className="absolute right-2 top-2 rounded-full border border-red-200 bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-red-600 shadow-sm hover:bg-red-50">Remove</button>
                        </div>
                      ) : (
                        <p className="mb-2 text-xs italic text-[#6E6D7A]">No after image selected</p>
                      )}
                      <label className="mt-2 inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-[#E9D7CF] bg-[#fffaf8] px-3 py-2 text-sm font-medium text-[#690A01]">
                        {draftImages.afterImage?.url ? 'Replace after image' : 'Upload after image'}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleEditCaseImageUpload(e, 'afterImage')} />
                      </label>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button onClick={saveCaseImages} disabled={savingImages} className="admin-button-primary flex-1 disabled:opacity-60">
                      {savingImages ? 'Saving…' : 'Save images'}
                    </button>
                    <button onClick={() => setEditingCaseId(null)} className="rounded-xl border border-[#E9D7CF] bg-white px-4 py-2 text-sm font-medium text-[#6E6D7A] hover:bg-[#fffaf8]">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
