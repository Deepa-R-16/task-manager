const router = require('express').Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/tasks?status=todo&priority=high&search=report
router.get('/', async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    const filter = { user: req.userId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) filter.title = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!req.body.title) return res.status(400).json({ message: 'A task needs a title.' });
    const { title, description, status, priority, dueDate } = req.body;
    const task = await Task.create({
      user: req.userId, title, description, status, priority, dueDate: dueDate || undefined,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title, description, status, priority, dueDate: dueDate || null },
      { new: true, runValidators: true, omitUndefined: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) return res.status(404).json({ message: 'Task not found.' });
    res.json({ message: 'Task deleted.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
