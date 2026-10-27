import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { env, hasSupabase } from './config/env.js';

const app = express();
const publicDirectory = fileURLToPath(new URL('../public/', import.meta.url));

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.allowedOrigins.length === 0 || env.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin not allowed by CORS'));
  }
}));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: 'draft-7', legacyHeaders: false }));

// Preview listings only. These are examples, not verified live offers.
const stores = [
  { id: 'store-essentials', slug: 'mu-essentials', name: 'MU Essentials', description: 'Everyday campus essentials and useful finds.' },
  { id: 'store-food', slug: 'campus-bites', name: 'Campus Bites', description: 'Food listings. Confirm availability before ordering.' },
  { id: 'store-tech', slug: 'tech-corner', name: 'Tech Corner', description: 'Student-friendly tech accessories and support.' }
];
const products = [
  { id: 'demo-001', name: 'Campus Notebook', description: 'A simple notebook for lectures and planning.', category: 'Stationery', price: 35, stock: 12, image_url: '', store: stores[0] },
  { id: 'demo-002', name: 'Blue Ballpoint Pens', description: 'Pack of everyday writing pens.', category: 'Stationery', price: 20, stock: 20, image_url: '', store: stores[0] },
  { id: 'demo-003', name: 'Phone Charger Cable', description: 'Example listing. Confirm connector type with seller.', category: 'Essentials', price: 60, stock: 5, image_url: '', store: stores[2] },
  { id: 'demo-004', name: 'Reusable Water Bottle', description: 'Carry water between lectures.', category: 'Essentials', price: 75, stock: 8, image_url: '', store: stores[0] },
  { id: 'demo-005', name: 'Snack Pack', description: 'Example food listing. Availability is not guaranteed.', category: 'Food', price: 25, stock: 10, image_url: '', store: stores[1] },
  { id: 'demo-006', name: 'Basic Laptop Setup Help', description: 'Sample service listing, not a verified provider.', category: 'Services', price: 100, stock: 3, image_url: '', store: stores[2] }
];

app.get('/api/health', (_req, res) => res.json({
  status: 'ok', app: 'MUCONNECT', environment: env.nodeEnv,
  databaseConfigured: hasSupabase, catalogueMode: 'demo',
  note: 'Demo listings and order references are not live or permanently saved.'
}));
app.get('/api/products', (_req, res) => res.json({ products, mode: 'demo' }));
app.get('/api/stores', (_req, res) => res.json({ stores, mode: 'demo' }));

app.post('/api/orders', (req, res) => {
  const { customer_name, phone, delivery_location, items } = req.body || {};
  if (typeof customer_name !== 'string' || !customer_name.trim() ||
      typeof phone !== 'string' || !phone.trim() ||
      typeof delivery_location !== 'string' || !delivery_location.trim() ||
      !Array.isArray(items) || items.length < 1 || items.length > 30) {
    return res.status(400).json({ error: 'Please provide your name, phone, meeting location and at least one item.' });
  }
  for (const item of items) {
    const product = products.find((entry) => entry.id === String(item.product_id));
    const quantity = Number(item.quantity);
    if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > product.stock) {
      return res.status(400).json({ error: 'One or more items are invalid or exceed the preview quantity. Please refresh your bag.' });
    }
  }
  // Preview-only: no order is stored, sent to a seller, or paid for.
  return res.status(201).json({
    message: 'Preview request checked successfully. No seller has been notified and no order was saved.',
    order_reference: `DEMO-${randomUUID().slice(0, 8).toUpperCase()}`
  });
});

app.post('/api/ai/ask', (req, res) => {
  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  if (!question || question.length > 1000) {
    return res.status(400).json({ error: 'Enter a question of up to 1,000 characters.' });
  }
  return res.json({
    answer: 'MUCONNECT assistant preview: check seller details, confirm availability and the final price before arranging a handoff. Never share a mobile-money PIN or password. The AI provider is not connected yet.',
    mode: 'preview'
  });
});

app.use(express.static(publicDirectory));
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));
app.listen(env.port, () => console.log(`MUCONNECT server running on port ${env.port} (${env.nodeEnv}; catalogue: demo)`));
