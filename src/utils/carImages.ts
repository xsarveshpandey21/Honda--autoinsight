/**
 * Map Honda Base Models to photographic assets in /cars/
 */

export const MODEL_COLORS: Record<string, { primary: string; secondary: string; badge: string }> = {
  'Civic': { primary: '#E60012', secondary: '#99000C', badge: 'bg-red-500/20 text-red-400 border-red-500/30' },
  'Accord': { primary: '#2563EB', secondary: '#1D4ED8', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'CR-V': { primary: '#059669', secondary: '#047857', badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  'Pilot': { primary: '#7C3AED', secondary: '#6D28D9', badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  'HR-V': { primary: '#D97706', secondary: '#B45309', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  'Passport': { primary: '#0891B2', secondary: '#0E7490', badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  'Odyssey': { primary: '#4F46E5', secondary: '#4338CA', badge: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  'Ridgeline': { primary: '#EA580C', secondary: '#C2410C', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  'Insight': { primary: '#10B981', secondary: '#059669', badge: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  'Clarity': { primary: '#06B6D4', secondary: '#0891B2', badge: 'bg-sky-500/20 text-sky-400 border-sky-500/30' },
  'Fit': { primary: '#EC4899', secondary: '#DB2777', badge: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  'Element': { primary: '#84CC16', secondary: '#65A30D', badge: 'bg-lime-500/20 text-lime-400 border-lime-500/30' },
  'S2000': { primary: '#F43F5E', secondary: '#E11D48', badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
};

export const DEFAULT_MODEL_COLOR = {
  primary: '#64748B',
  secondary: '#475569',
  badge: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
};

export function getModelImagePath(baseModel: string): string {
  const normalized = baseModel.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const known = ['civic', 'accord', 'crv', 'pilot', 'hrv', 'passport', 'odyssey', 'ridgeline', 'insight', 'clarity', 'fit', 'element', 's2000'];
  if (known.includes(normalized)) {
    return `/cars/${normalized}.jpg`;
  }
  return `/cars/default.jpg`;
}

export function getModelColors(baseModel: string) {
  return MODEL_COLORS[baseModel] || DEFAULT_MODEL_COLOR;
}
