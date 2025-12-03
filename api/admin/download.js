// Vercel serverless function to download feedback data as CSV
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check for admin key
  const key = req.query.key;
  if (key !== 'admin123') {
    return res.status(401).json({ error: 'Unauthorized. Use ?key=admin123' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  try {
    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(200).json({ error: 'No data to download' });
      }

      // Convert to CSV
      const keys = Object.keys(data[0]);
      const csvLines = [keys.join(',')]; // Header
      
      for (const item of data) {
        const values = keys.map(k => {
          const value = item[k] || '';
          // Escape commas and quotes in CSV
          return `"${String(value).replace(/"/g, '""')}"`;
        });
        csvLines.push(values.join(','));
      }

      const csv = csvLines.join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=feedback_data.csv');
      return res.status(200).send(csv);
    }

    return res.status(200).json({ error: 'Supabase not configured' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}

