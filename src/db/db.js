// db.js - localStorage-based database with sync queue for offline support

const DB_KEYS = {
  USERS: 'cat_users',
  TURNS: 'cat_turns',
  CURRENT_USER: 'cat_current_user',
};

function getAll(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function setAll(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export const userDB = {
  getAll() { return getAll(DB_KEYS.USERS); },
  getById(id) { return this.getAll().find((u) => u.id === id) || null; },
  getByCedula(cedula) { return this.getAll().find((u) => u.cedula === cedula) || null; },
  create(data) {
    const users = this.getAll();
    const user = { id: genId(), ...data, createdAt: new Date().toISOString(), role: data.role || 'user', estado: data.estado || 'activo' };
    users.push(user);
    setAll(DB_KEYS.USERS, users);
    return user;
  },
  update(id, data) {
    const users = this.getAll();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...data, updatedAt: new Date().toISOString() };
    setAll(DB_KEYS.USERS, users);
    return users[idx];
  },
  delete(id) {
    const users = this.getAll().filter((u) => u.id !== id);
    setAll(DB_KEYS.USERS, users);
  },
  authenticate(cedula, password) {
    const user = this.getByCedula(cedula);
    if (!user) return null;
    if (user.password !== password) return null;
    return user;
  },
  isActive(user) {
    if (user.estado !== 'activo') return false;
    if (user.role === 'admin') return true;
    if (!user.vencimiento) return true;
    return new Date(user.vencimiento) >= new Date();
  },
};

export const sessionDB = {
  get() {
    try { return JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER) || 'null'); }
    catch { return null; }
  },
  set(user) { localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user)); },
  clear() { localStorage.removeItem(DB_KEYS.CURRENT_USER); },
};

export const turnDB = {
  getAll() { return getAll(DB_KEYS.TURNS); },
  getByUser(userId) { return this.getAll().filter((t) => t.userId === userId); },
  getByDate(userId, date) {
    return this.getAll().find((t) => t.userId === userId && t.fecha === date) || null;
  },
  getByMonth(userId, year, month) {
    const prefix = `${year}-${String(month).padStart(2, '0')}`;
    return this.getAll().filter((t) => t.userId === userId && t.fecha && t.fecha.startsWith(prefix));
  },
  save(data) {
    const turns = this.getAll();
    if (data.id && typeof data.id === 'string' && data.id.length > 5) {
      const idx = turns.findIndex((t) => t.id === data.id);
      if (idx !== -1) {
        turns[idx] = { ...turns[idx], ...data, updatedAt: new Date().toISOString() };
        setAll(DB_KEYS.TURNS, turns);
        return turns[idx];
      }
    }
    const { id: _ignore, ...rest } = data;
    const turn = { id: genId(), ...rest, createdAt: new Date().toISOString(), synced: false };
    turns.push(turn);
    setAll(DB_KEYS.TURNS, turns);
    return turn;
  },
  delete(id) {
    const turns = this.getAll().filter((t) => t.id !== id);
    setAll(DB_KEYS.TURNS, turns);
  },
  cleanup() {
    const turns = this.getAll().filter((t) => t.id && t.fecha && t.userId);
    setAll(DB_KEYS.TURNS, turns);
    return turns;
  },
};

export function seedAdminIfEmpty() {
  const users = userDB.getAll();
  if (users.length === 0) {
    userDB.create({
      nombre: 'Administrador', cedula: 'admin', codigoChofer: 'ADMIN',
      matricula: '-', movil: '-', email: 'admin@cierrealtoque.uy',
      password: 'admin123', role: 'admin', estado: 'activo', firma: '',
    });
  }
}
```

**4.** Bajás y clic en **Commit changes** → **Commit changes**

Luego en la Terminal:
```
git pull
npm run dev
