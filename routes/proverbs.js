import express from 'express';
import { readProverbs, writeProverbs } from '../utils/fileHelper.js';

const router = express.Router();

// GET all proverbs (with optional category and search query)
router.get('/', (req, res) => {
  try {
    const { category, search } = req.query;
    let proverbs = readProverbs();

    // Filter by category
    if (category) {
      proverbs = proverbs.filter((p) =>
        p.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Search by keyword in text
    if (search) {
      const keyword = search.toLowerCase();
      proverbs = proverbs.filter((p) =>
        p.text?.toLowerCase().includes(keyword)
      );
    }

    res.json(proverbs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch proverbs.' });
  }
});

// GET a random proverb
router.get('/random', (req, res) => {
  try {
    const proverbs = readProverbs();
    if (proverbs.length === 0) {
      return res.status(404).json({ error: 'No proverbs available.' });
    }
    const randomIndex = Math.floor(Math.random() * proverbs.length);
    res.json(proverbs[randomIndex]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get random proverb.' });
  }
});

// GET a specific proverb by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const proverbs = readProverbs();
  const proverb = proverbs.find((p) => p.id === parseInt(id));
  if (!proverb) {
    return res.status(404).json({ error: 'Proverb not found.' });
  }
  res.json(proverb);
});

// POST a new proverb
router.post('/', (req, res) => {
  const { text, language, category } = req.body;
  if (!text || !language) {
    return res.status(400).json({ error: 'Missing required fields: text and language.' });
  }

  const proverbs = readProverbs();
  const newProverb = {
    id: Date.now(),
    text,
    language,
    category: category || 'general',
  };

  proverbs.push(newProverb);
  writeProverbs(proverbs);
  res.status(201).json(newProverb);
});

// PUT (update) a proverb
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const proverbs = readProverbs();
  const index = proverbs.findIndex((p) => p.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ error: 'Proverb not found.' });
  }

  proverbs[index] = { ...proverbs[index], ...updatedData };
  writeProverbs(proverbs);
  res.json(proverbs[index]);
});

// DELETE a proverb
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  let proverbs = readProverbs();
  const initialLength = proverbs.length;
  proverbs = proverbs.filter((p) => p.id !== parseInt(id));

  if (proverbs.length === initialLength) {
    return res.status(404).json({ error: 'Proverb not found.' });
  }

  writeProverbs(proverbs);
  res.json({ message: 'Proverb deleted successfully.' });
});

export default router;