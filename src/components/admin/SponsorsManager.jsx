import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { toast } from 'sonner';
import { Trash2, Upload, GripVertical, ExternalLink } from 'lucide-react';

const BUCKET = 'sponsor-logos';

export default function SponsorsManager() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    category: 'comercial',
    website_url: '',
    file: null,
  });

  useEffect(() => {
    fetchSponsors();
  }, []);

  async function fetchSponsors() {
    setLoading(true);
    const { data, error } = await supabase
      .schema('public')
      .from('sponsors')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast.error('Error al cargar patrocinadores: ' + error.message);
    } else {
      setSponsors(data || []);
    }
    setLoading(false);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!form.file || !form.name) {
      toast.error('Nombre y logo son obligatorios');
      return;
    }

    setUploading(true);
    try {
      const ext = form.file.name.split('.').pop();
      const fileName = `${Date.now()}-${form.name.replace(/\s+/g, '-').toLowerCase()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, form.file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileName);

      const nextOrder = sponsors.length
        ? Math.max(...sponsors.map((s) => s.display_order || 0)) + 1
        : 0;

      const { error: insertError } = await supabase
        .schema('public')
        .from('sponsors')
        .insert({
          name: form.name,
          logo_url: publicUrlData.publicUrl,
          category: form.category,
          website_url: form.website_url || null,
          display_order: nextOrder,
          active: true,
        });

      if (insertError) throw insertError;

      toast.success('Logo agregado');
      setForm({ name: '', category: 'comercial', website_url: '', file: null });
      document.getElementById('sponsor-file-input').value = '';
      fetchSponsors();
    } catch (err) {
      toast.error('Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function toggleActive(sponsor) {
    const { error } = await supabase
      .schema('public')
      .from('sponsors')
      .update({ active: !sponsor.active })
      .eq('id', sponsor.id);

    if (error) {
      toast.error('Error al actualizar: ' + error.message);
    } else {
      fetchSponsors();
    }
  }

  async function deleteSponsor(sponsor) {
    if (!confirm(`¿Eliminar el logo de "${sponsor.name}"? Esta acción no se puede deshacer.`)) return;

    const fileName = sponsor.logo_url.split('/').pop();

    const { error: storageError } = await supabase.storage
      .from(BUCKET)
      .remove([fileName]);

    if (storageError) {
      console.warn('No se pudo borrar el archivo del storage:', storageError.message);
    }

    const { error } = await supabase
      .schema('public')
      .from('sponsors')
      .delete()
      .eq('id', sponsor.id);

    if (error) {
      toast.error('Error al eliminar: ' + error.message);
    } else {
      toast.success('Logo eliminado');
      fetchSponsors();
    }
  }

  async function moveOrder(sponsor, direction) {
    const idx = sponsors.findIndex((s) => s.id === sponsor.id);
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sponsors.length) return;

    const other = sponsors[swapIdx];

    await supabase.schema('public').from('sponsors').update({ display_order: other.display_order }).eq('id', sponsor.id);
    await supabase.schema('public').from('sponsors').update({ display_order: sponsor.display_order }).eq('id', other.id);

    fetchSponsors();
  }

  const educativas = sponsors.filter((s) => s.category === 'educativa');
  const comerciales = sponsors.filter((s) => s.category === 'comercial');

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Patrocinios y colaboraciones</h1>

      <form onSubmit={handleUpload} className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-8 space-y-4">
        <h2 className="font-semibold text-gray-700">Agregar nuevo logo</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre de la institución</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Ej. CIESAS"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Categoría</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="educativa">Institución educativa</option>
              <option value="comercial">Colaborador comercial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Sitio web (opcional)</label>
            <input
              type="url"
              value={form.website_url}
              onChange={(e) => setForm({ ...form, website_url: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Logo (imagen)</label>
            <input
              id="sponsor-file-input"
              type="file"
              accept="image/*"
              onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={uploading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded"
        >
          <Upload size={16} />
          {uploading ? 'Subiendo...' : 'Agregar logo'}
        </button>
      </form>

      {loading ? (
        <p className="text-gray-500">Cargando...</p>
      ) : (
        <>
          <SponsorList
            title="Instituciones educativas"
            items={educativas}
            onToggle={toggleActive}
            onDelete={deleteSponsor}
            onMove={moveOrder}
          />
          <SponsorList
            title="Colaboradores comerciales"
            items={comerciales}
            onToggle={toggleActive}
            onDelete={deleteSponsor}
            onMove={moveOrder}
          />
        </>
      )}
    </div>
  );
}

function SponsorList({ title, items, onToggle, onDelete, onMove }) {
  return (
    <div className="mb-8">
      <h2 className="font-semibold text-gray-700 mb-3">{title}</h2>
      {!items.length ? (
        <p className="text-sm text-gray-400">Sin logos en esta categoría.</p>
      ) : (
        <div className="space-y-2">
          {items.map((sponsor) => (
            <div
              key={sponsor.id}
              className={`flex items-center gap-3 border rounded-lg p-3 ${
                sponsor.active ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
              }`}
            >
              <GripVertical size={16} className="text-gray-300 flex-shrink-0" />
              <img
                src={sponsor.logo_url}
                alt={sponsor.name}
                className="h-10 w-16 object-contain flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{sponsor.name}</p>
                {sponsor.website_url && (
                    <a
                    href={sponsor.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 flex items-center gap-1 truncate"
                  >
                    <ExternalLink size={10} /> {sponsor.website_url}
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => onMove(sponsor, 'up')}
                  className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
                  title="Subir orden"
                >
                  ↑
                </button>
                <button
                  onClick={() => onMove(sponsor, 'down')}
                  className="text-xs px-2 py-1 border rounded hover:bg-gray-100"
                  title="Bajar orden"
                >
                  ↓
                </button>
                <button
                  onClick={() => onToggle(sponsor)}
                  className={`text-xs px-2 py-1 rounded ${
                    sponsor.active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {sponsor.active ? 'Activo' : 'Inactivo'}
                </button>
                <button
                  onClick={() => onDelete(sponsor)}
                  className="text-red-500 hover:bg-red-50 p-1.5 rounded"
                  title="Eliminar"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
