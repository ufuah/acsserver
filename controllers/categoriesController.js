import db from '../db/db.js';

// Get all categories
export const getAllCategories = (req, res) => {
  const query = 'SELECT * FROM categories';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Add a new category
export const addCategory = (req, res) => {
  const { name } = req.body;
  const query = 'INSERT INTO categories (name) VALUES (?)';
  db.query(query, [name], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.send('Category added successfully');
  });
};
