
export function googleCalUrl({ title, description='', location='', startIsoUtc, endIsoUtc }:{
    title: string; description?: string; location?: string; startIsoUtc: string; endIsoUtc: string;
  }) {
    const fmt = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
    const q = new URLSearchParams({ action:'TEMPLATE', text:title, details:description, location,
      dates:`${fmt(startIsoUtc)}/${fmt(endIsoUtc)}` });
    return `https://calendar.google.com/calendar/render?${q}`;
  }
  