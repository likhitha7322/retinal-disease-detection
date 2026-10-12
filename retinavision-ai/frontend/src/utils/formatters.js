/**
 * Clinical Data Formatters
 */

export function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return isoString;
  }
}

export function formatDateTime(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
}

export function formatConfidence(value) {
  if (value === undefined || value === null) return '0.0%';
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return '0.0%';
  // If normalized between 0-1, convert to 0-100%
  const pct = num <= 1.0 && num > 0 ? num * 100 : num;
  return `${pct.toFixed(2)}%`;
}

export function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getRiskLevel(condition, severity, confidence) {
  const c = (condition || '').toLowerCase();
  const s = (severity || '').toLowerCase();

  if (c.includes('normal')) return 'Low';
  if (c.includes('proliferative') || s.includes('severe') || s.includes('proliferative') || (confidence && confidence > 90 && !c.includes('normal'))) {
    return 'High';
  }
  if (s.includes('moderate') || c.includes('glaucoma') || c.includes('cataract')) {
    return 'Moderate';
  }
  return 'Low';
}

