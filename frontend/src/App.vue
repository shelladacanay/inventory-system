<template>
  <div class="container">
    <h1>📦 Inventory Monitoring System</h1>
    <p class="date">As of: {{ today }}</p>

    <!-- TABS -->
    <div class="tabs">
      <button @click="activeTab = 'inventory'" :class="activeTab === 'inventory' ? 'tab-active' : 'tab'">📦 Inventory</button>
      <button @click="activeTab = 'withdrawals'" :class="activeTab === 'withdrawals' ? 'tab-active' : 'tab'">📋 Withdrawal Log</button>
    </div>

    <!-- ===================== INVENTORY TAB ===================== -->
    <div v-if="activeTab === 'inventory'">
      <div class="form-box">
        <h2>{{ editMode ? '✏️ Edit Item' : '➕ Add Item' }}</h2>
        <div class="form-grid">
          <input v-model="form.project" placeholder="Project / Location" />
          <input v-model="form.material" placeholder="Materials" />
          <input v-model="form.unit" placeholder="Unit (PCS, GAL...)" />
          <input v-model.number="form.quantity" type="number" placeholder="Quantity" />
          <input v-model.number="form.withdraw_qty" type="number" placeholder="Withdraw Qty" />
          <input v-model="form.remarks" placeholder="Remarks" />
        </div>
        <div class="form-actions">
          <button @click="saveItem" :class="editMode ? 'btn-edit' : 'btn-add'">
            {{ editMode ? 'Update Item' : 'Add Item' }}
          </button>
          <button v-if="editMode" @click="cancelEdit" class="btn-cancel">Cancel</button>
        </div>
      </div>

      <div class="toolbar">
        <input v-model="search" placeholder="🔍 Search project or material..." class="search-input"/>
        <div class="date-filter">
          <label>From:</label>
          <input type="date" v-model="dateFrom" />
          <label>To:</label>
          <input type="date" v-model="dateTo" />
          <button @click="clearDates" class="btn-cancel">Clear</button>
        </div>
        <select v-model="selectedMaterial" class="material-select">
          <option value="">-- All Materials --</option>
          <option v-for="mat in uniqueMaterials" :key="mat" :value="mat">{{ mat }}</option>
        </select>
        <select v-model="selectedPeriod" class="material-select" @change="applyPeriod">
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
              <td class="remarks">{{ item.remarks }}</td>
              <td class="actions">
                <button @click="startWithdraw(item)" class="btn-withdraw">Withdraw</button>
                <button @click="editItem(item)" class="btn-edit-sm">Edit</button>
                <button @click="deleteItem(item.id)" class="btn-delete">Delete</button>
              </td>
            </tr>
            <tr v-if="filteredItems.length === 0">
              <td colspan="9" style="text-align:center; padding: 20px;">No items found.</td>
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
          <button @click="wDateFrom=''; wDateTo=''; wSelectedPeriod=''; wSelectedMaterial=''" class="btn-cancel">Clear</button>
        </div>
        <select v-model="wSelectedMaterial" class="material-select">
          <option value="">-- All Materials --</option>
          <option v-for="mat in uniqueMaterials" :key="mat" :value="mat">{{ mat }}</option>
        </select>
        <select v-model="wSelectedPeriod" class="material-select" @change="applyWithdrawalPeriod">
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
              <td colspan="8" style="text-align:center; padding:20px;">No withdrawal records found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- WITHDRAW MODAL -->
    <div v-if="withdrawModal" class="modal-overlay">
      <div class="modal">
        <h3>Withdraw: {{ withdrawItem?.material }}</h3>
        <p>Available: <strong>{{ withdrawItem?.remaining }}</strong></p>
        <input v-model="withdrawProjectLocation" placeholder="Project Location *" />
        <input v-model.number="withdrawAmount" type="number" min="1" :max="withdrawItem?.remaining" placeholder="Quantity to withdraw *" />
        <input v-model="withdrawRemarks" placeholder="Remarks (optional)" />
        <div class="modal-actions">
          <button @click="confirmWithdraw" class="btn-add">Confirm</button>
          <button @click="withdrawModal = false" class="btn-cancel">Cancel</button>
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
      const res = await axios.get(API);
      this.items = res.data;
    },
    async fetchWithdrawals() {
      const res = await axios.get(`${API}/withdrawals/all`);
      this.withdrawals = res.data;
    },
    async saveItem() {
      if (!this.form.material || !this.form.project) return alert('Project and Material are required!');
      if (this.editMode) {
        await axios.put(`${API}/${this.editId}`, this.form);
      } else {
        await axios.post(API, this.form);
      }
      this.resetForm();
      this.fetchItems();
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
      await axios.delete(`${API}/${id}`);
      this.fetchItems();
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
      await axios.patch(`${API}/${this.withdrawItem.id}/withdraw`, {
        amount: this.withdrawAmount,
        project_location: this.withdrawProjectLocation,
        remarks: this.withdrawRemarks
      });
      this.withdrawModal = false;
      this.fetchItems();
      this.fetchWithdrawals();
    },
    resetForm() {
      this.form = { project: '', material: '', unit: '', quantity: 0, withdraw_qty: 0, remarks: '' };
      this.editMode = false;
      this.editId = null;
    },
    rowClass(item) {
      if (item.remaining === 0) return 'row-empty';
      if (item.remaining <= 3) return 'row-low';
      return '';
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
        const first = new Date(now);
        first.setDate(now.getDate() - now.getDay());
        this.dateFrom = first.toISOString().split('T')[0];
        this.dateTo = now.toISOString().split('T')[0];
      } else if (this.selectedPeriod === 'lastweek') {
        const first = new Date(now);
        first.setDate(now.getDate() - now.getDay() - 7);
        const last = new Date(first);
        last.setDate(first.getDate() + 6);
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
        const first = new Date(now);
        first.setDate(now.getDate() - now.getDay());
        this.wDateFrom = first.toISOString().split('T')[0];
        this.wDateTo = now.toISOString().split('T')[0];
      } else if (this.wSelectedPeriod === 'lastweek') {
        const first = new Date(now);
        first.setDate(now.getDate() - now.getDay() - 7);
        const last = new Date(first);
        last.setDate(first.getDate() + 6);
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
          <td>${i + 1}</td>
          <td>${item.project || ''}</td>
          <td>${item.material || ''}</td>
          <td>${item.unit || ''}</td>
          <td>${item.quantity}</td>
          <td>${item.withdraw_qty}</td>
          <td><strong>${item.remaining}</strong></td>
          <td>${item.remarks || ''}</td>
        </tr>`).join('');
      this.openPrintWindow(
        '📦 Summary of Material Log Monitoring Sheet',
        this.printDateLabel,
        `<th>#</th><th>Project / Location</th><th>Materials</th><th>Unit</th>
         <th>Quantity</th><th>Withdraw</th><th>Remaining</th><th>Remarks</th>`,
        rows
      );
    },
   
      printWithdrawalReport() {
  const rows = this.filteredWithdrawals.map((w, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${w.item_project || ''}</td>
      <td>${w.material || ''}</td>
      <td>${w.unit || ''}</td>
      <td>${w.quantity_used}</td>
      <td>${w.project_location || ''}</td>
      <td>${this.formatDate(w.withdraw_date)}</td>
      <td>${w.remarks || ''}</td>
    </tr>`).join('');
  this.openPrintWindow(
    '📋 Withdrawal Log Monitoring Sheet',
    this.withdrawalDateLabel,
    `<th>#</th><th>Project/Location (Stock)</th><th>Material</th><th>Unit</th>
     <th>Qty Used</th><th>Withdrawn To</th><th>Date</th><th>Remarks</th>`,
    rows
  );
},
    openPrintWindow(title, dateLabel, headers, rows) {
      const html = `<!DOCTYPE html><html><head><title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
          h2 { text-align: center; margin-bottom: 4px; }
          p { text-align: center; margin: 2px 0 16px; color: #555; }
          table { width: 100%; border-collapse: collapse; }
          th { background: #2c3e50; color: white; padding: 8px; text-align: left; }
          td { padding: 6px 8px; border: 1px solid #ccc; }
          tr:nth-child(even) { background: #f9f9f9; }
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
  }
};
</script>

<style scoped>
* { box-sizing: border-box; font-family: Arial, sans-serif; }
.container { max-width: 1400px; margin: 0 auto; padding: 20px; }
h1 { color: #2c3e50; }
.date { color: #888; margin-top: -10px; }
.tabs { display: flex; gap: 5px; margin-bottom: 20px; }
.tab { padding: 10px 20px; background: #dee2e6; border: none; border-radius: 6px 6px 0 0; cursor: pointer; font-size: 14px; font-weight: bold; }
.tab-active { padding: 10px 20px; background: #2c3e50; color: white; border: none; border-radius: 6px 6px 0 0; cursor: pointer; font-size: 14px; font-weight: bold; }
.form-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #dee2e6; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 10px; }
input { padding: 8px 12px; border: 1px solid #ccc; border-radius: 5px; width: 100%; font-size: 14px; }
.form-actions { display: flex; gap: 10px; }
.toolbar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 15px; }
.search-input { padding: 8px 12px; border: 1px solid #ccc; border-radius: 5px; font-size: 14px; min-width: 250px; }
.date-filter { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.date-filter label { font-weight: bold; font-size: 13px; }
.date-filter input { padding: 7px 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 13px; width: auto; }
.material-select { padding: 7px 10px; border: 1px solid #ccc; border-radius: 5px; font-size: 13px; min-width: 160px; }
.table-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th { background: #2c3e50; color: white; padding: 10px 8px; text-align: left; }
td { padding: 8px; border-bottom: 1px solid #eee; }
tr:hover { background: #f5f5f5; }
.row-empty { background: #ffcccc !important; }
.row-low { background: #fff3cd !important; }
.remarks { font-size: 11px; color: #555; max-width: 200px; }
.actions { display: flex; gap: 5px; flex-wrap: wrap; }
button { padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: bold; }
.btn-add { background: #28a745; color: white; }
.btn-edit { background: #ffc107; color: black; }
.btn-cancel { background: #6c757d; color: white; }
.btn-withdraw { background: #17a2b8; color: white; }
.btn-edit-sm { background: #ffc107; color: black; }
.btn-delete { background: #dc3545; color: white; }
.btn-print { background: #6f42c1; color: white; padding: 8px 16px; font-size: 13px; }
.modal-overlay { position: fixed; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:999; }
.modal { background: white; padding: 30px; border-radius: 10px; width: 380px; text-align: center; }
.modal input { margin: 8px 0; }
.modal-actions { display: flex; gap: 10px; justify-content: center; margin-top: 15px; }
</style>