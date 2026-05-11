import { initializeApp } from "firebase/app";
import {
  getDatabase, ref, push, set, get, update, remove, onValue,
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB5C9t5MBNHytjyV7unKy4rwcdkgkoZXT8",
  authDomain: "inventory-system-78641.firebaseapp.com",
  databaseURL: "https://inventory-system-78641-default-rtdb.firebaseio.com",
  projectId: "inventory-system-78641",
  storageBucket: "inventory-system-78641.firebasestorage.app",
  messagingSenderId: "626670439386",
  appId: "1:626670439386:web:45d464060153377405fcee3",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

const cache = { items: [], withdrawals: [], purchase_orders: [] };

onValue(ref(db, "items"), (snap) => {
  if (snap.exists()) {
    cache.items = Object.entries(snap.val()).map(([id, val]) => ({ id, ...val }));
  }
});
onValue(ref(db, "withdrawals"), (snap) => {
  if (snap.exists()) {
    cache.withdrawals = Object.entries(snap.val()).map(([id, val]) => ({ id, ...val }));
  }
});
onValue(ref(db, "purchase_orders"), (snap) => {
  if (snap.exists()) {
    cache.purchase_orders = Object.entries(snap.val()).map(([id, val]) => ({ id, ...val }));
  }
});

export async function getAllItems() {
  try {
    const snapshot = await get(ref(db, "items"));
    if (!snapshot.exists()) return cache.items;
    const items = [];
    snapshot.forEach((child) => {
      items.push({ id: child.key, ...child.val() });
    });
    items.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
    cache.items = items;
    return items;
  } catch (e) {
    console.warn("Offline — returning cached items");
    return cache.items.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
  }
}

export async function addItem(form) {
  try {
    const newRef = push(ref(db, "items"));
    const data = {
      project: String(form.project || ""),
      material: String(form.material || ""),
      unit: String(form.unit || ""),
      quantity: Number(form.quantity) || 0,
      withdraw_qty: Number(form.withdraw_qty) || 0,
      remarks: String(form.remarks || ""),
      created_at: Date.now(),
    };
    await set(newRef, data);
    return newRef;
  } catch (e) {
    console.error("addItem error:", e);
    throw e;
  }
}

export async function updateItem(id, fields) {
  try {
    await update(ref(db, `items/${id}`), {
      project: String(fields.project || ""),
      material: String(fields.material || ""),
      unit: String(fields.unit || ""),
      quantity: Number(fields.quantity) || 0,
      withdraw_qty: Number(fields.withdraw_qty) || 0,
      remarks: String(fields.remarks || ""),
      updated_at: Date.now(),
    });
  } catch (e) {
    console.error("updateItem error:", e);
    throw e;
  }
}

export async function deleteItem(id) {
  try {
    const wSnap = await get(ref(db, "withdrawals"));
    if (wSnap.exists()) {
      const dels = [];
      wSnap.forEach((child) => {
        if (child.val().item_id === id)
          dels.push(remove(ref(db, `withdrawals/${child.key}`)));
      });
      await Promise.all(dels);
    }
    await remove(ref(db, `items/${id}`));
  } catch (e) {
    console.error("deleteItem error:", e);
    throw e;
  }
}

export async function withdrawItem(id, { amount, control_no, incharge, project_location, remarks = "", withdraw_date, material, item_project, unit }) {
  const snap = await get(ref(db, `items/${id}`));
  if (!snap.exists()) throw new Error("Item not found");
  const item = snap.val();
  await update(ref(db, `items/${id}`), {
    withdraw_qty: (item.withdraw_qty || 0) + Number(amount),
    updated_at: Date.now(),
  });
  const wRef = push(ref(db, "withdrawals"));
  await set(wRef, {
    item_id: id,
    material: String(material || item.material || ""),
    item_project: String(item_project || item.project || ""),
    unit: String(unit || item.unit || ""),
    control_no: String(control_no || ""),
    incharge: String(incharge || ""),
    project_location: String(project_location || ""),
    quantity_used: Number(amount),
    remarks: String(remarks || ""),
    withdraw_date: withdraw_date || Date.now(),
  });
}

export async function getAllWithdrawals() {
  try {
    const [wSnap, iSnap] = await Promise.all([
      get(ref(db, "withdrawals")),
      get(ref(db, "items")),
    ]);
    if (!wSnap.exists()) return cache.withdrawals;
    const itemsMap = {};
    if (iSnap.exists())
      iSnap.forEach((child) => { itemsMap[child.key] = child.val(); });
    const withdrawals = [];
    wSnap.forEach((child) => {
      const w = child.val();
      const item = itemsMap[w.item_id] || {};
      withdrawals.push({
        id: child.key,
        ...w,
        material: w.material || item.material || "",
        unit: w.unit || item.unit || "",
        item_project: w.item_project || item.project || "",
        control_no: w.control_no || "",
        incharge: w.incharge || "",
      });
    });
    withdrawals.sort((a, b) => (b.withdraw_date || 0) - (a.withdraw_date || 0));
    cache.withdrawals = withdrawals;
    return withdrawals;
  } catch (e) {
    console.warn("Offline — returning cached withdrawals");
    return cache.withdrawals;
  }
}

export async function getAllPOs() {
  try {
    const snapshot = await get(ref(db, 'purchase_orders'));
    if (!snapshot.exists()) return cache.purchase_orders;
    const pos = Object.entries(snapshot.val()).map(([id, val]) => ({ id, ...val }));
    cache.purchase_orders = pos;
    return pos;
  } catch (e) {
    console.warn("Offline — returning cached POs");
    return cache.purchase_orders;
  }
}

export async function addPO(data) {
  try {
    const r = push(ref(db, 'purchase_orders'));
    await set(r, { ...data, created_at: Date.now() });
    return r.key;
  } catch (e) {
    console.error("addPO error:", e);
    throw e;
  }
}

export async function updatePO(id, data) {
  try {
    await update(ref(db, `purchase_orders/${id}`), data);
  } catch (e) {
    console.error("updatePO error:", e);
    throw e;
  }
}

export async function deletePO(id) {
  try {
    await remove(ref(db, `purchase_orders/${id}`));
  } catch (e) {
    console.error("deletePO error:", e);
    throw e;
  }
}

export async function getAllManualLogs() {
  try {
    const snapshot = await get(ref(db, 'manual_logs'));
    const logs = [];
    if (snapshot.exists()) {
      const value = snapshot.val();
      if (value && typeof value === 'object') {
        const entries = Object.entries(value);
        const isRecord = (obj) => obj && typeof obj === 'object' && ('material' in obj || 'log_date' in obj || 'created_at' in obj);
        if (entries.length === 1 && typeof entries[0][1] === 'object' && !isRecord(entries[0][1])) {
          Object.entries(entries[0][1]).forEach(([id, child]) => {
            logs.push({ id, ...child });
          });
        } else {
          entries.forEach(([id, child]) => {
            logs.push({ id, ...child });
          });
        }
      }
    }
    return logs.sort((a, b) => {
      const aDate = a.log_date ? new Date(a.log_date) : new Date(a.created_at || 0);
      const bDate = b.log_date ? new Date(b.log_date) : new Date(b.created_at || 0);
      return bDate - aDate;
    });
  } catch (e) { console.error(e); return []; }
}

export async function addManualLog(data) {
  try {
    const r = push(ref(db, 'manual_logs'));
    await set(r, { ...data, created_at: Date.now() });
    return r.key;
  } catch (e) { console.error(e); throw e; }
}

export async function updateManualLog(id, data) {
  try {
    await update(ref(db, `manual_logs/${id}`), data);
  } catch (e) { console.error(e); throw e; }
}

export async function deleteManualLog(id) {
  try {
    await remove(ref(db, `manual_logs/${id}`));
  } catch (e) { console.error(e); throw e; }
}