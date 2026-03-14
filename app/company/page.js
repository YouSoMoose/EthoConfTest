'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Loader from '@/components/Loader';

export default function CompanyPage() {
  const [company, setCompany] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', category: '', contact_email: '',
    website: '', deck_link: '', logo_url: '', resume_link: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/company')
      .then(r => r.json())
      .then(data => {
        if (data) {
          setCompany(data);
          setForm({
            name: data.name || '',
            description: data.description || '',
            category: data.category || '',
            contact_email: data.contact_email || '',
            website: data.website || '',
            deck_link: data.deck_link || '',
            logo_url: data.logo_url || '',
            resume_link: data.resume_link || '',
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Company name is required');
      return;
    }

    setSaving(true);
    try {
      const method = company ? 'PUT' : 'POST';
      const body = company ? { id: company.id, ...form } : form;
      const res = await fetch('/api/company', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setCompany(data);
        toast.success(company ? 'Updated!' : 'Company created!');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save');
      }
    } catch {
      toast.error('Network error');
    }
    setSaving(false);
  };

  if (loading) return <Loader />;

  const fields = [
    { key: 'name', label: 'Company Name *', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'category', label: 'Category', type: 'text', placeholder: 'e.g., CleanTech, FinTech' },
    { key: 'contact_email', label: 'Contact Email', type: 'email' },
    { key: 'website', label: 'Website', type: 'url' },
    { key: 'deck_link', label: 'Pitch Deck URL', type: 'url' },
    { key: 'logo_url', label: 'Logo URL', type: 'url' },
    { key: 'resume_link', label: 'Resume/Portfolio Link', type: 'url' },
  ];

  return (
    <div className="page-enter">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h2 className="font-heading text-2xl font-bold text-green-900 mb-2">
          {company ? 'Edit Your Company' : 'Register Your Company'}
        </h2>
        <p className="font-body text-gray-500 mb-8">
          {company ? 'Update your company profile below.' : 'Fill in your company details to get started.'}
        </p>

        <form onSubmit={handleSave} className="space-y-5">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="block font-body text-sm font-medium text-gray-700 mb-1.5">
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={form[field.key]}
                  onChange={(e) => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="input-field min-h-[100px] resize-y"
                  placeholder={field.placeholder || ''}
                />
              ) : (
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="input-field"
                  placeholder={field.placeholder || ''}
                  required={field.required}
                />
              )}
            </div>
          ))}

          <button type="submit" disabled={saving} className="btn-primary w-full py-3 btn-glow">
            {saving ? 'Saving...' : company ? 'Update Company' : 'Create Company'}
          </button>
        </form>
      </div>
    </div>
  );
}
