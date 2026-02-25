<template>
  <div class="app-wrapper">
    <div class="container">

      <!-- HEADER -->
      <div class="header" :class="{ 'header-visible': showHeader }">
        <img src="@/assets/logo.png" alt="CSU Logo" class="logo" :class="{ 'logo-visible': showHeader }" />
        <div class="header-text">
          <h1 :class="{ 'title-visible': showHeader }">Material Log Monitoring and Inventory System</h1>
          <p :class="{ 'subtitle-visible': showHeader }">General Services Office — Caraga State University</p>
        </div>
      </div>

      <!-- DATE -->
      <p class="date-label">As of: {{ today }}</p>

      <!-- TABS -->
      <div class="tabs">
        <button @click="activeTab = 'inventory'" :class="activeTab === 'inventory' ? 'tab-active' : 'tab'">
          📦 Inventory
        </button>
        <button @click="activeTab = 'withdrawals'" :class="activeTab === 'withdrawals' ? 'tab-active' : 'tab'">
          📋 Withdrawal Log
        </button>
      </div>

      <!-- ===================== INVENTORY TAB ===================== -->
      <div v-if="activeTab === 'inventory'">
        <div class="form-box">
          <h2 class="form-title">{{ editMode ? '✏️ Edit Item' : '➕ Add New Item' }}</h2>
          <div class="form-grid">
            <div class="form-field">
              <label class="field-label">Project / Location :</label>
              <input v-model="form.project" placeholder="Enter project or location" />
            </div>
            <div class="form-field">
              <label class="field-label">Materials :</label>
              <input v-model="form.material" placeholder="Enter material name" />
            </div>
            <div class="form-field">
              <label class="field-label">Unit :</label>
              <input v-model="form.unit" placeholder="PCS, GAL, BOX..." />
            </div>
            <div class="form-field">
              <label class="field-label">Quantity :</label>
              <input v-model.number="form.quantity" type="number" placeholder="0" />
            </div>
            <div class="form-field">
              <label class="field-label">Withdraw Qty :</label>
              <input v-model.number="form.withdraw_qty" type="number" placeholder="0" />
            </div>
            <div class="form-field">
              <label class="field-label">Remarks :</label>
              <input v-model="form.remarks" placeholder="Optional notes" />
            </div>
          </div>
          <div class="form-actions">
            <button @click="saveItem" :class="editMode ? 'btn-warning' : 'btn-primary'">
              {{ editMode ? 'Update Item' : 'Add Item' }}
            </button>
            <button v-if="editMode" @click="cancelEdit" class="btn-gray">Cancel</button>
          </div>
        </div>

        <!-- TOOLBAR -->
        <div class="toolbar">
          <input v-model="search" placeholder="🔍 Search project or material..." class="search-input" />
          <div class="date-filter">
            <label>From:</label>
            <input type="date" v-model="dateFrom" />
            <label>To:</label>
            <input type="date" v-model="dateTo" />
            <button @click="clearDates" class="btn-gray">Clear</button>
          </div>
          <select v-model="selectedMaterial" class="select-input">
            <option value="">-- All Materials --</option>
            <option v-for="mat in uniqueMaterials" :key="mat" :value="mat">{{ mat }}</option>
          </select>
          <select v-model="selectedPeriod" class="select-input" @change="applyPeriod">
            <option value="">-- Quick Filter --</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="lastweek">Last Week</option>
            <option value="month">This Month</option>
            <option value="lastmonth">Last Month</option>
            <option value="last3months">Last 3 Months</option>
          </select>
          <button @click="printReport" class="btn-print">🖨️ Print / Download</button>
        </div>

        <!-- TABLE -->
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Project / Location</th>
                <th>Materials</th>
                <th>Unit</th>
                <th>Quantity</th>
                <th>Withdraw</th>
                <th>Remaining</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in filteredItems" :key="item.id" :class="rowClass(item)">
                <td>{{ index + 1 }}</td>
                <td>{{ item.project }}</td>
                <td>{{ item.material }}</td>
                <td>{{ item.unit }}</td>
                <td>{{ item.quantity }}</td>
                <td>{{ item.withdraw_qty }}</td>
                <td><strong>{{ item.remaining }}</strong></td>
                <td class="remarks-cell">{{ item.remarks }}</td>
                <td class="actions-cell">
                  <button @click="startWithdraw(item)" class="btn-info">Withdraw</button>
                  <button @click="editItem(item)" class="btn-warning-sm">Edit</button>
                  <button @click="deleteItem(item.id)" class="btn-danger">Delete</button>
                </td>
              </tr>
              <tr v-if="filteredItems.length === 0">
                <td colspan="9" class="empty-row">No items found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ===================== WITHDRAWAL LOG TAB ===================== -->
      <div v-if="activeTab === 'withdrawals'">
        <div class="toolbar">
          <div class="date-filter">
            <label>From:</label>
            <input type="date" v-model="wDateFrom" />
            <label>To:</label>
            <input type="date" v-model="wDateTo" />
            <button @click="wDateFrom=''; wDateTo=''; wSelectedPeriod=''; wSelectedMaterial=''" class="btn-gray">Clear</button>
          </div>
          <select v-model="wSelectedMaterial" class="select-input">
            <option value="">-- All Materials --</option>
            <option v-for="mat in uniqueMaterials" :key="mat" :value="mat">{{ mat }}</option>
          </select>
          <select v-model="wSelectedPeriod" class="select-input" @change="applyWithdrawalPeriod">
            <option value="">-- Quick Filter --</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="lastweek">Last Week</option>
            <option value="month">This Month</option>
            <option value="lastmonth">Last Month</option>
            <option value="last3months">Last 3 Months</option>
          </select>
          <button @click="printWithdrawalReport" class="btn-print">🖨️ Print Withdrawal Log</button>
        </div>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Project / Location (Stock)</th>
                <th>Material</th>
                <th>Unit</th>
                <th>Qty Used</th>
                <th>Withdrawn To (Location)</th>
                <th>Date</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(w, index) in filteredWithdrawals" :key="w.id">
                <td>{{ index + 1 }}</td>
                <td>{{ w.item_project }}</td>
                <td>{{ w.material }}</td>
                <td>{{ w.unit }}</td>
                <td>{{ w.quantity_used }}</td>
                <td>{{ w.project_location }}</td>
                <td>{{ formatDate(w.withdraw_date) }}</td>
                <td>{{ w.remarks }}</td>
              </tr>
              <tr v-if="filteredWithdrawals.length === 0">
                <td colspan="8" class="empty-row">No withdrawal records found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- WITHDRAW MODAL -->
      <div v-if="withdrawModal" class="modal-overlay">
        <div class="modal">
          <h3 class="modal-title">Withdraw: {{ withdrawItem?.material }}</h3>
          <p class="modal-available">Available Stock: <strong>{{ withdrawItem?.remaining }}</strong></p>
          <input v-model="withdrawProjectLocation" placeholder="Project Location *" />
          <input v-model.number="withdrawAmount" type="number" min="1" :max="withdrawItem?.remaining" placeholder="Quantity to withdraw *" />
          <input v-model="withdrawRemarks" placeholder="Remarks (optional)" />
          <div class="modal-actions">
            <button @click="confirmWithdraw" class="btn-primary">Confirm</button>
            <button @click="withdrawModal = false" class="btn-gray">Cancel</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios';
const API = 'http://localhost:3000/api/items';

export default {
  data() {
    return {
      activeTab: 'inventory',
      showHeader: false,
      items: [],
      withdrawals: [],
      search: '',
      dateFrom: '',
      dateTo: '',
      selectedMaterial: '',
      selectedPeriod: '',
      wDateFrom: '',
      wDateTo: '',
      wSelectedMaterial: '',
      wSelectedPeriod: '',
      form: { project: '', material: '', unit: '', quantity: 0, withdraw_qty: 0, remarks: '' },
      editMode: false,
      editId: null,
      withdrawModal: false,
      withdrawItem: null,
      withdrawAmount: 0,
      withdrawProjectLocation: '',
      withdrawRemarks: '',
      today: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    };
  },
  computed: {
    filteredItems() {
      let result = this.items;
      const s = this.search.toLowerCase();
      if (s) result = result.filter(i => i.project?.toLowerCase().includes(s) || i.material?.toLowerCase().includes(s));
      if (this.selectedMaterial) result = result.filter(i => i.material === this.selectedMaterial);
      if (this.dateFrom) result = result.filter(i => new Date(i.created_at) >= new Date(this.dateFrom));
      if (this.dateTo) {
        const to = new Date(this.dateTo); to.setHours(23, 59, 59);
        result = result.filter(i => new Date(i.created_at) <= to);
      }
      return result;
    },
    filteredWithdrawals() {
      let result = this.withdrawals;
      if (this.wSelectedMaterial) result = result.filter(w => w.material === this.wSelectedMaterial);
      if (this.wDateFrom) result = result.filter(w => new Date(w.withdraw_date) >= new Date(this.wDateFrom));
      if (this.wDateTo) {
        const to = new Date(this.wDateTo); to.setHours(23, 59, 59);
        result = result.filter(w => new Date(w.withdraw_date) <= to);
      }
      return result;
    },
    uniqueMaterials() {
      return [...new Set(this.items.map(i => i.material).filter(Boolean))].sort();
    },
    printDateLabel() {
      let label = '';
      if (this.dateFrom && this.dateTo) label = `${this.formatDate(this.dateFrom)} to ${this.formatDate(this.dateTo)}`;
      else if (this.dateFrom) label = `From ${this.formatDate(this.dateFrom)}`;
      else if (this.dateTo) label = `As of ${this.formatDate(this.dateTo)}`;
      else label = this.today;
      if (this.selectedMaterial) label += ` | Material: ${this.selectedMaterial}`;
      return label;
    },
    withdrawalDateLabel() {
      let label = '';
      if (this.wDateFrom && this.wDateTo) label = `${this.formatDate(this.wDateFrom)} to ${this.formatDate(this.wDateTo)}`;
      else if (this.wDateFrom) label = `From ${this.formatDate(this.wDateFrom)}`;
      else if (this.wDateTo) label = `As of ${this.formatDate(this.wDateTo)}`;
      else label = this.today;
      if (this.wSelectedMaterial) label += ` | Material: ${this.wSelectedMaterial}`;
      return label;
    }
  },
  methods: {
    async fetchItems() {
      try {
        const res = await axios.get(API);
        this.items = res.data.map(item => ({
          ...item,
          remaining: item.remaining !== undefined ? item.remaining : (item.quantity - item.withdraw_qty)
        }));
      } catch (e) {
        console.error('Failed to fetch items:', e);
        alert('Could not load items. Is the backend running on port 3000?');
      }
    },
    async fetchWithdrawals() {
      const res = await axios.get(`${API}/withdrawals/all`);
      this.withdrawals = res.data;
    },
    async saveItem() {
      if (!this.form.material || !this.form.project) return alert('Project and Material are required!');
      try {
        if (this.editMode) {
          await axios.put(`${API}/${this.editId}`, this.form);
        } else {
          await axios.post(API, this.form);
        }
        this.resetForm();
        this.fetchItems();
      } catch (e) {
        console.error('Failed to save item:', e);
        alert('Failed to save item. Check if the backend is running.');
      }
    },
    editItem(item) {
      this.form = { ...item };
      this.editId = item.id;
      this.editMode = true;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    cancelEdit() { this.resetForm(); },
    async deleteItem(id) {
      if (!confirm('Delete this item?')) return;
      try {
        await axios.delete(`${API}/${id}`);
        this.fetchItems();
      } catch (e) {
        console.error('Failed to delete:', e);
        alert('Failed to delete item.');
      }
    },
    startWithdraw(item) {
      this.withdrawItem = item;
      this.withdrawAmount = 0;
      this.withdrawProjectLocation = '';
      this.withdrawRemarks = '';
      this.withdrawModal = true;
    },
    async confirmWithdraw() {
      if (!this.withdrawProjectLocation) return alert('Project Location is required!');
      if (!this.withdrawAmount || this.withdrawAmount <= 0) return alert('Enter a valid amount');
      if (this.withdrawAmount > this.withdrawItem.remaining) return alert('Not enough stock!');
      try {
        await axios.patch(`${API}/${this.withdrawItem.id}/withdraw`, {
          amount: this.withdrawAmount,
          project_location: this.withdrawProjectLocation,
          remarks: this.withdrawRemarks
        });
        this.withdrawModal = false;
        this.fetchItems();
        this.fetchWithdrawals();
      } catch (e) {
        console.error('Withdrawal failed:', e);
        alert('Withdrawal failed. Check backend.');
      }
    },
    resetForm() {
      this.form = { project: '', material: '', unit: '', quantity: 0, withdraw_qty: 0, remarks: '' };
      this.editMode = false;
      this.editId = null;
    },
    rowClass(item) {
      // Green = has remaining stock, Red = no remaining (fully used)
      if (item.remaining === 0) return 'row-empty';   // red - fully used
      return 'row-has-stock';                          // green - has remaining
    },
    clearDates() {
      this.dateFrom = ''; this.dateTo = '';
      this.selectedPeriod = ''; this.selectedMaterial = '';
    },
    formatDate(d) {
      if (!d) return '';
      return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    applyPeriod() {
      const now = new Date();
      if (this.selectedPeriod === 'today') {
        const today = now.toISOString().split('T')[0];
        this.dateFrom = today; this.dateTo = today;
      } else if (this.selectedPeriod === 'week') {
        const first = new Date(now); first.setDate(now.getDate() - now.getDay());
        this.dateFrom = first.toISOString().split('T')[0];
        this.dateTo = now.toISOString().split('T')[0];
      } else if (this.selectedPeriod === 'lastweek') {
        const first = new Date(now); first.setDate(now.getDate() - now.getDay() - 7);
        const last = new Date(first); last.setDate(first.getDate() + 6);
        this.dateFrom = first.toISOString().split('T')[0];
        this.dateTo = last.toISOString().split('T')[0];
      } else if (this.selectedPeriod === 'month') {
        this.dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        this.dateTo = now.toISOString().split('T')[0];
      } else if (this.selectedPeriod === 'lastmonth') {
        const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const last = new Date(now.getFullYear(), now.getMonth(), 0);
        this.dateFrom = first.toISOString().split('T')[0];
        this.dateTo = last.toISOString().split('T')[0];
      } else if (this.selectedPeriod === 'last3months') {
        const first = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        this.dateFrom = first.toISOString().split('T')[0];
        this.dateTo = now.toISOString().split('T')[0];
      } else { this.clearDates(); }
    },
    applyWithdrawalPeriod() {
      const now = new Date();
      if (this.wSelectedPeriod === 'today') {
        const today = now.toISOString().split('T')[0];
        this.wDateFrom = today; this.wDateTo = today;
      } else if (this.wSelectedPeriod === 'week') {
        const first = new Date(now); first.setDate(now.getDate() - now.getDay());
        this.wDateFrom = first.toISOString().split('T')[0];
        this.wDateTo = now.toISOString().split('T')[0];
      } else if (this.wSelectedPeriod === 'lastweek') {
        const first = new Date(now); first.setDate(now.getDate() - now.getDay() - 7);
        const last = new Date(first); last.setDate(first.getDate() + 6);
        this.wDateFrom = first.toISOString().split('T')[0];
        this.wDateTo = last.toISOString().split('T')[0];
      } else if (this.wSelectedPeriod === 'month') {
        this.wDateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        this.wDateTo = now.toISOString().split('T')[0];
      } else if (this.wSelectedPeriod === 'lastmonth') {
        const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const last = new Date(now.getFullYear(), now.getMonth(), 0);
        this.wDateFrom = first.toISOString().split('T')[0];
        this.wDateTo = last.toISOString().split('T')[0];
      } else if (this.wSelectedPeriod === 'last3months') {
        const first = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        this.wDateFrom = first.toISOString().split('T')[0];
        this.wDateTo = now.toISOString().split('T')[0];
      } else { this.wDateFrom = ''; this.wDateTo = ''; this.wSelectedPeriod = ''; }
    },
    printReport() {
      const rows = this.filteredItems.map((item, i) => `
        <tr>
          <td>${i + 1}</td><td>${item.project || ''}</td><td>${item.material || ''}</td>
          <td>${item.unit || ''}</td><td>${item.quantity}</td><td>${item.withdraw_qty}</td>
          <td><strong>${item.remaining}</strong></td><td>${item.remarks || ''}</td>
        </tr>`).join('');
      this.openPrintWindow(
        'Summary of Material Log Monitoring Sheet', this.printDateLabel,
        `<th>#</th><th>Project / Location</th><th>Materials</th><th>Unit</th>
         <th>Quantity</th><th>Withdraw</th><th>Remaining</th><th>Remarks</th>`, rows
      );
    },
    printWithdrawalReport() {
      const rows = this.filteredWithdrawals.map((w, i) => `
        <tr>
          <td>${i + 1}</td><td>${w.item_project || ''}</td><td>${w.material || ''}</td>
          <td>${w.unit || ''}</td><td>${w.quantity_used}</td><td>${w.project_location || ''}</td>
          <td>${this.formatDate(w.withdraw_date)}</td><td>${w.remarks || ''}</td>
        </tr>`).join('');
      this.openPrintWindow(
        'Withdrawal Log Monitoring Sheet', this.withdrawalDateLabel,
        `<th>#</th><th>Project/Location (Stock)</th><th>Material</th><th>Unit</th>
         <th>Qty Used</th><th>Withdrawn To</th><th>Date</th><th>Remarks</th>`, rows
      );
    },
    openPrintWindow(title, dateLabel, headers, rows) {
      const html = `<!DOCTYPE html><html><head><title>${title}</title>
        <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700&display=swap" rel="stylesheet">
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
          h2 { text-align: center; color: #004d26; font-family: 'Merriweather', serif; margin-bottom: 4px; }
          p { text-align: center; margin: 2px 0 16px; color: #555; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #004d26; color: white; padding: 8px; text-align: left; }
          td { padding: 6px 8px; border: 1px solid #ccc; }
          tr:nth-child(even) { background: #f0faf0; }
          .footer { margin-top: 30px; font-size: 11px; color: #888; text-align: right; }
        </style></head><body>
        <h2>${title}</h2>
        <p>${dateLabel}</p>
        <table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>
        <div class="footer">Printed on: ${new Date().toLocaleString()}</div>
        <script>window.onload = () => window.print();<\/script>
        </body></html>`;
      const win = window.open('', '_blank');
      win.document.write(html);
      win.document.close();
    }
  },
  mounted() {
    this.fetchItems();
    this.fetchWithdrawals();
    setTimeout(() => { this.showHeader = true; }, 80);
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@700&family=Source+Sans+3:wght@400;600&display=swap');

* { box-sizing: border-box; }

.app-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #004d26 0%, #0f9d58 60%, #1db954 100%);
  padding: 60px 50px;
  font-family: 'Source Sans 3', Arial, sans-serif;
  box-shadow: inset 0 0 120px rgba(0, 0, 0, 0.25), inset 0 0 60px rgba(0, 77, 38, 0.4);
}

.container {
  max-width: 1380px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 18px;
  padding: 36px;
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.35),
    0 8px 32px rgba(0, 77, 38, 0.3),
    0 0 0 1px rgba(15, 157, 88, 0.15);
}

/* HEADER */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  padding: 24px 20px 22px;
  border-bottom: 3px solid #0f9d58;
  text-align: center;
  border-radius: 10px 10px 0 0;
  /* Green glow shadow */
  box-shadow: 0 4px 32px rgba(15, 157, 88, 0.18), 0 1px 8px rgba(0, 77, 38, 0.10);
  background: linear-gradient(180deg, rgba(240,250,244,0.7) 0%, rgba(255,255,255,0) 100%);
  opacity: 0;
  transform: translateY(-18px);
  transition: opacity 0.0s, transform 0.0s;
}

.header-visible {
  opacity: 1 !important;
  transform: translateY(0) !important;
  transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1) !important;
}

.logo {
  width: 90px;
  height: auto;
  object-fit: contain;
  opacity: 0;
  transform: scale(0.7) rotate(-8deg);
  transition: opacity 0.0s, transform 0.0s;
  filter: drop-shadow(0 4px 16px rgba(15, 157, 88, 0.35));
}

.logo-visible {
  opacity: 1 !important;
  transform: scale(1) rotate(0deg) !important;
  transition: opacity 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.15s, transform 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.15s !important;
}

.header-text h1 {
  font-family: 'Merriweather', serif;
  font-size: 27px;
  font-weight: 700;
  color: #004d26;
  margin: 0 0 5px 0;
  line-height: 1.35;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.0s, transform 0.0s;
  text-shadow: 0 2px 12px rgba(15, 157, 88, 0.15);
}

.title-visible {
  opacity: 1 !important;
  transform: translateY(0) !important;
  transition: opacity 0.7s ease 0.35s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.35s !important;
}

.header-text p {
  margin: 0;
  color: #555;
  font-size: 14px;
  font-weight: 600;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.0s, transform 0.0s;
}

.subtitle-visible {
  opacity: 1 !important;
  transform: translateY(0) !important;
  transition: opacity 0.7s ease 0.52s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.52s !important;
}

.date-label {
  font-size: 13px;
  color: #777;
  font-weight: 600;
  margin: 10px 0 18px;
}

/* TABS */
.tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 22px;
}

.tab {
  padding: 10px 22px;
  background: #e8f5e9;
  border: 2px solid #c8e6c9;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #004d26;
  transition: all 0.2s ease;
}

.tab:hover { background: #c8e6c9; }

.tab-active {
  padding: 10px 22px;
  background: #004d26;
  border: 2px solid #004d26;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: white;
  transition: all 0.2s ease;
}

/* FORM BOX */
.form-box {
  background: linear-gradient(135deg, #f0faf4, #e8f5e9);
  padding: 22px;
  border-radius: 10px;
  margin-bottom: 22px;
  border: 1px solid #c8e6c9;
}

.form-title {
  font-family: 'Merriweather', serif;
  color: #004d26;
  font-size: 16px;
  margin: 0 0 16px 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  font-weight: 700;
  color: #004d26;
  letter-spacing: 0.2px;
}

input, select {
  padding: 9px 12px;
  border: 1.5px solid #a5d6a7;
  border-radius: 6px;
  font-size: 13px;
  width: 100%;
  font-family: 'Source Sans 3', Arial, sans-serif;
  transition: border-color 0.2s;
  background: white;
}

input:focus, select:focus {
  outline: none;
  border-color: #0f9d58;
  box-shadow: 0 0 0 3px rgba(15, 157, 88, 0.12);
}

.form-actions {
  display: flex;
  gap: 10px;
}

/* TOOLBAR */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
  padding: 14px 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.search-input {
  min-width: 240px;
}

.date-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.date-filter label {
  font-weight: 600;
  font-size: 13px;
  color: #004d26;
}

.date-filter input {
  width: auto;
  padding: 7px 10px;
}

.select-input {
  min-width: 160px;
  padding: 8px 10px;
}

/* TABLE */
.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 2px solid #333;
  background: #faf6f0;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

th {
  background: #004d26;
  color: white;
  padding: 11px 10px;
  text-align: left;
  font-family: 'Merriweather', serif;
  font-size: 12px;
  letter-spacing: 0.3px;
  border: 1px solid #003320;
}

td {
  padding: 9px 10px;
  border: 1px solid #555;
  color: #333;
  background: #faf6f0;
}

tr:hover td { background: #f0ece4; }

.row-empty td { background: #f8d7da !important; border-color: #555 !important; }
.row-has-stock td { background: #d4edda !important; border-color: #555 !important; }

.empty-row {
  text-align: center;
  padding: 28px !important;
  color: #888;
  font-style: italic;
}

.remarks-cell {
  font-size: 11px;
  color: #666;
  max-width: 180px;
}

.actions-cell {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}

/* BUTTONS */
button {
  padding: 7px 13px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Source Sans 3', Arial, sans-serif;
  transition: opacity 0.15s, transform 0.1s;
}

button:hover { opacity: 0.88; transform: translateY(-1px); }
button:active { transform: translateY(0); }

.btn-primary { background: #0f9d58; color: white; }
.btn-warning { background: #f9a825; color: #1a1a1a; }
.btn-warning-sm { background: #f9a825; color: #1a1a1a; }
.btn-gray { background: #78909c; color: white; }
.btn-info { background: #039be5; color: white; }
.btn-danger { background: #e53935; color: white; }
.btn-print {
  background: #4a148c;
  color: white;
  padding: 8px 16px;
  font-size: 13px;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  backdrop-filter: blur(2px);
}

.modal {
  background: white;
  padding: 32px;
  border-radius: 12px;
  width: 400px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  border-top: 5px solid #0f9d58;
}

.modal-title {
  font-family: 'Merriweather', serif;
  color: #004d26;
  font-size: 17px;
  margin: 0 0 8px 0;
}

.modal-available {
  color: #555;
  margin: 0 0 14px 0;
  font-size: 13px;
}

.modal input {
  margin: 7px 0;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 18px;
}
</style>
