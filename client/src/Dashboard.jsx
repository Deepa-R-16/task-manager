import { useEffect, useState, useCallback } from 'react';
import { api } from './api.js';

const STATUS = { todo: 'To do', 'in-progress': 'In progress', done: 'Done' };
const EMPTY = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' };

export default function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const handleError = (err) => {
    if (err.status === 401) return onLogout();
    setError(err.message);
  };

  const load = useCallback(async () => {
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();
    try {
      setTasks(await api(`/tasks${qs ? `?${qs}` : ''}`));
      setError('');
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search typing
    return () => clearTimeout(t);
  }, [load]);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await api(`/tasks/${editingId}`, { method: 'PUT', body: form });
      else await api('/tasks', { method: 'POST', body: form });
      setForm(EMPTY);
      setEditingId(null);
      load();
    } catch (err) { handleError(err); }
  };

  const edit = (t) => {
    setEditingId(t._id);
    setForm({
      title: t.title, description: t.description, status: t.status,
      priority: t.priority, dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const setStatus = async (t, status) => {
    try { await api(`/tasks/${t._id}`, { method: 'PUT', body: { ...t, status } }); load(); }
    catch (err) { handleError(err); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this task?')) return;
    try { await api(`/tasks/${id}`, { method: 'DELETE' }); load(); }
    catch (err) { handleError(err); }
  };

  const f = (k) => (e) => setFilters({ ...filters, [k]: e.target.value });
  const s = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="shell">
      <header className="top">
        <h1>Tasks</h1>
        <div>
          <span className="muted">{user.name}</span>
          <button className="link" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <form className="composer" onSubmit={save}>
        <h2>{editingId ? 'Edit task' : 'Add a task'}</h2>
        <input placeholder="What needs doing?" value={form.title} onChange={s('title')} required />
        <textarea placeholder="Notes (optional)" rows={2} value={form.description} onChange={s('description')} />
        <div className="row">
          <select value={form.status} onChange={s('status')} aria-label="Status">
            {Object.entries(STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <select value={form.priority} onChange={s('priority')} aria-label="Priority">
            <option value="low">Low priority</option>
            <option value="medium">Medium priority</option>
            <option value="high">High priority</option>
          </select>
          <input type="date" value={form.dueDate} onChange={s('dueDate')} aria-label="Due date" />
          <button className="primary">{editingId ? 'Save changes' : 'Add task'}</button>
          {editingId && <button type="button" className="link" onClick={() => { setEditingId(null); setForm(EMPTY); }}>Cancel</button>}
        </div>
      </form>

      <div className="filters">
        <input placeholder="Search tasks" value={filters.search} onChange={f('search')} />
        <select value={filters.status} onChange={f('status')} aria-label="Filter by status">
          <option value="">All statuses</option>
          {Object.entries(STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={filters.priority} onChange={f('priority')} aria-label="Filter by priority">
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      {loading ? <p className="muted">Loading…</p> : tasks.length === 0 ? (
        <p className="empty">No tasks match. Add one above or clear the filters.</p>
      ) : (
        <ul className="list">
          {tasks.map((t) => (
            <li key={t._id} className={`task ${t.status}`}>
              <div className="body">
                <strong>{t.title}</strong>
                {t.description && <p>{t.description}</p>}
                <div className="meta">
                  <span className={`pill ${t.priority}`}>{t.priority}</span>
                  {t.dueDate && (
                    <span className={t.dueDate.slice(0, 10) < today && t.status !== 'done' ? 'late' : ''}>
                      Due {new Date(t.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="actions">
                <select value={t.status} onChange={(e) => setStatus(t, e.target.value)} aria-label="Change status">
                  {Object.entries(STATUS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <button className="link" onClick={() => edit(t)}>Edit</button>
                <button className="link danger" onClick={() => remove(t._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
