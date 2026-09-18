import { Router } from 'express';

const router = Router();

const cache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

router.get('/:pincode', async (req, res) => {
  try {
    const pincode = String(req.params.pincode || '').replace(/\D/g, '');
    if (!/^\d{6}$/.test(pincode)) {
      return res.status(400).json({ error: 'Enter a valid 6-digit pincode' });
    }

    const cached = cache.get(pincode);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return res.json(cached.data);
    }

    const url = `https://api.postalpincode.in/pincode/${pincode}`;
    const upstream = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    const payload = await upstream.json();
    const row = Array.isArray(payload) ? payload[0] : null;

    if (!row || row.Status !== 'Success' || !Array.isArray(row.PostOffice) || !row.PostOffice.length) {
      return res.status(404).json({ error: 'Pincode not found' });
    }

    const offices = row.PostOffice;
    const primary =
      offices.find((o) => o.BranchType === 'Head Post Office') ||
      offices.find((o) => o.DeliveryStatus === 'Delivery') ||
      offices[0];

    const data = {
      pincode,
      city: primary.District || primary.Block || primary.Name || '',
      state: primary.State || '',
      district: primary.District || '',
      country: primary.Country || 'India',
      area: primary.Name || '',
      post_offices: offices.slice(0, 12).map((o) => ({
        name: o.Name,
        branch_type: o.BranchType,
        delivery: o.DeliveryStatus,
      })),
    };

    cache.set(pincode, { at: Date.now(), data });
    res.json(data);
  } catch (err) {
    console.error('Pincode lookup failed:', err.message);
    res.status(502).json({ error: 'Could not fetch pincode details. Try again.' });
  }
});

export default router;
