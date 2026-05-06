<template>
  <div class="app-wrapper">
    <div class="bg-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="orb orb-4"></div>
    </div>
    <div class="particles">
      <span v-for="n in 18" :key="n" class="particle" :style="`--i:${n}`"></span>
    </div>

    <div class="container" :class="{'container-in': showHeader}">

      <!-- HEADER -->
      <div class="header">
        <div class="header-bg-mesh"></div>
        <div class="header-inner">
          <div class="logo-zone" :class="{'logo-in': showHeader}">
            <div class="logo-halo"></div>
            <img src="@/assets/logo.png" alt="CSU Logo" class="logo" />
            <div class="logo-ring-1"></div>
            <div class="logo-ring-2"></div>
          </div>
          <div class="header-copy" :class="{'copy-in': showHeader}">
            <div class="header-eyebrow">General Services Office · Caraga State University</div>
            <h1 class="header-title">
              <span class="ht-line1">Material Log</span>
              <span class="ht-line2">Monitoring <em>&amp;</em> Inventory</span>
              <span class="ht-line3">System</span>
            </h1>
            <div class="header-underline"></div>
          </div>
          <div class="header-stats-strip" :class="{'strip-in': showHeader}">
            <div class="hstat">
              <span class="hstat-num">{{ items.length }}</span>
              <span class="hstat-label">Items</span>
            </div>
            <div class="hstat-div"></div>
            <div class="hstat">
              <span class="hstat-num green">{{ items.filter(i=>i.remaining>0).length }}</span>
              <span class="hstat-label">In Stock</span>
            </div>
            <div class="hstat-div"></div>
            <div class="hstat">
              <span class="hstat-num red">{{ items.filter(i=>i.remaining<=0).length }}</span>
              <span class="hstat-label">Out of Stock</span>
            </div>
            <div class="hstat-div"></div>
            <div class="hstat">
              <span class="hstat-num gold">{{ withdrawals.length }}</span>
              <span class="hstat-label">Withdrawals</span>
            </div>
          </div>
        </div>
        <div class="header-date-bar">As of: {{ today }}</div>
      </div>

      <div class="main-layout">

        <!-- SIDEBAR -->
        <div class="sidebar">
          <div class="sidebar-brand">MENU</div>
          <button @click="activeTab='inventory'" :class="activeTab==='inventory'?'nav-active':'nav-item'">
            <span class="nav-ico">▣</span><span>Inventory</span>
          </button>
          <button @click="activeTab='withdrawals'" :class="activeTab==='withdrawals'?'nav-active':'nav-item'">
            <span class="nav-ico">≡</span><span>Withdrawal Log</span>
          </button>
          <button @click="activeTab='polist'" :class="activeTab==='polist'?'nav-active':'nav-item'">
            <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg><span>PO LIST</span>
          </button>
        </div>

        <!-- MAIN CONTENT -->
        <div class="main-content">

          <!-- INVENTORY TAB -->
          <div v-if="activeTab==='inventory'" class="tab-pane">
            <div class="form-toggle">
              <button @click="formMode='single'" :class="formMode==='single'?'toggle-active':'toggle-btn'">Single Add</button>
              <button @click="formMode='bulk'" :class="formMode==='bulk'?'toggle-active':'toggle-btn'">Bulk Add</button>
            </div>

            <!-- SINGLE ADD FORM -->
            <div v-if="formMode==='single'" class="form-box">
              <h2 class="form-title">{{ editMode ? 'Edit Item' : 'Add New Item' }}</h2>
              <div class="form-grid">
                <div class="form-field" style="position:relative">
                  <label class="field-label">Project Location :</label>
                  <input v-model="form.project" placeholder="Enter project or location"
                    @input="showProjectSug=true" @blur="hideProjectSug" autocomplete="off"/>
                  <div v-if="showProjectSug && projectSuggestions.length" class="suggestions-box">
                    <div v-for="p in projectSuggestions" :key="p" class="suggestion-item" @mousedown.prevent="pickProject(p)">{{ p }}</div>
                  </div>
                </div>
                <div class="form-field" style="position:relative">
                  <label class="field-label">Materials :</label>
                  <input v-model="form.material" placeholder="Enter material name"
                    @input="showMaterialSug=true" @blur="hideMaterialSug" autocomplete="off"/>
                  <div v-if="showMaterialSug && materialSuggestions.length" class="suggestions-box">
                    <div v-for="m in materialSuggestions" :key="m" class="suggestion-item" @mousedown.prevent="pickMaterial(m)">{{ m }}</div>
                  </div>
                </div>
                <div class="form-field">
                  <label class="field-label">Unit :</label>
                  <select v-model="form.unit">
                    <option value="">-- Select Unit --</option>
                    <option v-for="u in unitOptions" :key="u" :value="u">{{ u }}</option>
                  </select>
                </div>
                <div class="form-field">
                  <label class="field-label">Quantity :</label>
                  <input v-model.number="form.quantity" type="number" placeholder="0" min="0"/>
                </div>
                <div class="form-field">
                  <label class="field-label">Withdraw Qty :</label>
                  <input v-model.number="form.withdraw_qty" type="number" placeholder="0" min="0"/>
                </div>
                <div class="form-field">
                  <label class="field-label">Remarks :</label>
                  <input v-model="form.remarks" placeholder="Optional notes"/>
                </div>
              </div>
              <div class="form-actions">
                <button @click="saveItem" :class="editMode?'btn-warning':'btn-primary'">{{ editMode?'Update Item':'Add Item' }}</button>
                <button v-if="editMode" @click="cancelEdit" class="btn-gray">Cancel</button>
              </div>
            </div>

            <!-- BULK ADD FORM -->
            <div v-if="formMode==='bulk'" class="form-box">
              <h2 class="form-title">Bulk Add Items</h2>
              <p class="bulk-hint">Add multiple items at once. Use the copy or remove buttons per row.</p>
              <div class="bulk-table-wrapper">
                <table class="bulk-table">
                  <thead><tr>
                    <th>#</th><th>Project Location *</th><th>Material *</th>
                    <th>Unit</th><th>Quantity</th><th>Withdraw Qty</th><th>Remarks</th><th>Action</th>
                  </tr></thead>
                  <tbody>
                    <tr v-for="(row,index) in bulkRows" :key="index">
                      <td class="row-num">{{ index+1 }}</td>
                      <td style="position:relative">
                        <input v-model="row.project" placeholder="Project location"
                          @input="activeBulkRow=index;showBulkProjectSug=true"
                          @blur="hideBulkProjectSug" autocomplete="off" class="bulk-input"/>
                        <div v-if="showBulkProjectSug&&activeBulkRow===index&&bulkProjectSuggestions(row.project).length" class="suggestions-box">
                          <div v-for="p in bulkProjectSuggestions(row.project)" :key="p" class="suggestion-item"
                            @mousedown.prevent="row.project=p;showBulkProjectSug=false">{{ p }}</div>
                        </div>
                      </td>
                      <td style="position:relative">
                        <input v-model="row.material" placeholder="Material name"
                          @input="activeBulkRow=index;showBulkMaterialSug=true"
                          @blur="hideBulkMaterialSug" autocomplete="off" class="bulk-input"/>
                        <div v-if="showBulkMaterialSug&&activeBulkRow===index&&bulkMaterialSuggestions(row.material).length" class="suggestions-box">
                          <div v-for="m in bulkMaterialSuggestions(row.material)" :key="m" class="suggestion-item"
                            @mousedown.prevent="row.material=m;showBulkMaterialSug=false">{{ m }}</div>
                        </div>
                      </td>
                      <td><select v-model="row.unit" class="bulk-input"><option value="">-- Unit --</option><option v-for="u in unitOptions" :key="u" :value="u">{{ u }}</option></select></td>
                      <td><input v-model.number="row.quantity" type="number" min="0" placeholder="0" class="bulk-input bulk-num"/></td>
                      <td><input v-model.number="row.withdraw_qty" type="number" min="0" placeholder="0" class="bulk-input bulk-num"/></td>
                      <td><input v-model="row.remarks" placeholder="Optional" class="bulk-input"/></td>
                      <td class="bulk-actions">
                        <button @click="copyRow(index)" class="btn-copy" title="Copy">Copy</button>
                        <button @click="removeRow(index)" class="btn-remove" title="Remove" :disabled="bulkRows.length===1">Del</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="bulk-footer">
                <button @click="addRow" class="btn-add-row">Add Row</button>
                <button @click="addRowWithSameMaterial" class="btn-add-row-same">Same Material</button>
                <div style="flex:1"></div>
                <span class="bulk-count">{{ bulkRows.length }} row{{ bulkRows.length>1?'s':'' }}</span>
                <button @click="clearBulkRows" class="btn-gray">Clear All</button>
                <button @click="saveBulkItems" class="btn-primary" :disabled="bulkSaving">{{ bulkSaving?'Saving...':'Save All Items' }}</button>
              </div>
            </div>

            <!-- TOOLBAR -->
            <div class="toolbar">
              <input v-model="search" placeholder="Search project or material..." class="search-input"/>
              <div class="date-filter">
                <label>From:</label><input type="date" v-model="dateFrom"/>
                <label>To:</label><input type="date" v-model="dateTo"/>
                <button @click="clearDates" class="btn-gray">Clear</button>
              </div>
              <select v-model="selectedMaterial" class="select-input">
                <option value="">-- All Materials --</option>
                <option v-for="mat in uniqueMaterials" :key="mat" :value="mat">{{ mat }}</option>
              </select>
              <input v-model="projectLocationSearch" placeholder="Search Origin Project Location..." class="search-input"/>
              <button @click="printReport" class="btn-print">Print / Download</button>
              <button @click="exportInventoryExcel" class="btn-excel">Export Excel</button>
            </div>

            <!-- SUMMARY CARDS -->
            <div class="summary-cards">
              <div class="card card-blue" @click="setCardFilter('all')" :class="{'card-active':cardFilter==='all'}">
                <div class="card-glow"></div>
                <div class="card-icon-big"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></div>
                <div class="card-value">{{ items.length }}</div>
                <div class="card-label">Total Items</div>
                <div class="card-hint">Click to show all</div>
                <div class="card-shine"></div>
              </div>
              <div class="card card-green" @click="setCardFilter('instock')" :class="{'card-active':cardFilter==='instock'}">
                <div class="card-glow"></div>
                <div class="card-icon-big"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
                <div class="card-value">{{ items.filter(i=>i.remaining>0).length }}</div>
                <div class="card-label">In Stock</div>
                <div class="card-hint">Click to filter</div>
                <div class="card-shine"></div>
              </div>
              <div class="card card-red" @click="setCardFilter('outofstock')" :class="{'card-active':cardFilter==='outofstock'}">
                <div class="card-glow"></div>
                <div class="card-icon-big"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
                <div class="card-value">{{ items.filter(i=>i.remaining<=0).length }}</div>
                <div class="card-label">Out of Stock</div>
                <div class="card-hint">Click to filter</div>
                <div class="card-shine"></div>
              </div>
              <div class="card card-orange" @click="setCardFilter('withdrawn')" :class="{'card-active':cardFilter==='withdrawn'}">
                <div class="card-glow"></div>
                <div class="card-icon-big"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></div>
                <div class="card-value">{{ items.reduce((s,i)=>s+(i.withdraw_qty||0),0) }}</div>
                <div class="card-label">Total Withdrawn</div>
                <div class="card-hint">Click to filter</div>
                <div class="card-shine"></div>
              </div>
            </div>

            <!-- TABLE -->
            <div class="table-wrapper">
              <table>
                <thead><tr>
                  <th>#</th><th>Origin Project Location</th><th>Materials</th>
                  <th>Unit</th><th>Quantity</th><th>Withdraw</th>
                  <th>Remaining</th>
                  <th style="position:relative">Remarks
                    <button @click.stop="showRemarksDropdown = !showRemarksDropdown" class="column-filter-btn" :class="{ 'filter-active': remarksSortOption }">⚙</button>
                    <div v-if="showRemarksDropdown" @click.stop class="column-filter-dropdown" style="min-width: 180px;">
                      <div class="filter-option" @click="remarksSortOption=''; showRemarksDropdown=false" :class="{ 'option-active': !remarksSortOption }">No Filter</div>
                      <div class="filter-option" @click="remarksSortOption='alpha-asc'; showRemarksDropdown=false" :class="{ 'option-active': remarksSortOption==='alpha-asc' }">A-Z</div>
                      <div class="filter-option" @click="remarksSortOption='alpha-desc'; showRemarksDropdown=false" :class="{ 'option-active': remarksSortOption==='alpha-desc' }">Z-A</div>
                      <div style="border-top:1px solid #e0e0e0;margin:6px 0;"></div>
                      <div v-for="opt in remarksSortOptions.slice(3)" :key="opt.value" class="filter-option" @click="remarksSortOption=opt.value; showRemarksDropdown=false" :class="{ 'option-active': remarksSortOption===opt.value }">{{ opt.label }}</div>
                    </div>
                  </th>
                  <th>Date Added</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  <tr v-for="(item,index) in filteredItems" :key="item.id" :class="rowClass(item)">
                    <td>{{ index+1 }}</td>
                    <td>{{ item.project }}</td>
                    <td>{{ item.material }}</td>
                    <td>{{ item.unit }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ item.withdraw_qty||0 }}</td>
                    <td><strong>{{ item.remaining }}</strong></td>
                    <td class="remarks-cell">{{ item.remarks }}</td>
                    <td class="date-cell">{{ item.created_at?formatDate(item.created_at):'—' }}</td>
                    <td class="actions-cell">
                      <button @click="startWithdraw(item)" class="btn-info">Withdraw</button>
                      <button @click="editItem(item)" class="btn-warning-sm">Edit</button>
                      <button @click="confirmDelete(item.id)" class="btn-danger">Delete</button>
                    </td>
                  </tr>
                  <tr v-if="filteredItems.length===0">
                    <td colspan="10" class="empty-row">{{ loading?'Loading items...':'No items found.' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- WITHDRAWAL LOG TAB -->
          <div v-if="activeTab==='withdrawals'" class="tab-pane">
            <div class="inner-tabs">
              <button @click="wInnerTab='inventory'" :class="['inner-tab-btn', wInnerTab==='inventory'?'inner-tab-active':'']">Withdrawal from Inventory</button>
              <button @click="wInnerTab='manual'" :class="['inner-tab-btn', wInnerTab==='manual'?'inner-tab-active':'']">Manual Log</button>
            </div>

            <div v-if="wInnerTab==='inventory'">
              <div class="toolbar">
                <input v-model="wSearch" placeholder="Search all columns..." class="search-input"/>
                <input v-model="wProjectSearch" placeholder="Search Project Location only..." class="search-input"/>
                <div class="date-filter">
                  <label>From:</label><input type="date" v-model="wDateFrom"/>
                  <label>To:</label><input type="date" v-model="wDateTo"/>
                  <button @click="clearWithdrawalDates" class="btn-gray">Clear</button>
                </div>
                <select v-model="wSelectedMaterial" class="select-input">
                  <option value="">-- All Materials --</option>
                  <option v-for="mat in uniqueMaterials" :key="mat" :value="mat">{{ mat }}</option>
                </select>
                <select v-model="wSelectedPeriod" class="select-input" @change="applyWithdrawalPeriod">
                  <option value="">-- Quick Filter --</option>
                  <option value="today">Today</option><option value="week">This Week</option>
                  <option value="lastweek">Last Week</option><option value="month">This Month</option>
                  <option value="lastmonth">Last Month</option><option value="last3months">Last 3 Months</option>
                </select>
                <button @click="printWithdrawalReport" class="btn-print">Print Withdrawal Log</button>
                <button @click="exportWithdrawalExcel" class="btn-excel">Export Excel</button>
                <button @click="showArchiveModal=true" class="btn-archive">Archive Withdrawals</button>
              </div>
              <div class="table-wrapper">
                <table>
                  <thead><tr>
                    <th>#</th>
                    <th style="position:relative">Date
                      <button @click.stop="showWDateSort = !showWDateSort" class="column-filter-btn" :class="{ 'filter-active': wDateSort }">⚙</button>
                      <div v-if="showWDateSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                        <div class="filter-option" @click="wDateSort=''; showWDateSort=false" :class="{ 'option-active': !wDateSort }">No Filter</div>
                        <div class="filter-option" @click="wDateSort='date-asc'; showWDateSort=false" :class="{ 'option-active': wDateSort==='date-asc' }">Oldest First</div>
                        <div class="filter-option" @click="wDateSort='date-desc'; showWDateSort=false" :class="{ 'option-active': wDateSort==='date-desc' }">Newest First</div>
                      </div>
                    </th>
                    <th style="position:relative">Control #
                      <button @click.stop="showWControlSort = !showWControlSort" class="column-filter-btn" :class="{ 'filter-active': wControlNoSort }">⚙</button>
                      <div v-if="showWControlSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                        <div class="filter-option" @click="wControlNoSort=''; showWControlSort=false" :class="{ 'option-active': !wControlNoSort }">No Filter</div>
                        <div class="filter-option" @click="wControlNoSort='alpha-asc'; showWControlSort=false" :class="{ 'option-active': wControlNoSort==='alpha-asc' }">A-Z</div>
                        <div class="filter-option" @click="wControlNoSort='alpha-desc'; showWControlSort=false" :class="{ 'option-active': wControlNoSort==='alpha-desc' }">Z-A</div>
                      </div>
                    </th>
                    <th style="position:relative">Material
                      <button @click.stop="showWMaterialSort = !showWMaterialSort" class="column-filter-btn" :class="{ 'filter-active': wMaterialSort }">⚙</button>
                      <div v-if="showWMaterialSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                        <div class="filter-option" @click="wMaterialSort=''; showWMaterialSort=false" :class="{ 'option-active': !wMaterialSort }">No Filter</div>
                        <div class="filter-option" @click="wMaterialSort='alpha-asc'; showWMaterialSort=false" :class="{ 'option-active': wMaterialSort==='alpha-asc' }">A-Z</div>
                        <div class="filter-option" @click="wMaterialSort='alpha-desc'; showWMaterialSort=false" :class="{ 'option-active': wMaterialSort==='alpha-desc' }">Z-A</div>
                      </div>
                    </th>
                    <th style="position:relative">In-charge
                      <button @click.stop="showWInchargeSort = !showWInchargeSort" class="column-filter-btn" :class="{ 'filter-active': wInchargeSort }">⚙</button>
                      <div v-if="showWInchargeSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                        <div class="filter-option" @click="wInchargeSort=''; showWInchargeSort=false" :class="{ 'option-active': !wInchargeSort }">No Filter</div>
                        <div class="filter-option" @click="wInchargeSort='alpha-asc'; showWInchargeSort=false" :class="{ 'option-active': wInchargeSort==='alpha-asc' }">A-Z</div>
                        <div class="filter-option" @click="wInchargeSort='alpha-desc'; showWInchargeSort=false" :class="{ 'option-active': wInchargeSort==='alpha-desc' }">Z-A</div>
                      </div>
                    </th>
                    <th style="position:relative">Origin Project Location
                      <button @click.stop="showWOriginSort = !showWOriginSort" class="column-filter-btn" :class="{ 'filter-active': wOriginSort }">⚙</button>
                      <div v-if="showWOriginSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                        <div class="filter-option" @click="wOriginSort=''; showWOriginSort=false" :class="{ 'option-active': !wOriginSort }">No Filter</div>
                        <div class="filter-option" @click="wOriginSort='alpha-asc'; showWOriginSort=false" :class="{ 'option-active': wOriginSort==='alpha-asc' }">A-Z</div>
                        <div class="filter-option" @click="wOriginSort='alpha-desc'; showWOriginSort=false" :class="{ 'option-active': wOriginSort==='alpha-desc' }">Z-A</div>
                      </div>
                    </th>
                    <th style="position:relative">Qty
                      <button @click.stop="showWQtySort = !showWQtySort" class="column-filter-btn" :class="{ 'filter-active': wQtySort }">⚙</button>
                      <div v-if="showWQtySort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                        <div class="filter-option" @click="wQtySort=''; showWQtySort=false" :class="{ 'option-active': !wQtySort }">No Filter</div>
                        <div class="filter-option" @click="wQtySort='num-asc'; showWQtySort=false" :class="{ 'option-active': wQtySort==='num-asc' }">Low to High</div>
                        <div class="filter-option" @click="wQtySort='num-desc'; showWQtySort=false" :class="{ 'option-active': wQtySort==='num-desc' }">High to Low</div>
                      </div>
                    </th>
                    <th style="position:relative">Project Location
                      <button @click.stop="showWLocationSort = !showWLocationSort" class="column-filter-btn" :class="{ 'filter-active': wLocationSort }">⚙</button>
                      <div v-if="showWLocationSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                        <div class="filter-option" @click="wLocationSort=''; showWLocationSort=false" :class="{ 'option-active': !wLocationSort }">No Filter</div>
                        <div class="filter-option" @click="wLocationSort='alpha-asc'; showWLocationSort=false" :class="{ 'option-active': wLocationSort==='alpha-asc' }">A-Z</div>
                        <div class="filter-option" @click="wLocationSort='alpha-desc'; showWLocationSort=false" :class="{ 'option-active': wLocationSort==='alpha-desc' }">Z-A</div>
                      </div>
                    </th>
                    <th style="position:relative">Remarks
                      <button @click.stop="showWRemarksSort = !showWRemarksSort" class="column-filter-btn" :class="{ 'filter-active': wRemarksSort }">⚙</button>
                      <div v-if="showWRemarksSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                        <div class="filter-option" @click="wRemarksSort=''; showWRemarksSort=false" :class="{ 'option-active': !wRemarksSort }">No Filter</div>
                        <div class="filter-option" @click="wRemarksSort='alpha-asc'; showWRemarksSort=false" :class="{ 'option-active': wRemarksSort==='alpha-asc' }">A-Z</div>
                        <div class="filter-option" @click="wRemarksSort='alpha-desc'; showWRemarksSort=false" :class="{ 'option-active': wRemarksSort==='alpha-desc' }">Z-A</div>
                      </div>
                    </th>
                    <th>Actions</th>
                  </tr></thead>
                  <tbody>
                    <tr v-for="(w,index) in filteredWithdrawals" :key="w.id">
                      <td>{{ index+1 }}</td>
                      <td class="date-cell">{{ formatDate(w.withdraw_date) }}</td>
                      <td>{{ w.control_no || '—' }}</td>
                      <td>{{ w.material }}</td>
                      <td>{{ w.incharge || '—' }}</td>
                      <td>{{ w.item_project }}</td>
                      <td><strong>{{ w.quantity_used }}</strong></td>
                      <td>{{ w.project_location }}</td>
                      <td class="remarks-cell">{{ w.remarks || '—' }}</td>
                      <td class="actions-cell">
                        <button @click="editWithdrawal(w)" class="btn-warning-sm">Edit</button>
                        <button @click="deleteWithdrawal(w)" class="btn-danger">Delete</button>
                      </td>
                    </tr>
                    <tr v-if="filteredWithdrawals.length===0">
                      <td colspan="10" class="empty-row">No withdrawal records found.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-if="wInnerTab==='manual'">
              <div class="form-box" style="margin-bottom:16px;">
                <h2 class="form-title">{{ manualEditMode ? 'Edit Manual Entry' : 'Add Manual Entry' }}</h2>
                <div class="form-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));">
                  <div class="form-field"><label class="field-label">Date :</label><input type="date" v-model="manualForm.log_date"/></div>
                  <div class="form-field"><label class="field-label">Control # :</label><input v-model="manualForm.control_no" placeholder="e.g. RIS-101-26-03-001"/></div>
                  <div class="form-field" style="position:relative"><label class="field-label">Material :</label><input v-model="manualForm.material" placeholder="Material name" @input="showManualMaterialSug=true" @blur="hideManualMaterialSug" autocomplete="off"/><div v-if="showManualMaterialSug && manualMaterialSuggestions.length" class="suggestions-box"><div v-for="m in manualMaterialSuggestions" :key="m" class="suggestion-item" @mousedown.prevent="pickManualMaterial(m)">{{ m }}</div></div></div>
                  <div class="form-field"><label class="field-label">Unit :</label><select v-model="manualForm.unit" class="select-input"><option value="">-- Select Unit --</option><option v-for="u in allUnitOptions" :key="u" :value="u">{{ u }}</option></select></div>
                  <div class="form-field" style="position:relative"><label class="field-label">In-charge :</label><input v-model="manualForm.incharge" placeholder="Person in-charge" @input="showManualInchargeSug=true" @blur="hideManualInchargeSug" autocomplete="off"/><div v-if="showManualInchargeSug && manualInchargeSuggestions.length" class="suggestions-box"><div v-for="i in manualInchargeSuggestions" :key="i" class="suggestion-item" @mousedown.prevent="pickManualIncharge(i)">{{ i }}</div></div></div>
                  <div class="form-field" style="position:relative"><label class="field-label">Origin Project Location :</label><input v-model="manualForm.origin_project" placeholder="Origin location" @input="showManualOriginSug=true" @blur="hideManualOriginSug" autocomplete="off"/><div v-if="showManualOriginSug && manualOriginSuggestions.length" class="suggestions-box"><div v-for="o in manualOriginSuggestions" :key="o" class="suggestion-item" @mousedown.prevent="pickManualOrigin(o)">{{ o }}</div></div></div>
                  <div class="form-field"><label class="field-label">Qty :</label><input type="number" v-model.number="manualForm.qty" min="0" placeholder="0"/></div>
                  <div class="form-field" style="position:relative"><label class="field-label">Project Location :</label><input v-model="manualForm.project_location" placeholder="Project location" @input="showManualLocationSug=true" @blur="hideManualLocationSug" autocomplete="off"/><div v-if="showManualLocationSug && manualLocationSuggestions.length" class="suggestions-box"><div v-for="l in manualLocationSuggestions" :key="l" class="suggestion-item" @mousedown.prevent="pickManualLocation(l)">{{ l }}</div></div></div>
                  <div class="form-field"><label class="field-label">Remarks :</label><input v-model="manualForm.remarks" placeholder="Optional notes"/></div>
                </div>
                <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;">
                  <button @click="saveManualLog" class="btn-primary" :disabled="manualSaving">{{ manualSaving ? 'Saving...' : (manualEditMode ? 'Update Entry' : 'Add Entry') }}</button>
                  <button v-if="manualEditMode" @click="cancelManualEdit" class="btn-gray">Cancel</button>
                </div>
              </div>
              <div class="toolbar">
                <input v-model="manualSearch" placeholder="Search manual log..." class="search-input"/>
                <div class="date-filter">
                  <label>From:</label><input type="date" v-model="manualDateFrom"/>
                  <label>To:</label><input type="date" v-model="manualDateTo"/>
                  <button @click="manualDateFrom='';manualDateTo=''" class="btn-gray">Clear</button>
                </div>
                <button @click="printManualLog" class="btn-print">Print</button>
                <button @click="exportManualLogExcel" class="btn-excel">Export Excel</button>
              </div>
              <div class="table-wrapper">
                <table>
                  <thead><tr>
                    <th>#</th>
                    <th style="position:relative">Date
                      <button @click.stop="showManualDateSort = !showManualDateSort" class="column-filter-btn" :class="{ 'filter-active': manualDateSort }">⚙</button>
                      <div v-if="showManualDateSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                        <div class="filter-option" @click="manualDateSort=''; showManualDateSort=false" :class="{ 'option-active': !manualDateSort }">No Filter</div>
                        <div class="filter-option" @click="manualDateSort='date-asc'; showManualDateSort=false" :class="{ 'option-active': manualDateSort==='date-asc' }">Oldest First</div>
                        <div class="filter-option" @click="manualDateSort='date-desc'; showManualDateSort=false" :class="{ 'option-active': manualDateSort==='date-desc' }">Newest First</div>
                      </div>
                    </th>
                    <th style="position:relative">Control #
                      <button @click.stop="showManualControlSort = !showManualControlSort" class="column-filter-btn" :class="{ 'filter-active': manualControlSort }">⚙</button>
                      <div v-if="showManualControlSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                        <div class="filter-option" @click="manualControlSort=''; showManualControlSort=false" :class="{ 'option-active': !manualControlSort }">No Filter</div>
                        <div class="filter-option" @click="manualControlSort='alpha-asc'; showManualControlSort=false" :class="{ 'option-active': manualControlSort==='alpha-asc' }">A-Z</div>
                        <div class="filter-option" @click="manualControlSort='alpha-desc'; showManualControlSort=false" :class="{ 'option-active': manualControlSort==='alpha-desc' }">Z-A</div>
                      </div>
                    </th>
                    <th style="position:relative">Material
                      <button @click.stop="showManualMaterialSort = !showManualMaterialSort" class="column-filter-btn" :class="{ 'filter-active': manualMaterialSort }">⚙</button>
                      <div v-if="showManualMaterialSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                        <div class="filter-option" @click="manualMaterialSort=''; showManualMaterialSort=false" :class="{ 'option-active': !manualMaterialSort }">No Filter</div>
                        <div class="filter-option" @click="manualMaterialSort='alpha-asc'; showManualMaterialSort=false" :class="{ 'option-active': manualMaterialSort==='alpha-asc' }">A-Z</div>
                        <div class="filter-option" @click="manualMaterialSort='alpha-desc'; showManualMaterialSort=false" :class="{ 'option-active': manualMaterialSort==='alpha-desc' }">Z-A</div>
                      </div>
                    </th>
                    <th style="position:relative">Unit
                      <button @click.stop="showManualUnitSort = !showManualUnitSort" class="column-filter-btn" :class="{ 'filter-active': manualUnitSort }">⚙</button>
                      <div v-if="showManualUnitSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                        <div class="filter-option" @click="manualUnitSort=''; showManualUnitSort=false" :class="{ 'option-active': !manualUnitSort }">No Filter</div>
                        <div class="filter-option" @click="manualUnitSort='alpha-asc'; showManualUnitSort=false" :class="{ 'option-active': manualUnitSort==='alpha-asc' }">A-Z</div>
                        <div class="filter-option" @click="manualUnitSort='alpha-desc'; showManualUnitSort=false" :class="{ 'option-active': manualUnitSort==='alpha-desc' }">Z-A</div>
                      </div>
                    </th>
                    <th style="position:relative">In-charge
                      <button @click.stop="showManualInchargeSort = !showManualInchargeSort" class="column-filter-btn" :class="{ 'filter-active': manualInchargeSort }">⚙</button>
                      <div v-if="showManualInchargeSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                        <div class="filter-option" @click="manualInchargeSort=''; showManualInchargeSort=false" :class="{ 'option-active': !manualInchargeSort }">No Filter</div>
                        <div class="filter-option" @click="manualInchargeSort='alpha-asc'; showManualInchargeSort=false" :class="{ 'option-active': manualInchargeSort==='alpha-asc' }">A-Z</div>
                        <div class="filter-option" @click="manualInchargeSort='alpha-desc'; showManualInchargeSort=false" :class="{ 'option-active': manualInchargeSort==='alpha-desc' }">Z-A</div>
                      </div>
                    </th>
                    <th style="position:relative">Origin Project Location
                      <button @click.stop="showManualOriginSort = !showManualOriginSort" class="column-filter-btn" :class="{ 'filter-active': manualOriginSort }">⚙</button>
                      <div v-if="showManualOriginSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                        <div class="filter-option" @click="manualOriginSort=''; showManualOriginSort=false" :class="{ 'option-active': !manualOriginSort }">No Filter</div>
                        <div class="filter-option" @click="manualOriginSort='alpha-asc'; showManualOriginSort=false" :class="{ 'option-active': manualOriginSort==='alpha-asc' }">A-Z</div>
                        <div class="filter-option" @click="manualOriginSort='alpha-desc'; showManualOriginSort=false" :class="{ 'option-active': manualOriginSort==='alpha-desc' }">Z-A</div>
                      </div>
                    </th>
                    <th style="position:relative">Qty
                      <button @click.stop="showManualQtySort = !showManualQtySort" class="column-filter-btn" :class="{ 'filter-active': manualQtySort }">⚙</button>
                      <div v-if="showManualQtySort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                        <div class="filter-option" @click="manualQtySort=''; showManualQtySort=false" :class="{ 'option-active': !manualQtySort }">No Filter</div>
                        <div class="filter-option" @click="manualQtySort='num-asc'; showManualQtySort=false" :class="{ 'option-active': manualQtySort==='num-asc' }">Low to High</div>
                        <div class="filter-option" @click="manualQtySort='num-desc'; showManualQtySort=false" :class="{ 'option-active': manualQtySort==='num-desc' }">High to Low</div>
                      </div>
                    </th>
                    <th style="position:relative">Project Location
                      <button @click.stop="showManualLocationSort = !showManualLocationSort" class="column-filter-btn" :class="{ 'filter-active': manualLocationSort }">⚙</button>
                      <div v-if="showManualLocationSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                        <div class="filter-option" @click="manualLocationSort=''; showManualLocationSort=false" :class="{ 'option-active': !manualLocationSort }">No Filter</div>
                        <div class="filter-option" @click="manualLocationSort='alpha-asc'; showManualLocationSort=false" :class="{ 'option-active': manualLocationSort==='alpha-asc' }">A-Z</div>
                        <div class="filter-option" @click="manualLocationSort='alpha-desc'; showManualLocationSort=false" :class="{ 'option-active': manualLocationSort==='alpha-desc' }">Z-A</div>
                      </div>
                    </th>
                    <th style="position:relative">Remarks
                      <button @click.stop="showManualRemarksSort = !showManualRemarksSort" class="column-filter-btn" :class="{ 'filter-active': manualRemarksSort }">⚙</button>
                      <div v-if="showManualRemarksSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                        <div class="filter-option" @click="manualRemarksSort=''; showManualRemarksSort=false" :class="{ 'option-active': !manualRemarksSort }">No Filter</div>
                        <div class="filter-option" @click="manualRemarksSort='alpha-asc'; showManualRemarksSort=false" :class="{ 'option-active': manualRemarksSort==='alpha-asc' }">A-Z</div>
                        <div class="filter-option" @click="manualRemarksSort='alpha-desc'; showManualRemarksSort=false" :class="{ 'option-active': manualRemarksSort==='alpha-desc' }">Z-A</div>
                      </div>
                    </th>
                    <th>Actions</th>
                  </tr></thead>
                  <tbody>
                    <tr v-for="(log,index) in filteredManualLogs" :key="log.id">
                      <td>{{ index+1 }}</td>
                      <td class="date-cell">{{ log.log_date ? formatDate2(log.log_date) : '—' }}</td>
                      <td>{{ log.control_no || '—' }}</td>
                      <td>{{ log.material }}</td>
                      <td>{{ log.unit || '—' }}</td>
                      <td>{{ log.incharge || '—' }}</td>
                      <td>{{ log.origin_project }}</td>
                      <td><strong>{{ log.qty }}</strong></td>
                      <td>{{ log.project_location }}</td>
                      <td class="remarks-cell">{{ log.remarks }}</td>
                      <td class="actions-cell">
                        <button @click="editManualLog(log)" class="btn-warning-sm">Edit</button>
                        <button @click="deleteManualLogEntry(log.id)" class="btn-danger">Delete</button>
                      </td>
                    </tr>
                    <tr v-if="filteredManualLogs.length===0">
                      <td colspan="11" class="empty-row">No manual log entries yet.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- PO LIST TAB -->
          <div v-if="activeTab==='polist'" class="tab-pane">

            <!-- ADD/EDIT PO FORM -->
            <div class="form-box" v-if="showPOForm">
              <h2 class="form-title">{{ poEditMode ? 'Edit Purchase Order' : 'Add Purchase Order' }}</h2>

              <div class="po-section-label">Basic Information</div>
              <div class="form-grid">
                <!-- SOURCE OF FUND -->
                <div class="form-field" style="position:relative">
                  <label class="field-label">Source of Fund :</label>
                  <input v-model="poForm.source_of_fund" placeholder="e.g. General Fund" autocomplete="off"
                    @focus="poSuggestField='source_of_fund'" @blur="hidePOSug" @input="poSuggestField='source_of_fund'"/>
                  <div v-if="poSuggestField==='source_of_fund' && poSuggest('source_of_fund', poForm.source_of_fund).length" class="suggestions-box">
                    <div v-for="s in poSuggest('source_of_fund', poForm.source_of_fund)" :key="s" class="suggestion-item"
                      @mousedown.prevent="poForm.source_of_fund=s;poSuggestField=''">{{ s }}</div>
                  </div>
                </div>
                <!-- WORK DESCRIPTION -->
                <div class="form-field" style="position:relative">
                  <label class="field-label">Work Description :</label>
                  <input v-model="poForm.work_description" placeholder="e.g. Facade, Main Gate" autocomplete="off"
                    @focus="poSuggestField='work_description'" @blur="hidePOSug" @input="poSuggestField='work_description'"/>
                  <div v-if="poSuggestField==='work_description' && poSuggest('work_description', poForm.work_description).length" class="suggestions-box">
                    <div v-for="s in poSuggest('work_description', poForm.work_description)" :key="s" class="suggestion-item"
                      @mousedown.prevent="poForm.work_description=s;poSuggestField=''">{{ s }}</div>
                  </div>
                </div>
                <!-- SUPPLIER -->
                <div class="form-field" style="position:relative">
                  <label class="field-label">Supplier :</label>
                  <input v-model="poForm.supplier" placeholder="Supplier name" autocomplete="off"
                    @focus="poSuggestField='supplier'" @blur="hidePOSug" @input="poSuggestField='supplier'"/>
                  <div v-if="poSuggestField==='supplier' && poSuggest('supplier', poForm.supplier).length" class="suggestions-box">
                    <div v-for="s in poSuggest('supplier', poForm.supplier)" :key="s" class="suggestion-item"
                      @mousedown.prevent="poForm.supplier=s;poSuggestField=''">{{ s }}</div>
                  </div>
                </div>
                <!-- PR NO -->
                <div class="form-field" style="position:relative">
                  <label class="field-label">P.R. No. :</label>
                  <input v-model="poForm.pr_no" placeholder="e.g. RAF-101-25-03-101" autocomplete="off"
                    @focus="poSuggestField='pr_no'" @blur="hidePOSug" @input="poSuggestField='pr_no'"/>
                  <div v-if="poSuggestField==='pr_no' && poSuggest('pr_no', poForm.pr_no).length" class="suggestions-box">
                    <div v-for="s in poSuggest('pr_no', poForm.pr_no)" :key="s" class="suggestion-item"
                      @mousedown.prevent="poForm.pr_no=s;poSuggestField=''">{{ s }}</div>
                  </div>
                </div>
                <!-- PO NO -->
                <div class="form-field" style="position:relative">
                  <label class="field-label">P.O. No. :</label>
                  <input v-model="poForm.po_no" placeholder="e.g. RAF-101-25-04-117" autocomplete="off"
                    @focus="poSuggestField='po_no'" @blur="hidePOSug" @input="poSuggestField='po_no'"/>
                  <div v-if="poSuggestField==='po_no' && poSuggest('po_no', poForm.po_no).length" class="suggestions-box">
                    <div v-for="s in poSuggest('po_no', poForm.po_no)" :key="s" class="suggestion-item"
                      @mousedown.prevent="poForm.po_no=s;poSuggestField=''">{{ s }}</div>
                  </div>
                </div>
                <!-- RIS NO -->
                <div class="form-field" style="position:relative">
                  <label class="field-label">RIS No. :</label>
                  <input v-model="poForm.ris_no" placeholder="e.g. RIS-101-25-04-001" autocomplete="off"
                    @focus="poSuggestField='ris_no'" @blur="hidePOSug" @input="poSuggestField='ris_no'"/>
                  <div v-if="poSuggestField==='ris_no' && poSuggest('ris_no', poForm.ris_no).length" class="suggestions-box">
                    <div v-for="s in poSuggest('ris_no', poForm.ris_no)" :key="s" class="suggestion-item"
                      @mousedown.prevent="poForm.ris_no=s;poSuggestField=''">{{ s }}</div>
                  </div>
                </div>
                <div class="form-field">
                  <label class="field-label">Status :</label>
                  <select v-model="poForm.status">
                    <option value="">-- Select Status --</option>
                    <option value="Pending">Pending</option>
                    <option value="Delivered">Delivered</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div class="form-field">
                  <label class="field-label">POW Status :</label>
                  <select v-model="poForm.pow_status">
                    <option value="">-- Select POW Status --</option>
                    <option value="Pending">Pending</option>
                    <option value="On-going">On-going</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div class="po-section-label" style="margin-top:14px">▣ Delivery Dates</div>
              <div class="form-grid">
                <div class="form-field"><label class="field-label">Date Delivered :</label><input type="date" v-model="poForm.date_delivered"/></div>
                <div class="form-field"><label class="field-label">Partial Delivery Date :</label><input type="date" v-model="poForm.delivery_date_started"/></div>
                <div class="form-field"><label class="field-label">Delivery Date Completed :</label><input type="date" v-model="poForm.delivery_date_completed"/></div>
              </div>

              <div class="po-section-label" style="margin-top:14px">WORK DATES</div>
              <div class="form-grid">
                <div class="form-field"><label class="field-label">Work Date Started :</label><input type="date" v-model="poForm.date_started"/></div>
                <div class="form-field"><label class="field-label">Work Date Completed :</label><input type="date" v-model="poForm.date_completed"/></div>
              </div>

              <h3 class="form-title" style="margin-top:16px">PO Items</h3>
              <div class="bulk-table-wrapper">
                <table class="bulk-table">
                  <thead><tr>
                    <th style="width:30px">#</th><th style="min-width:200px">Description</th><th style="width:100px">Unit</th><th style="width:70px">Qty</th>
                    <th style="width:100px">Unit Cost</th><th style="width:110px">Amount</th><th style="width:130px">Partial Delivery (Qty)</th><th style="width:120px">Status</th><th style="min-width:160px">Remarks</th><th style="width:60px">Action</th>
                  </tr></thead>
                  <tbody>
                    <tr v-for="(row, index) in poForm.items" :key="index">
                      <td class="row-num">{{ index+1 }}</td>
                      <!-- DESCRIPTION WITH AUTOCOMPLETE -->
                      <td style="position:relative">
                        <input v-model="row.description" placeholder="Description" class="bulk-input" :title="row.description" style="min-width:190px"
                          autocomplete="off"
                          @focus="poSuggestField='desc_'+index" @blur="hidePOSug" @input="poSuggestField='desc_'+index"/>
                        <div v-if="poSuggestField==='desc_'+index && poSuggest('description', row.description).length" class="suggestions-box" style="z-index:300">
                          <div v-for="s in poSuggest('description', row.description)" :key="s" class="suggestion-item"
                            @mousedown.prevent="row.description=s;poSuggestField=''">{{ s }}</div>
                        </div>
                      </td>
                      <td>
                        <select v-model="row.unit" class="bulk-input">
                          <option value="">-- Unit --</option>
                          <option v-for="u in allUnitOptions" :key="u" :value="u">{{ u }}</option>
                        </select>
                      </td>
                      <td><input v-model.number="row.quantity" type="number" min="0" placeholder="0" class="bulk-input bulk-num"/></td>
                      <td><input v-model.number="row.unit_cost" type="number" min="0" placeholder="0.00" class="bulk-input bulk-num"/></td>
                      <td><input :value="((row.quantity||0) * (row.unit_cost||0)).toFixed(2)" readonly class="bulk-input bulk-num" style="background:#f0faf4;font-weight:700;color:#004d26"/></td>
                      <td><input v-model.number="row.partial_delivery" type="number" min="0" placeholder="0" class="bulk-input bulk-num"/></td>
                      <td>
                        <select v-model="row.item_status" class="bulk-input">
                          <option value="">-- Status --</option>
                          <option value="Pending">Pending</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Partial">Partial</option>
                          <option value="Replaced">Replaced</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td><input v-model="row.remarks" placeholder="Remarks" class="bulk-input"/></td>
                      <td class="bulk-actions">
                        <button @click="removePOItem(index)" class="btn-remove" :disabled="poForm.items.length===1">Del</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="bulk-footer" style="margin-bottom:16px">
                <button @click="addPOItem" class="btn-add-row">Add Item</button>
                <div style="flex:1"></div>
                <div style="font-weight:700;color:#004d26;font-size:14px">
                  TOTAL: &#x20B1;{{ poFormTotal.toLocaleString('en-PH', {minimumFractionDigits:2}) }}
                </div>
              </div>
              <div class="form-actions">
                <button @click="savePO" :class="poEditMode?'btn-warning':'btn-primary'">{{ poEditMode ? 'Update PO' : 'Save PO' }}</button>
                <button @click="cancelPOForm" class="btn-gray">Cancel</button>
              </div>
            </div>

            <!-- PO TOOLBAR -->
            <div class="toolbar">
              <input v-model="poSearch" placeholder="Search PO (any column)..." class="search-input"/>
              <button @click="showPOForm=true;poEditMode=false;resetPOForm()" class="btn-primary">Add PO</button>
              <button @click="printPOList" class="btn-print">Print PO List</button>
              <button @click="exportPOListExcel" class="btn-excel">Export Excel</button>
            </div>

            <!-- PO TABLE -->
            <div class="table-wrapper">
              <table>
                <thead><tr>
                  <th>#</th>
                  <th style="position:relative">Source of Fund
                    <button @click.stop="showPoSourceSort = !showPoSourceSort" class="column-filter-btn" :class="{ 'filter-active': poListSourceSort }">⚙</button>
                    <div v-if="showPoSourceSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                      <div class="filter-option" @click="poListSourceSort=''; showPoSourceSort=false" :class="{ 'option-active': !poListSourceSort }">No Filter</div>
                      <div class="filter-option" @click="poListSourceSort='alpha-asc'; showPoSourceSort=false" :class="{ 'option-active': poListSourceSort==='alpha-asc' }">A-Z</div>
                      <div class="filter-option" @click="poListSourceSort='alpha-desc'; showPoSourceSort=false" :class="{ 'option-active': poListSourceSort==='alpha-desc' }">Z-A</div>
                    </div>
                  </th>
                  <th style="position:relative">Work Description
                    <button @click.stop="showPoWorkDescSort = !showPoWorkDescSort" class="column-filter-btn" :class="{ 'filter-active': poListWorkDescSort }">⚙</button>
                    <div v-if="showPoWorkDescSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                      <div class="filter-option" @click="poListWorkDescSort=''; showPoWorkDescSort=false" :class="{ 'option-active': !poListWorkDescSort }">No Filter</div>
                      <div class="filter-option" @click="poListWorkDescSort='alpha-asc'; showPoWorkDescSort=false" :class="{ 'option-active': poListWorkDescSort==='alpha-asc' }">A-Z</div>
                      <div class="filter-option" @click="poListWorkDescSort='alpha-desc'; showPoWorkDescSort=false" :class="{ 'option-active': poListWorkDescSort==='alpha-desc' }">Z-A</div>
                    </div>
                  </th>
                  <th style="position:relative">Supplier
                    <button @click.stop="showPoSupplierSort = !showPoSupplierSort" class="column-filter-btn" :class="{ 'filter-active': poListSupplierSort }">⚙</button>
                    <div v-if="showPoSupplierSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                      <div class="filter-option" @click="poListSupplierSort=''; showPoSupplierSort=false" :class="{ 'option-active': !poListSupplierSort }">No Filter</div>
                      <div class="filter-option" @click="poListSupplierSort='alpha-asc'; showPoSupplierSort=false" :class="{ 'option-active': poListSupplierSort==='alpha-asc' }">A-Z</div>
                      <div class="filter-option" @click="poListSupplierSort='alpha-desc'; showPoSupplierSort=false" :class="{ 'option-active': poListSupplierSort==='alpha-desc' }">Z-A</div>
                    </div>
                  </th>
                  <th style="position:relative">P.O. No.
                    <button @click.stop="showPoPoNoSort = !showPoPoNoSort" class="column-filter-btn" :class="{ 'filter-active': poListPONoSort }">⚙</button>
                    <div v-if="showPoPoNoSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                      <div class="filter-option" @click="poListPONoSort=''; showPoPoNoSort=false" :class="{ 'option-active': !poListPONoSort }">No Filter</div>
                      <div class="filter-option" @click="poListPONoSort='alpha-asc'; showPoPoNoSort=false" :class="{ 'option-active': poListPONoSort==='alpha-asc' }">A-Z</div>
                      <div class="filter-option" @click="poListPONoSort='alpha-desc'; showPoPoNoSort=false" :class="{ 'option-active': poListPONoSort==='alpha-desc' }">Z-A</div>
                    </div>
                  </th>
                  <th style="position:relative">P.R. No.
                    <button @click.stop="showPoPRNoSort = !showPoPRNoSort" class="column-filter-btn" :class="{ 'filter-active': poListPRNoSort }">⚙</button>
                    <div v-if="showPoPRNoSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                      <div class="filter-option" @click="poListPRNoSort=''; showPoPRNoSort=false" :class="{ 'option-active': !poListPRNoSort }">No Filter</div>
                      <div class="filter-option" @click="poListPRNoSort='alpha-asc'; showPoPRNoSort=false" :class="{ 'option-active': poListPRNoSort==='alpha-asc' }">A-Z</div>
                      <div class="filter-option" @click="poListPRNoSort='alpha-desc'; showPoPRNoSort=false" :class="{ 'option-active': poListPRNoSort==='alpha-desc' }">Z-A</div>
                    </div>
                  </th>
                  <th style="position:relative">Delivery Completed
                    <button @click.stop="showPoDeliverySort = !showPoDeliverySort" class="column-filter-btn" :class="{ 'filter-active': poListDeliverySort }">⚙</button>
                    <div v-if="showPoDeliverySort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                      <div class="filter-option" @click="poListDeliverySort=''; showPoDeliverySort=false" :class="{ 'option-active': !poListDeliverySort }">No Filter</div>
                      <div class="filter-option" @click="poListDeliverySort='alpha-asc'; showPoDeliverySort=false" :class="{ 'option-active': poListDeliverySort==='alpha-asc' }">Yes</div>
                      <div class="filter-option" @click="poListDeliverySort='alpha-desc'; showPoDeliverySort=false" :class="{ 'option-active': poListDeliverySort==='alpha-desc' }">No</div>
                    </div>
                  </th>
                  <th style="position:relative">Status
                    <button @click.stop="showPoStatusSort = !showPoStatusSort" class="column-filter-btn" :class="{ 'filter-active': poListStatusSort }">⚙</button>
                    <div v-if="showPoStatusSort" @click.stop class="column-filter-dropdown" style="min-width: 160px;">
                      <div class="filter-option" @click="poListStatusSort=''; showPoStatusSort=false" :class="{ 'option-active': !poListStatusSort }">No Filter</div>
                      <div class="filter-option" @click="poListStatusSort='Pending'; showPoStatusSort=false" :class="{ 'option-active': poListStatusSort==='Pending' }">Pending</div>
                      <div class="filter-option" @click="poListStatusSort='In Progress'; showPoStatusSort=false" :class="{ 'option-active': poListStatusSort==='In Progress' }">In Progress</div>
                      <div class="filter-option" @click="poListStatusSort='Delivered'; showPoStatusSort=false" :class="{ 'option-active': poListStatusSort==='Delivered' }">Delivered</div>
                      <div class="filter-option" @click="poListStatusSort='Completed'; showPoStatusSort=false" :class="{ 'option-active': poListStatusSort==='Completed' }">Completed</div>
                      <div class="filter-option" @click="poListStatusSort='Cancelled'; showPoStatusSort=false" :class="{ 'option-active': poListStatusSort==='Cancelled' }">Cancelled</div>
                    </div>
                  </th>
                  <th>Actions</th>
                </tr></thead>
                <tbody>
                  <tr v-for="(po, index) in filteredPOs" :key="po.id" style="cursor:pointer" @click="viewPO(po, $event)">
                    <td>{{ index+1 }}</td>
                    <td>{{ po.source_of_fund }}</td>
                    <td>{{ po.work_description }}</td>
                    <td>{{ po.supplier }}</td>
                    <td>{{ po.po_no }}</td>
                    <td>{{ po.pr_no || '—' }}</td>
                    <td>{{ po.delivery_date_completed ? formatDate2(po.delivery_date_completed) : '—' }}</td>
                    <td><span :class="'po-status po-status-' + (po.status||'').toLowerCase().replace(' ','-')">{{ po.status || '—' }}</span></td>
                    <td class="actions-cell" @click.stop>
                      <button @click="editPO(po)" class="btn-warning-sm">Edit</button>
                      <button @click="confirmDeletePO(po.id)" class="btn-danger">Delete</button>
                    </td>
                  </tr>
                  <tr v-if="filteredPOs.length===0">
                    <td colspan="9" class="empty-row">No purchase orders found.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- PO DETAIL MODAL -->
            <div v-if="viewPOModal" class="modal-overlay">
             <div class="modal modal-animate po-detail-modal" ref="poDetailModal">
                <div class="modal-accent-bar"></div>
                <div class="po-detail-header">
                  <h3 class="modal-title">Purchase Order Details</h3>
                  <div class="po-meta-grid">
                    <div><span class="po-meta-label">Supplier:</span> <strong>{{ selectedPO.supplier }}</strong></div>
                    <div><span class="po-meta-label">P.R. No.:</span> <strong>{{ selectedPO.pr_no }}</strong></div>
                    <div><span class="po-meta-label">P.O. No.:</span> <strong>{{ selectedPO.po_no }}</strong></div>
                    <div><span class="po-meta-label">RIS No.:</span> <strong>{{ selectedPO.ris_no || '—' }}</strong></div>
                    <div><span class="po-meta-label">Source of Fund:</span> <strong>{{ selectedPO.source_of_fund }}</strong></div>
                    <div><span class="po-meta-label">Work Description:</span> <strong>{{ selectedPO.work_description }}</strong></div>
                    <div><span class="po-meta-label">Status:</span> <span :class="'po-status po-status-'+(selectedPO.status||'').toLowerCase().replace(' ','-')">{{ selectedPO.status || '—' }}</span></div>
                    <div><span class="po-meta-label">POW Status:</span> <span :class="'po-status po-pow-'+(selectedPO.pow_status||'').toLowerCase()">{{ selectedPO.pow_status || '—' }}</span></div>
                  </div>
                  <div class="po-info-dates">
                    <div class="po-info-date-group">
                      <div class="po-info-date-title">DELIVERY DATES</div>
                      <div class="po-info-date-row">
                        <div><span class="po-meta-label">Date Delivered:</span> <strong>{{ selectedPO.date_delivered ? formatDate2(selectedPO.date_delivered) : '—' }}</strong></div>
                        <div><span class="po-meta-label">Partial Delivery Date:</span> <strong>{{ selectedPO.delivery_date_started ? formatDate2(selectedPO.delivery_date_started) : '—' }}</strong></div>
                        <div><span class="po-meta-label">Delivery Date Completed:</span> <strong>{{ selectedPO.delivery_date_completed ? formatDate2(selectedPO.delivery_date_completed) : '—' }}</strong></div>
                      </div>
                    </div>
                    <div class="po-info-date-group">
                      <div class="po-info-date-title">WORK DATES</div>
                      <div class="po-info-date-row">
                        <div><span class="po-meta-label">Work Date Started:</span> <strong>{{ selectedPO.date_started ? formatDate2(selectedPO.date_started) : '—' }}</strong></div>
                        <div><span class="po-meta-label">Work Date Completed:</span> <strong>{{ selectedPO.date_completed ? formatDate2(selectedPO.date_completed) : '—' }}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="po-detail-table-wrapper">
                  <div style="margin-bottom:10px;">
                    <input v-model="poDetailSearch" placeholder="Search all PO items..." class="search-input" style="width:100%;max-width:400px;padding:6px 10px;font-size:13px;"/>
                  </div>
                  <table class="po-detail-table">
                    <thead><tr>
                      <th style="width:30px">#</th>
                      <th style="min-width:200px;position:relative">
                        Description
                        <button @click.stop="showDescFilterDropdown = !showDescFilterDropdown" class="column-filter-btn" :class="{ 'filter-active': poDetailDescFilter }">⚙</button>
                        <div v-if="showDescFilterDropdown" @click.stop class="column-filter-dropdown">
                          <div class="filter-option" @click="poDetailDescFilter = ''; showDescFilterDropdown = false" :class="{ 'option-active': !poDetailDescFilter }">No Filter</div>
                          <div class="filter-option" @click="poDetailDescFilter = 'alpha-asc'; showDescFilterDropdown = false" :class="{ 'option-active': poDetailDescFilter === 'alpha-asc' }">A-Z</div>
                          <div class="filter-option" @click="poDetailDescFilter = 'alpha-desc'; showDescFilterDropdown = false" :class="{ 'option-active': poDetailDescFilter === 'alpha-desc' }">Z-A</div>
                          <div style="border-top: 1px solid #e0e0e0; margin: 4px 0;"></div>
                          <div v-for="desc in uniquePODescriptions" :key="desc" class="filter-option" @click="poDetailDescFilter = 'desc:' + desc; showDescFilterDropdown = false" :class="{ 'option-active': poDetailDescFilter === 'desc:' + desc }" style="font-size: 12px; padding: 6px 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">{{ desc }}</div>
                        </div>
                      </th>
                      <th style="width:100px">Unit</th>
                      <th style="width:70px">Qty</th>
                      <th style="width:100px">Unit Cost</th>
                      <th style="width:110px">Amount</th>
                      <th style="width:130px">Partial Delivery (Qty)</th>
                      <th style="width:120px;position:relative">
                        Status
                        <button @click.stop="showStatusFilterDropdown = !showStatusFilterDropdown" class="column-filter-btn" :class="{ 'filter-active': poDetailStatusFilter }">⚙</button>
                        <div v-if="showStatusFilterDropdown" @click.stop class="column-filter-dropdown">
                          <div class="filter-option" @click="poDetailStatusFilter = ''; showStatusFilterDropdown = false" :class="{ 'option-active': !poDetailStatusFilter }">No Filter</div>
                          <div class="filter-option" @click="poDetailStatusFilter = 'alpha-asc'; showStatusFilterDropdown = false" :class="{ 'option-active': poDetailStatusFilter === 'alpha-asc' }">A-Z</div>
                          <div class="filter-option" @click="poDetailStatusFilter = 'alpha-desc'; showStatusFilterDropdown = false" :class="{ 'option-active': poDetailStatusFilter === 'alpha-desc' }">Z-A</div>
                          <div style="border-top: 1px solid #e0e0e0; margin: 4px 0;"></div>
                          <div v-for="status in uniquePOStatuses" :key="status" class="filter-option" @click="poDetailStatusFilter = 'status:' + status; showStatusFilterDropdown = false" :class="{ 'option-active': poDetailStatusFilter === 'status:' + status }">{{ status || '(Empty)' }}</div>
                        </div>
                      </th>
                      <th style="min-width:160px;position:relative">
                        Remarks
                        <button @click.stop="showRemarksFilterDropdown = !showRemarksFilterDropdown" class="column-filter-btn" :class="{ 'filter-active': poDetailRemarksFilter }">⚙</button>
                        <div v-if="showRemarksFilterDropdown" @click.stop class="column-filter-dropdown">
                          <div class="filter-option" @click="poDetailRemarksFilter = ''; showRemarksFilterDropdown = false" :class="{ 'option-active': !poDetailRemarksFilter }">No Filter</div>
                          <div class="filter-option" @click="poDetailRemarksFilter = 'alpha-asc'; showRemarksFilterDropdown = false" :class="{ 'option-active': poDetailRemarksFilter === 'alpha-asc' }">A-Z</div>
                          <div class="filter-option" @click="poDetailRemarksFilter = 'alpha-desc'; showRemarksFilterDropdown = false" :class="{ 'option-active': poDetailRemarksFilter === 'alpha-desc' }">Z-A</div>
                          <div style="border-top: 1px solid #e0e0e0; margin: 4px 0;"></div>
                          <div v-for="remark in uniquePORemarks" :key="remark" class="filter-option" @click="poDetailRemarksFilter = 'remark:' + remark; showRemarksFilterDropdown = false" :class="{ 'option-active': poDetailRemarksFilter === 'remark:' + remark }" style="font-size: 12px; padding: 6px 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">{{ remark || '(Empty)' }}</div>
                        </div>
                      </th>
                    </tr></thead>
                    <tbody>
                      <tr v-for="(item, i) in sortedSelectedPOItems" :key="i">
                        <td>{{ i+1 }}</td>
                        <td style="min-width:200px"><textarea v-model="item.description" class="detail-input detail-textarea" :title="item.description" rows="2"></textarea></td>
                        <td>
                          <select v-model="item.unit" class="detail-input">
                            <option value="">-- Unit --</option>
                            <option v-for="u in allUnitOptions" :key="u" :value="u">{{ u }}</option>
                          </select>
                        </td>
                        <td><input v-model.number="item.quantity" type="number" min="0" class="detail-input detail-num"/></td>
                        <td><input v-model.number="item.unit_cost" type="number" min="0" class="detail-input detail-num"/></td>
                        <td style="font-weight:700;color:#004d26;white-space:nowrap">&#x20B1;{{ ((item.quantity||0)*(item.unit_cost||0)).toLocaleString('en-PH',{minimumFractionDigits:2}) }}</td>
                        <td><input v-model.number="item.partial_delivery" type="number" min="0" class="detail-input detail-num"/></td>
                        <td>
                          <select v-model="item.item_status" class="detail-input">
                            <option value="">-- Status --</option>
                            <option value="Pending">Pending</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Partial">Partial</option>
                            <option value="Replaced">Replaced</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td style="min-width:160px"><textarea v-model="item.remarks" placeholder="Remarks" class="detail-input detail-textarea" rows="2"></textarea></td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="5" style="text-align:right;font-weight:700;padding:10px 11px;background:#f0faf4">TOTAL AMOUNT:</td>
                        <td style="font-weight:900;color:#004d26;font-size:15px;padding:10px 11px;background:#f0faf4">&#x20B1;{{ selectedPOTotal }}</td>
                        <td colspan="3" style="background:#f0faf4"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <div class="modal-actions">
                  <button @click="saveDetailEdits" class="btn-primary">Save Changes</button>
                  <button @click="sendPOToInventory(selectedPO)" class="btn-send-inv">📦 Send to Inventory</button>
                  <button @click="printSinglePO(selectedPO)" class="btn-print">Print</button>
                  <button @click="exportSinglePOExcel(selectedPO)" class="btn-excel">Export Excel</button>
                  <button @click="closePOModal" class="btn-gray">Close</button>
                </div>
              </div>
            </div>
          </div>

        </div><!-- end main-content -->
      </div><!-- end main-layout -->
    </div><!-- end container -->

    <!-- ARCHIVE MODAL -->
    <div v-if="showArchiveModal" class="modal-overlay" @click.self="showArchiveModal=false">
      <div class="modal modal-animate">
        <div class="modal-accent-bar"></div>
        <h3 class="modal-title">Archive Withdrawal Records</h3>
        <p class="modal-available" style="margin:8px 28px 4px;text-align:left;font-size:13px;color:#555">
          This will <strong>download</strong> all withdrawal records from the selected year as Excel, then <strong>delete</strong> them from Firebase.
        </p>
        <div class="modal-field" style="margin-top:12px">
          <label class="modal-label">Select Year to Archive</label>
          <select v-model.number="archiveYear" style="width:100%">
            <option v-for="y in archiveYearOptions" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
        <div style="margin:8px 28px;padding:10px;background:#fff3cd;border-radius:8px;font-size:12px;color:#856404">
          ⚠ Warning: Deleted records cannot be recovered from Firebase. Make sure to save the downloaded Excel file!
        </div>
        <div class="modal-actions" style="flex-direction:column;gap:8px">
          <div style="display:flex;gap:10px;justify-content:center;width:100%;flex-wrap:wrap;">
            <button @click="downloadOnlyWithdrawals" class="btn-primary" :disabled="archiving">Download CSV Only (Test)</button>
            <button @click="archiveWithdrawals" class="btn-danger" :disabled="archiving">{{ archiving ? 'Archiving...' : 'Download & Delete' }}</button>
          </div>
          <button @click="showArchiveModal=false" class="btn-gray" style="width:100%">Cancel</button>
        </div>
      </div>
    </div>

    <!-- WITHDRAW MODAL -->
    <div v-if="withdrawModal" class="modal-overlay">
      <div class="modal modal-animate">
        <div class="modal-accent-bar"></div>
        <h3 class="modal-title">Withdraw: {{ withdrawItem?.material }}</h3>
        <p class="modal-available">Available Stock: <strong>{{ withdrawItem?.remaining }}</strong></p>
        <div class="modal-field"><label class="modal-label">Control # (optional)</label><input v-model="withdrawControlNo" placeholder="e.g. RIS-101-26-03-001" ref="wField1" @keydown.enter.prevent="$refs.wField2.focus()"/></div>
        <div class="modal-field"><label class="modal-label">In-charge (optional)</label><input v-model="withdrawIncharge" placeholder="Person in-charge" ref="wField2" @keydown.enter.prevent="$refs.wField3.focus()"/></div>
        <div class="modal-field"><label class="modal-label">Project Location *</label><input v-model="withdrawProjectLocation" placeholder="Enter project location" ref="wField3" @keydown.enter.prevent="$refs.wField4.focus()"/></div>
        <div class="modal-field"><label class="modal-label">Quantity *</label><input v-model.number="withdrawAmount" type="number" min="1" :max="withdrawItem?.remaining" placeholder="Quantity to withdraw" ref="wField4" @keydown.enter.prevent="$refs.wField5.focus()"/></div>
        <div class="modal-field"><label class="modal-label">Date *</label><input v-model="withdrawDate" type="date" ref="wField5" @keydown.enter.prevent="$refs.wField6.focus()"/></div>
        <div class="modal-field"><label class="modal-label">Remarks (optional)</label><input v-model="withdrawRemarks" placeholder="Optional notes" ref="wField6" @keydown.enter.prevent="confirmWithdraw()"/></div>
        <div class="modal-actions">
          <button @click="confirmWithdraw" class="btn-primary">Confirm</button>
          <button @click="withdrawModal=false" class="btn-gray">Cancel</button>
        </div>
      </div>
    </div>

    <!-- EDIT WITHDRAWAL MODAL -->
    <div v-if="editWithdrawalModal" class="modal-overlay" @click.self="editWithdrawalModal=false">
      <div class="modal modal-animate">
        <div class="modal-accent-bar"></div>
        <h3 class="modal-title">Edit Withdrawal</h3>
        <div class="modal-field"><label class="modal-label">Control #</label><input v-model="editWithdrawalData.control_no" placeholder="e.g. RIS-101-26-03-001"/></div>
        <div class="modal-field"><label class="modal-label">In-charge</label><input v-model="editWithdrawalData.incharge" placeholder="Person in-charge"/></div>
        <div class="modal-field"><label class="modal-label">Project Location *</label><input v-model="editWithdrawalData.project_location" placeholder="Enter project location"/></div>
        <div class="modal-field"><label class="modal-label">Qty Used *</label><input v-model.number="editWithdrawalData.quantity_used" type="number" min="1"/></div>
        <div class="modal-field"><label class="modal-label">Date *</label><input v-model="editWithdrawalData.date_str" type="date"/></div>
        <div class="modal-field"><label class="modal-label">Remarks</label><input v-model="editWithdrawalData.remarks" placeholder="Optional notes"/></div>
        <div class="modal-actions">
          <button @click="saveEditWithdrawal" class="btn-primary">Save</button>
          <button @click="editWithdrawalModal=false" class="btn-gray">Cancel</button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════
         SEND TO INVENTORY MODAL
    ═══════════════════════════════════════ -->
    <div v-if="sendToInvModal" class="modal-overlay" @click.self="sendToInvModal=false">
      <div class="modal modal-animate send-inv-modal">
        <div class="modal-accent-bar" style="background:linear-gradient(90deg,#1565c0,#0d47a1,#1976d2)"></div>
        <div class="send-inv-header">
          <div class="send-inv-title">📦 Send PO Items to Inventory</div>
          <div class="send-inv-sub">
            PO: <strong>{{ sendToInvPO?.po_no || '—' }}</strong> &nbsp;|&nbsp; {{ sendToInvPO?.supplier || '' }}
          </div>
          <div class="send-inv-hint">
            ✏️ Edit any field below. Uncheck items you don't want to add. The <strong>Origin Project Location</strong> is required for each selected item.
          </div>
        </div>

        <!-- BATCH SET PROJECT LOCATION -->
        <div class="send-inv-batch">
          <span style="font-size:12px;font-weight:700;color:#004d26;white-space:nowrap">Set all Project Locations:</span>
          <input v-model="batchProject" placeholder="Type project location then click Apply..."
            class="bulk-input" style="flex:1;min-width:160px"/>
          <button @click="applyBatchProject" class="btn-add-row" style="white-space:nowrap">Apply to All</button>
        </div>

        <div class="send-inv-table-wrap">
          <table class="send-inv-table">
            <thead>
              <tr>
                <th style="width:36px;text-align:center">
                  <input type="checkbox" :checked="sendToInvItems.every(i=>i.selected)"
                    @change="e=>sendToInvItems.forEach(i=>i.selected=e.target.checked)"
                    style="width:15px;height:15px;cursor:pointer"/>
                </th>
                <th>Material / Description</th>
                <th>Origin Project Location *</th>
                <th style="width:80px">Unit</th>
                <th style="width:70px">Qty</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, i) in sendToInvItems" :key="i"
                :class="item.selected ? 'sinv-row-on' : 'sinv-row-off'">
                <td style="text-align:center;padding:6px 4px">
                  <input type="checkbox" v-model="item.selected"
                    style="width:15px;height:15px;cursor:pointer;border:none;box-shadow:none;padding:0;width:auto"/>
                </td>
                <td style="padding:5px 6px">
                  <input v-model="item.material" class="bulk-input" :disabled="!item.selected"
                    style="min-width:150px" placeholder="Material name"/>
                </td>
                <td style="padding:5px 6px">
                  <input v-model="item.project" class="bulk-input"
                    :class="item.selected && !item.project ? 'input-required' : ''"
                    :disabled="!item.selected"
                    placeholder="Enter project location *" style="min-width:150px;border-color:#0f9d58"/>
                </td>
                <td style="padding:5px 6px">
                  <select v-model="item.unit" class="bulk-input" :disabled="!item.selected">
                    <option value="">--</option>
                    <option v-for="u in allUnitOptions" :key="u" :value="u">{{ u }}</option>
                  </select>
                </td>
                <td style="padding:5px 6px">
                  <input v-model.number="item.quantity" type="number" min="0"
                    class="bulk-input bulk-num" :disabled="!item.selected"/>
                </td>
                <td style="padding:5px 6px">
                  <input v-model="item.remarks" class="bulk-input"
                    :disabled="!item.selected" placeholder="Optional"/>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="send-inv-footer">
          <div class="send-inv-count">
            <span class="sinv-badge">{{ sendToInvItems.filter(i=>i.selected).length }}</span>
            of {{ sendToInvItems.length }} items selected
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button @click="sendToInvItems.forEach(i=>i.selected=true)" class="btn-add-row" style="font-size:11px;padding:5px 10px">✅ All</button>
            <button @click="sendToInvItems.forEach(i=>i.selected=false)" class="btn-remove" style="font-size:11px;padding:5px 10px">❌ None</button>
          </div>
        </div>

        <div class="modal-actions" style="padding:0 16px 20px;gap:8px">
          <button @click="confirmSendToInventory" class="btn-send-inv" :disabled="sendToInvItems.filter(i=>i.selected).length===0">
            ✅ Add {{ sendToInvItems.filter(i=>i.selected).length }} Item(s) to Inventory
          </button>
          <button @click="sendToInvModal=false" class="btn-gray">Cancel</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { getAllItems, addItem, updateItem, deleteItem, withdrawItem as firebaseWithdraw, getAllWithdrawals, getAllPOs, addPO, updatePO, deletePO, getAllManualLogs, addManualLog, updateManualLog, deleteManualLog, db } from './firebase.js';
import { ref, update, remove } from 'firebase/database';

export default {
  data() {
    return {
      activeTab:'inventory', showHeader:false, loading:false, formMode:'single',
      items:[], withdrawals:[],
      search:'', dateFrom:'', dateTo:'', selectedMaterial:'', selectedPeriod:'', cardFilter:'all', projectLocationSearch:'', remarksSortOption:'', showRemarksDropdown:false,
      wDateFrom:'', wDateTo:'', wSelectedMaterial:'', wSelectedPeriod:'', wSearch:'', wProjectSearch:'', wInnerTab:'inventory',
      manualLogs:[], manualSearch:'', manualDateFrom:'', manualDateTo:'',
      manualForm:{ log_date:'', control_no:'', material:'', unit:'', incharge:'', origin_project:'', qty:0, project_location:'', remarks:'' },
      manualSaving:false, manualEditMode:false, manualEditId:null,
      showManualMaterialSug:false, showManualInchargeSug:false, showManualOriginSug:false, showManualLocationSug:false,
      manualDateSort:'', showManualDateSort:false,
      manualControlSort:'', showManualControlSort:false,
      manualMaterialSort:'', showManualMaterialSort:false,
      manualUnitSort:'', showManualUnitSort:false,
      manualInchargeSort:'', showManualInchargeSort:false,
      manualOriginSort:'', showManualOriginSort:false,
      manualQtySort:'', showManualQtySort:false,
      manualLocationSort:'', showManualLocationSort:false,
      manualRemarksSort:'', showManualRemarksSort:false,
      form:{ project:'', material:'', unit:'', quantity:0, withdraw_qty:0, remarks:'' },
      editMode:false, editId:null,
      showProjectSug:false, showMaterialSug:false,
      showBulkProjectSug:false, showBulkMaterialSug:false, activeBulkRow:null,
      unitOptions:['PCS','BAG','BOX','GAL','LTR','KG','ROLL','SET','SHEET','MTR','PAIR','CAN','BOTTLE','DRUM','BUNDLE'],
      bulkRows:[{ project:'', material:'', unit:'', quantity:0, withdraw_qty:0, remarks:'' }], bulkSaving:false,
      withdrawModal:false, withdrawItem:null, withdrawAmount:0,
      withdrawControlNo:'', withdrawIncharge:'',
      withdrawProjectLocation:'', withdrawDate:'', withdrawRemarks:'',
      editWithdrawalModal:false, editWithdrawalData:{},
      showArchiveModal:false, archiveYear: new Date().getFullYear()-1, archiving:false,
      today: new Date().toLocaleDateString('en-US',{ year:'numeric', month:'long', day:'numeric' }),
      // PO
      pos:[], poSearch:'',
      showPOForm:false, poEditMode:false, poEditId:null,
      viewPOModal:false, selectedPO:{},
      poListSourceSort:'', showPoSourceSort:false,
      poListWorkDescSort:'', showPoWorkDescSort:false,
      poListSupplierSort:'', showPoSupplierSort:false,
      poListPONoSort:'', showPoPoNoSort:false,
      poListPRNoSort:'', showPoPRNoSort:false,
      poListDeliverySort:'', showPoDeliverySort:false,
      poListStatusSort:'', showPoStatusSort:false,
      wDateSort:'', showWDateSort:false,
      wControlNoSort:'', showWControlSort:false,
      wMaterialSort:'', showWMaterialSort:false,
      wInchargeSort:'', showWInchargeSort:false,
      wOriginSort:'', showWOriginSort:false,
      wQtySort:'', showWQtySort:false,
      wLocationSort:'', showWLocationSort:false,
      wRemarksSort:'', showWRemarksSort:false,
      poForm:{
        source_of_fund:'', work_description:'', supplier:'',
        pr_no:'', po_no:'', ris_no:'', date_delivered:'',
        delivery_date_started:'', delivery_date_completed:'',
        date_started:'', date_completed:'', status:'', pow_status:'',
        items:[{ description:'', unit:'', quantity:0, unit_cost:0, partial_delivery:0, item_status:'', remarks:'' }]
      },
      // PO Autocomplete
      poSuggestField: '',
      // PO Detail Sort — CHANGE 1: new sort state
      poDetailSortCol: '',
      poDetailSortDir: 1,
      poDetailSearch: '',
      showPoDescriptionSort: false,
      showPoStatusSort: false,
      showPoRemarksSort: false,
      // PO Detail Filter Dropdowns
      poDetailDescFilter: '',
      poDetailStatusFilter: '',
      poDetailRemarksFilter: '',
      showDescFilterDropdown: false,
      showStatusFilterDropdown: false,
      showRemarksFilterDropdown: false,
      // Send to Inventory
      sendToInvModal: false,
      sendToInvItems: [],
      sendToInvPO: null,
      batchProject: '',
    };
  },
  computed: {
    filteredItems() {
      let r = this.items;
      if (this.cardFilter==='instock') r=r.filter(i=>i.remaining>0);
      else if (this.cardFilter==='outofstock') r=r.filter(i=>i.remaining<=0);
      else if (this.cardFilter==='withdrawn') r=r.filter(i=>(i.withdraw_qty||0)>0);
      const s=this.search.toLowerCase();
      if (s) r=r.filter(i=>(i.project||'').toLowerCase().includes(s)||(i.material||'').toLowerCase().includes(s));
      if (this.projectLocationSearch){const ps=this.projectLocationSearch.toLowerCase();r=r.filter(i=>(i.project||'').toLowerCase().includes(ps));}
      if (this.selectedMaterial) r=r.filter(i=>i.material===this.selectedMaterial);
      if (this.remarksSortOption) {
        if (this.remarksSortOption === 'alpha-asc') {
          r = [...r].sort((a,b)=> (a.remarks||'').localeCompare(b.remarks||''));
        } else if (this.remarksSortOption === 'alpha-desc') {
          r = [...r].sort((a,b)=> (b.remarks||'').localeCompare(a.remarks||''));
        } else if (this.remarksSortOption.startsWith('sort:')) {
          const sortRemark = this.remarksSortOption.slice(5).toLowerCase();
          r = [...r].sort((a,b)=>{
            const aHas = (a.remarks||'').toLowerCase().includes(sortRemark);
            const bHas = (b.remarks||'').toLowerCase().includes(sortRemark);
            if (aHas && !bHas) return -1;
            if (!aHas && bHas) return 1;
            return 0;
          });
        }
      }
      if (this.dateFrom) r=r.filter(i=>{if(!i.created_at)return true;return this.toLocalDate(i.created_at)>=this.dateFrom;});
      if (this.dateTo) r=r.filter(i=>{if(!i.created_at)return true;return this.toLocalDate(i.created_at)<=this.dateTo;});
      return r;
    },
    filteredWithdrawals() {
      let r=this.withdrawals;
      if (this.wSearch){const s=this.wSearch.toLowerCase();r=r.filter(w=>(w.project_location||'').toLowerCase().includes(s)||(w.item_project||'').toLowerCase().includes(s)||(w.material||'').toLowerCase().includes(s)||(w.control_no||'').toLowerCase().includes(s)||(w.incharge||'').toLowerCase().includes(s));}
      if (this.wProjectSearch){const s=this.wProjectSearch.toLowerCase();r=r.filter(w=>(w.project_location||'').toLowerCase().includes(s));}
      if (this.wSelectedMaterial) r=r.filter(w=>w.material===this.wSelectedMaterial);
      if (this.wDateFrom) r=r.filter(w=>{if(!w.withdraw_date)return true;return this.toLocalDate(w.withdraw_date)>=this.wDateFrom;});
      if (this.wDateTo) r=r.filter(w=>{if(!w.withdraw_date)return true;return this.toLocalDate(w.withdraw_date)<=this.wDateTo;});
      const applySort = (arr, sort, field, sortType='alpha') => {
        if (!sort) return arr;
        if (sortType === 'date') {
          if (sort === 'date-asc') return [...arr].sort((a,b) => new Date(a[field]||0) - new Date(b[field]||0));
          if (sort === 'date-desc') return [...arr].sort((a,b) => new Date(b[field]||0) - new Date(a[field]||0));
        } else if (sortType === 'num') {
          if (sort === 'num-asc') return [...arr].sort((a,b) => (a[field]||0) - (b[field]||0));
          if (sort === 'num-desc') return [...arr].sort((a,b) => (b[field]||0) - (a[field]||0));
        } else {
          if (sort === 'alpha-asc') return [...arr].sort((a,b) => (a[field]||'').localeCompare(b[field]||''));
          if (sort === 'alpha-desc') return [...arr].sort((a,b) => (b[field]||'').localeCompare(a[field]||''));
        }
        return arr;
      };
      r = applySort(r, this.wDateSort, 'withdraw_date', 'date');
      r = applySort(r, this.wControlNoSort, 'control_no');
      r = applySort(r, this.wMaterialSort, 'material');
      r = applySort(r, this.wInchargeSort, 'incharge');
      r = applySort(r, this.wOriginSort, 'item_project');
      r = applySort(r, this.wQtySort, 'quantity_used', 'num');
      r = applySort(r, this.wLocationSort, 'project_location');
      r = applySort(r, this.wRemarksSort, 'remarks');
      return r;
    },
    filteredManualLogs() {
      let r = this.manualLogs;
      if(this.manualSearch){ const s=this.manualSearch.toLowerCase(); r=r.filter(l=>(l.material||'').toLowerCase().includes(s)||(l.origin_project||'').toLowerCase().includes(s)||(l.project_location||'').toLowerCase().includes(s)||(l.incharge||'').toLowerCase().includes(s)||(l.control_no||'').toLowerCase().includes(s)); }
      if(this.manualDateFrom) r=r.filter(l=>l.log_date>=this.manualDateFrom);
      if(this.manualDateTo) r=r.filter(l=>l.log_date<=this.manualDateTo);
      const applySort = (arr, sort, field, sortType='alpha') => {
        if (!sort) return arr;
        if (sortType === 'date') {
          if (sort === 'date-asc') return [...arr].sort((a,b) => new Date(a[field]||0) - new Date(b[field]||0));
          if (sort === 'date-desc') return [...arr].sort((a,b) => new Date(b[field]||0) - new Date(a[field]||0));
        } else if (sortType === 'num') {
          if (sort === 'num-asc') return [...arr].sort((a,b) => (a[field]||0) - (b[field]||0));
          if (sort === 'num-desc') return [...arr].sort((a,b) => (b[field]||0) - (a[field]||0));
        } else {
          if (sort === 'alpha-asc') return [...arr].sort((a,b) => (a[field]||'').localeCompare(b[field]||''));
          if (sort === 'alpha-desc') return [...arr].sort((a,b) => (b[field]||'').localeCompare(a[field]||''));
        }
        return arr;
      };
      r = applySort(r, this.manualDateSort, 'log_date', 'date');
      r = applySort(r, this.manualControlSort, 'control_no');
      r = applySort(r, this.manualMaterialSort, 'material');
      r = applySort(r, this.manualUnitSort, 'unit');
      r = applySort(r, this.manualInchargeSort, 'incharge');
      r = applySort(r, this.manualOriginSort, 'origin_project');
      r = applySort(r, this.manualQtySort, 'qty', 'num');
      r = applySort(r, this.manualLocationSort, 'project_location');
      r = applySort(r, this.manualRemarksSort, 'remarks');
      return r;
    },
    filteredPOs() {
      let r = this.pos;
      if (this.poSearch) {
        const s = this.poSearch.toLowerCase();
        r = r.filter(p => {
          const matchesItem = (p.items||[]).some(item =>
            (item.description||'').toLowerCase().includes(s) ||
            (item.unit||'').toLowerCase().includes(s) ||
            (item.item_status||'').toLowerCase().includes(s) ||
            (item.remarks||'').toLowerCase().includes(s)
          );
          return (
            (p.source_of_fund||'').toLowerCase().includes(s) ||
            (p.work_description||'').toLowerCase().includes(s) ||
            (p.supplier||'').toLowerCase().includes(s) ||
            (p.po_no||'').toLowerCase().includes(s) ||
            (p.pr_no||'').toLowerCase().includes(s) ||
            (p.ris_no||'').toLowerCase().includes(s) ||
            (p.status||'').toLowerCase().includes(s) ||
            (p.pow_status||'').toLowerCase().includes(s) ||
            (p.date_delivered||'').toLowerCase().includes(s) ||
            (p.delivery_date_started||'').toLowerCase().includes(s) ||
            (p.delivery_date_completed||'').toLowerCase().includes(s) ||
            (p.date_started||'').toLowerCase().includes(s) ||
            (p.date_completed||'').toLowerCase().includes(s) ||
            matchesItem
          );
        });
      }
      const applySort = (arr, sort, field) => {
        if (!sort) return arr;
        if (sort === 'alpha-asc') return [...arr].sort((a,b) => (a[field]||'').localeCompare(b[field]||''));
        if (sort === 'alpha-desc') return [...arr].sort((a,b) => (b[field]||'').localeCompare(a[field]||''));
        return arr;
      };
      r = applySort(r, this.poListSourceSort, 'source_of_fund');
      r = applySort(r, this.poListWorkDescSort, 'work_description');
      r = applySort(r, this.poListSupplierSort, 'supplier');
      r = applySort(r, this.poListPONoSort, 'po_no');
      r = applySort(r, this.poListPRNoSort, 'pr_no');
      r = applySort(r, this.poListDeliverySort, 'delivery_date_completed');
      r = applySort(r, this.poListStatusSort, 'status');
      return r;
    },
    poFormTotal() { return (this.poForm.items||[]).reduce((s,r)=>s+((r.quantity||0)*(r.unit_cost||0)),0); },
    selectedPOTotal() {
      const t=(this.selectedPO.items||[]).reduce((s,r)=>s+((r.quantity||0)*(r.unit_cost||0)),0);
      return t.toLocaleString('en-PH',{minimumFractionDigits:2});
    },
    // CHANGE 2: sortedSelectedPOItems computed property
    sortedSelectedPOItems() {
      let items = [...(this.selectedPO.items || [])];
      
      // Apply search filter
      if (this.poDetailSearch) {
        const s = this.poDetailSearch.toLowerCase();
        items = items.filter(item =>
          (item.description||'').toLowerCase().includes(s) ||
          (item.unit||'').toLowerCase().includes(s) ||
          (item.quantity||'').toString().includes(s) ||
          (item.unit_cost||'').toString().includes(s) ||
          (item.partial_delivery||'').toString().includes(s) ||
          (item.item_status||'').toLowerCase().includes(s) ||
          (item.remarks||'').toLowerCase().includes(s)
        );
      }
      
      // Apply description filter
      if (this.poDetailDescFilter === 'alpha-asc') {
        items.sort((a, b) => (a.description || '').localeCompare(b.description || ''));
      } else if (this.poDetailDescFilter === 'alpha-desc') {
        items.sort((a, b) => (b.description || '').localeCompare(a.description || ''));
      } else if (this.poDetailDescFilter.startsWith('desc:')) {
        const filterVal = this.poDetailDescFilter.slice(5);
        items = items.filter(item => (item.description || '').toLowerCase() === filterVal.toLowerCase());
      }
      
      // Apply status filter
      if (this.poDetailStatusFilter === 'alpha-asc') {
        items.sort((a, b) => (a.item_status || '').localeCompare(b.item_status || ''));
      } else if (this.poDetailStatusFilter === 'alpha-desc') {
        items.sort((a, b) => (b.item_status || '').localeCompare(a.item_status || ''));
      } else if (this.poDetailStatusFilter.startsWith('status:')) {
        const filterVal = this.poDetailStatusFilter.slice(7);
        items = items.filter(item => (item.item_status || '') === filterVal);
      }
      
      // Apply remarks filter
      if (this.poDetailRemarksFilter === 'alpha-asc') {
        items.sort((a, b) => (a.remarks || '').localeCompare(b.remarks || ''));
      } else if (this.poDetailRemarksFilter === 'alpha-desc') {
        items.sort((a, b) => (b.remarks || '').localeCompare(a.remarks || ''));
      } else if (this.poDetailRemarksFilter.startsWith('remark:')) {
        const filterVal = this.poDetailRemarksFilter.slice(7);
        items = items.filter(item => (item.remarks || '').toLowerCase() === filterVal.toLowerCase());
      }
      
      return items;
    },
    uniqueMaterials(){ return [...new Set(this.items.map(i=>i.material).filter(Boolean))].sort(); },
    uniqueProjects(){ return [...new Set(this.items.map(i=>i.project).filter(Boolean))].sort(); },
    uniqueRemarks(){ return [...new Set(this.items.map(i=> (i.remarks||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b)); },
    remarksSortOptions(){
      const mapped = this.uniqueRemarks.map(r=>({ value:`sort:${r}`, label:r }));
      return [
        { value:'', label:'No sorting' },
        { value:'alpha-asc', label:'A-Z' },
        { value:'alpha-desc', label:'Z-A' },
        ...mapped
      ];
    },
    materialSuggestions(){ if(!this.form.material)return this.uniqueMaterials; return this.uniqueMaterials.filter(m=>m.toLowerCase().includes(this.form.material.toLowerCase())); },
    projectSuggestions(){ if(!this.form.project)return this.uniqueProjects; return this.uniqueProjects.filter(p=>p.toLowerCase().includes(this.form.project.toLowerCase())); },
    allUnitOptions(){ return['PCS','BAG','BOX','GAL','LTR','KG','ROLL','SET','SHEET','MTR','PAIR','CAN','BOTTLE','DRUM','BUNDLE','LENGTH','CU.M','METER','KILO','PIECE','GALLON']; },
    uniqueManualMaterials(){ return [...new Set(this.manualLogs.map(l=>l.material).filter(Boolean))].sort(); },
    uniqueManualIncharge(){ return [...new Set(this.manualLogs.map(l=>l.incharge).filter(Boolean))].sort(); },
    uniqueManualOrigin(){ return [...new Set(this.manualLogs.map(l=>l.origin_project).filter(Boolean))].sort(); },
    uniqueManualLocations(){ return [...new Set(this.manualLogs.map(l=>l.project_location).filter(Boolean))].sort(); },
    manualMaterialSuggestions(){ if(!this.manualForm.material)return this.uniqueManualMaterials; return this.uniqueManualMaterials.filter(m=>m.toLowerCase().includes(this.manualForm.material.toLowerCase())); },
    manualInchargeSuggestions(){ if(!this.manualForm.incharge)return this.uniqueManualIncharge; return this.uniqueManualIncharge.filter(i=>i.toLowerCase().includes(this.manualForm.incharge.toLowerCase())); },
    manualOriginSuggestions(){ if(!this.manualForm.origin_project)return this.uniqueManualOrigin; return this.uniqueManualOrigin.filter(o=>o.toLowerCase().includes(this.manualForm.origin_project.toLowerCase())); },
    manualLocationSuggestions(){ if(!this.manualForm.project_location)return this.uniqueManualLocations; return this.uniqueManualLocations.filter(l=>l.toLowerCase().includes(this.manualForm.project_location.toLowerCase())); },
    uniquePODescriptions() {
      const descs = new Set((this.selectedPO.items || []).map(item => (item.description || '').trim()).filter(Boolean));
      return Array.from(descs).sort((a, b) => a.localeCompare(b));
    },
    uniquePOStatuses() {
      const statuses = new Set((this.selectedPO.items || []).map(item => (item.item_status || '').trim()));
      return Array.from(statuses).filter(s => s !== '').sort();
    },
    uniquePORemarks() {
      const remarks = new Set((this.selectedPO.items || []).map(item => (item.remarks || '').trim()));
      return Array.from(remarks).filter(r => r !== '').sort((a, b) => a.localeCompare(b));
    },
    printDateLabel(){
      let l=this.today;
      if(this.dateFrom&&this.dateTo)l=`${this.formatDate(this.dateFrom)} to ${this.formatDate(this.dateTo)}`;
      else if(this.dateFrom)l=`From ${this.formatDate(this.dateFrom)}`;
      else if(this.dateTo)l=`As of ${this.formatDate(this.dateTo)}`;
      if(this.selectedMaterial)l+=` | Material: ${this.selectedMaterial}`;
      return l;
    },
    archiveYearOptions(){
      const currentYear = new Date().getFullYear();
      const years = [];
      for(let y = currentYear; y >= 2020; y--) years.push(y);
      return years;
    },
    withdrawalDateLabel(){
      let l=this.today;
      if(this.wDateFrom&&this.wDateTo)l=`${this.formatDate(this.wDateFrom)} to ${this.formatDate(this.wDateTo)}`;
      else if(this.wDateFrom)l=`From ${this.formatDate(this.wDateFrom)}`;
      else if(this.wDateTo)l=`As of ${this.formatDate(this.wDateTo)}`;
      if(this.wSelectedMaterial)l+=` | Material: ${this.wSelectedMaterial}`;
      return l;
    },
    // PO field suggestions — collects all unique values from existing POs
    poFieldSuggestionsMap() {
      const fields = ['source_of_fund','work_description','supplier','pr_no','po_no','ris_no'];
      const map = {};
      fields.forEach(f => {
        map[f] = [...new Set(this.pos.map(p => p[f]).filter(Boolean))].sort();
      });
      map['description'] = [...new Set(
        this.pos.flatMap(p => (p.items||[]).map(i => i.description).filter(Boolean))
      )].sort();
      return map;
    },
  },
  methods: {
    toLocalDate(v){ if(!v)return''; const d=new Date(typeof v==='number'?v:Number(v)); if(isNaN(d.getTime()))return''; return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; },
    getTodayStr(){ const n=new Date(); return`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; },
    formatDate(d){ if(!d)return''; const dt=new Date(typeof d==='number'?d:Number(d)); if(isNaN(dt.getTime()))return''; return dt.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}); },
    formatDate2(d){ if(!d)return'—'; const dt=new Date(d); if(isNaN(dt.getTime()))return'—'; return dt.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}); },
    pickMaterial(m){this.form.material=m;this.showMaterialSug=false;},
    hideMaterialSug(){setTimeout(()=>{this.showMaterialSug=false;},150);},
    pickProject(p){this.form.project=p;this.showProjectSug=false;},
    hideProjectSug(){setTimeout(()=>{this.showProjectSug=false;},150);},
    hideBulkProjectSug(){setTimeout(()=>{this.showBulkProjectSug=false;},150);},
    hideBulkMaterialSug(){setTimeout(()=>{this.showBulkMaterialSug=false;},150);},
    bulkMaterialSuggestions(v){ if(!v)return this.uniqueMaterials; return this.uniqueMaterials.filter(m=>m.toLowerCase().includes(v.toLowerCase())); },
    bulkProjectSuggestions(v){ if(!v)return this.uniqueProjects; return this.uniqueProjects.filter(p=>p.toLowerCase().includes(v.toLowerCase())); },
    // Manual Log Autocomplete
    pickManualMaterial(m){ this.manualForm.material=m; this.showManualMaterialSug=false; },
    hideManualMaterialSug(){ setTimeout(()=>{ this.showManualMaterialSug=false; },150); },
    pickManualIncharge(i){ this.manualForm.incharge=i; this.showManualInchargeSug=false; },
    hideManualInchargeSug(){ setTimeout(()=>{ this.showManualInchargeSug=false; },150); },
    pickManualOrigin(o){ this.manualForm.origin_project=o; this.showManualOriginSug=false; },
    hideManualOriginSug(){ setTimeout(()=>{ this.showManualOriginSug=false; },150); },
    pickManualLocation(l){ this.manualForm.project_location=l; this.showManualLocationSug=false; },
    hideManualLocationSug(){ setTimeout(()=>{ this.showManualLocationSug=false; },150); },
    // PO Autocomplete
    poSuggest(field, value) {
      const list = this.poFieldSuggestionsMap[field] || [];
      if (!value) return list.slice(0, 8);
      return list.filter(v => v.toLowerCase().includes(value.toLowerCase())).slice(0, 8);
    },
    hidePOSug() { setTimeout(() => { this.poSuggestField = ''; }, 180); },
    // CHANGE 3: sortPODetail method
    sortPODetail(col) {
      if (this.poDetailSortCol === col) {
        this.poDetailSortDir *= -1;
      } else {
        this.poDetailSortCol = col;
        this.poDetailSortDir = 1;
      }
    },
    addRow(){ this.bulkRows.push({project:'',material:'',unit:'',quantity:0,withdraw_qty:0,remarks:''}); },
    addRowWithSameMaterial(){ const l=this.bulkRows[this.bulkRows.length-1]; this.bulkRows.push({project:'',material:l.material||'',unit:l.unit||'',quantity:0,withdraw_qty:0,remarks:''}); },
    copyRow(i){ const r={...this.bulkRows[i]}; this.bulkRows.splice(i+1,0,r); },
    removeRow(i){ if(this.bulkRows.length>1)this.bulkRows.splice(i,1); },
    clearBulkRows(){ if(confirm('Clear all rows?'))this.bulkRows=[{project:'',material:'',unit:'',quantity:0,withdraw_qty:0,remarks:''}]; },
    async saveBulkItems(){
      const inv=this.bulkRows.filter(r=>!r.project||!r.material);
      if(inv.length>0)return alert(`${inv.length} row(s) missing Project Location or Material!`);
      if(!confirm(`Save ${this.bulkRows.length} items?`))return;
      this.bulkSaving=true;
      try{
        await Promise.all(this.bulkRows.map(r=>addItem({project:r.project,material:r.material,unit:r.unit||'',quantity:r.quantity||0,withdraw_qty:r.withdraw_qty||0,remarks:r.remarks||''})));
        alert(`${this.bulkRows.length} items saved!`);
        this.bulkRows=[{project:'',material:'',unit:'',quantity:0,withdraw_qty:0,remarks:''}];
        await this.fetchItems();
      }catch(e){alert('Failed to save.');}finally{this.bulkSaving=false;}
    },
    async fetchItems(){
      this.loading=true;
      try{ const d=await getAllItems(); this.items=d.map(i=>({...i,withdraw_qty:i.withdraw_qty||0,remaining:(i.quantity||0)-(i.withdraw_qty||0)})); }
      catch(e){alert('Could not load items.');}finally{this.loading=false;}
    },
    async fetchWithdrawals(){ try{this.withdrawals=await getAllWithdrawals();}catch(e){console.error(e);} },
    async fetchPOs(){ try{this.pos=await getAllPOs();}catch(e){console.error(e);} },
    async saveItem(){
      if(!this.form.material||!this.form.project)return alert('Project Location and Material required!');
      if(this.form.quantity<0)return alert('Quantity cannot be negative!');
      if((this.form.withdraw_qty||0)>this.form.quantity)return alert('Withdraw Qty cannot exceed Quantity!');
      try{
        if(this.editMode){await updateItem(this.editId,{project:this.form.project,material:this.form.material,unit:this.form.unit,quantity:this.form.quantity,withdraw_qty:this.form.withdraw_qty||0,remarks:this.form.remarks});}
        else{await addItem({project:this.form.project,material:this.form.material,unit:this.form.unit,quantity:this.form.quantity,withdraw_qty:this.form.withdraw_qty||0,remarks:this.form.remarks});}
        this.resetForm();await this.fetchItems();
      }catch(e){alert('Failed to save item.');}
    },
    editItem(item){ this.formMode='single'; this.form={project:item.project,material:item.material,unit:item.unit,quantity:item.quantity,withdraw_qty:item.withdraw_qty||0,remarks:item.remarks||''}; this.editId=item.id;this.editMode=true; window.scrollTo({top:0,behavior:'smooth'}); },
    cancelEdit(){ this.resetForm(); },
    async confirmDelete(id){ if(!confirm('Delete this item?'))return; try{await deleteItem(id);await this.fetchItems();await this.fetchWithdrawals();}catch(e){alert('Failed to delete.');} },
    startWithdraw(item){
      if(item.remaining<=0)return alert('Out of stock!');
      this.withdrawItem=item; this.withdrawAmount=0; this.withdrawControlNo=''; this.withdrawIncharge='';
      this.withdrawProjectLocation=''; this.withdrawRemarks=''; this.withdrawDate=this.getTodayStr(); this.withdrawModal=true;
    },
    async confirmWithdraw(){
      if(!this.withdrawProjectLocation)return alert('Project Location required!');
      if(!this.withdrawAmount||this.withdrawAmount<=0)return alert('Enter a valid quantity!');
      if(this.withdrawAmount>this.withdrawItem.remaining)return alert('Not enough stock!');
      if(!this.withdrawDate)return alert('Date is required!');
      try{
        await firebaseWithdraw(this.withdrawItem.id,{amount:this.withdrawAmount,control_no:this.withdrawControlNo||'',incharge:this.withdrawIncharge||'',project_location:this.withdrawProjectLocation,remarks:this.withdrawRemarks,withdraw_date:new Date(this.withdrawDate).getTime()});
        this.withdrawModal=false; await this.fetchItems(); await this.fetchWithdrawals();
      }catch(e){alert('Withdrawal failed.');}
    },
    editWithdrawal(w){
      this.editWithdrawalData={id:w.id,control_no:w.control_no||'',incharge:w.incharge||'',project_location:w.project_location,quantity_used:w.quantity_used,remarks:w.remarks||'',date_str:this.toLocalDate(w.withdraw_date)};
      this.editWithdrawalModal=true;
    },
    async saveEditWithdrawal(){
      if(!this.editWithdrawalData.project_location)return alert('Project Location required!');
      if(!this.editWithdrawalData.quantity_used||this.editWithdrawalData.quantity_used<=0)return alert('Enter a valid quantity!');
      if(!this.editWithdrawalData.date_str)return alert('Date is required!');
      try{
        await update(ref(db,`withdrawals/${this.editWithdrawalData.id}`),{control_no:this.editWithdrawalData.control_no||'',incharge:this.editWithdrawalData.incharge||'',project_location:this.editWithdrawalData.project_location,quantity_used:Number(this.editWithdrawalData.quantity_used),remarks:this.editWithdrawalData.remarks||'',withdraw_date:new Date(this.editWithdrawalData.date_str).getTime()});
        this.editWithdrawalModal=false; await this.fetchWithdrawals();
      }catch(e){alert('Failed to update.');}
    },
    async deleteWithdrawal(w){ if(!confirm(`Delete withdrawal for "${w.material}"?`))return; try{await remove(ref(db,`withdrawals/${w.id}`));await this.fetchWithdrawals();}catch(e){alert('Failed to delete.');} },
    resetForm(){ this.form={project:'',material:'',unit:'',quantity:0,withdraw_qty:0,remarks:''}; this.editMode=false;this.editId=null;this.search='';this.selectedMaterial='';this.selectedPeriod='';this.dateFrom='';this.dateTo='';this.cardFilter='all'; },
    setCardFilter(f){ this.cardFilter=this.cardFilter===f?'all':f; },
    rowClass(item){ if(item.remaining<=0)return'row-empty'; if(item.remaining<=5)return'row-low-stock'; return'row-has-stock'; },
    clearDates(){ this.dateFrom='';this.dateTo='';this.selectedPeriod='';this.selectedMaterial='';this.cardFilter='all'; },
    clearWithdrawalDates(){ this.wDateFrom='';this.wDateTo='';this.wSelectedPeriod='';this.wSelectedMaterial='';this.wSearch='';this.wProjectSearch=''; },
    applyWithdrawalPeriod(){
      const now=new Date();const today=this.getTodayStr();
      if(this.wSelectedPeriod==='today'){this.wDateFrom=today;this.wDateTo=today;}
      else if(this.wSelectedPeriod==='week'){const f=new Date(now);f.setDate(now.getDate()-now.getDay());this.wDateFrom=this.toLocalDate(f);this.wDateTo=today;}
      else if(this.wSelectedPeriod==='lastweek'){const f=new Date(now);f.setDate(now.getDate()-now.getDay()-7);const l=new Date(f);l.setDate(f.getDate()+6);this.wDateFrom=this.toLocalDate(f);this.wDateTo=this.toLocalDate(l);}
      else if(this.wSelectedPeriod==='month'){this.wDateFrom=this.toLocalDate(new Date(now.getFullYear(),now.getMonth(),1));this.wDateTo=today;}
      else if(this.wSelectedPeriod==='lastmonth'){const f=new Date(now.getFullYear(),now.getMonth()-1,1);const l=new Date(now.getFullYear(),now.getMonth(),0);this.wDateFrom=this.toLocalDate(f);this.wDateTo=this.toLocalDate(l);}
      else if(this.wSelectedPeriod==='last3months'){const f=new Date(now.getFullYear(),now.getMonth()-3,1);this.wDateFrom=this.toLocalDate(f);this.wDateTo=today;}
      else{this.clearWithdrawalDates();}
    },
    // PO Methods
    resetPOForm(){
      this.poForm={ source_of_fund:'', work_description:'', supplier:'', pr_no:'', po_no:'', ris_no:'',
        date_delivered:'', delivery_date_started:'', delivery_date_completed:'',
        date_started:'', date_completed:'', status:'', pow_status:'',
        items:[{ description:'', unit:'', quantity:0, unit_cost:0, partial_delivery:0, item_status:'', remarks:'' }] };
      this.poEditId=null;
    },
    addPOItem(){ this.poForm.items.push({ description:'', unit:'', quantity:0, unit_cost:0, partial_delivery:0, item_status:'', remarks:'' }); },
    removePOItem(i){ if(this.poForm.items.length>1)this.poForm.items.splice(i,1); },
    cancelPOForm(){ this.showPOForm=false; this.resetPOForm(); },
    async savePO(){
      if(!this.poForm.source_of_fund)return alert('Source of Fund is required!');
      if(!this.poForm.work_description)return alert('Work Description is required!');
      try{
        const data={...this.poForm};
        if(this.poEditMode){ await updatePO(this.poEditId,data); }
        else{ await addPO(data); }
        this.showPOForm=false; this.resetPOForm(); await this.fetchPOs();
      }catch(e){ alert('Failed to save PO.'); }
    },
    editPO(po){
      this.poForm={...po, items: po.items ? [...po.items] : [{ description:'', unit:'', quantity:0, unit_cost:0, partial_delivery:0, item_status:'', remarks:'' }]};
      this.poEditId=po.id; this.poEditMode=true; this.showPOForm=true;
    },
    async confirmDeletePO(id){ if(!confirm('Delete this Purchase Order?'))return; try{ await deletePO(id); await this.fetchPOs(); }catch(e){ alert('Failed to delete.'); } },
    viewPO(po, event) {
  this.selectedPO = { ...po, items: po.items ? po.items.map(i => ({...i})) : [] };
  this.poDetailSortCol = '';
  this.poDetailSortDir = 1;
  this.poDetailDescFilter = '';
  this.poDetailStatusFilter = '';
  this.poDetailRemarksFilter = '';
  this.showDescFilterDropdown = false;
  this.showStatusFilterDropdown = false;
  this.showRemarksFilterDropdown = false;
  this.poDetailSearch = '';
  this.viewPOModal = true;

  // Lock body scroll so fixed overlay covers viewport correctly
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.top = `-${window.scrollY}px`;
},
closePOModal() {
  this.viewPOModal = false;
  // Restore body scroll
  const scrollY = document.body.style.top;
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.width = '';
  document.body.style.top = '';
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
},
    async saveDetailEdits(){
      try{ await updatePO(this.selectedPO.id, {...this.selectedPO}); await this.fetchPOs(); alert('Changes saved!'); }
      catch(e){ alert('Failed to save changes.'); }
    },
    // ── SEND TO INVENTORY ──
    sendPOToInventory(po) {
      const items = (po.items || []).filter(i => i.description);
      if (items.length === 0) return alert('No items to send!');
      this.sendToInvItems = items.map(item => ({
        material: item.description,
        unit: item.unit || '',
        quantity: item.quantity || 0,
        project: po.work_description || '',
        remarks: `PO: ${po.po_no || ''} | ${po.supplier || ''}${item.remarks ? ' | ' + item.remarks : ''}`,
        selected: true
      }));
      this.sendToInvPO = po;
      this.batchProject = po.work_description || '';
      this.sendToInvModal = true;
    },
    applyBatchProject() {
      if (!this.batchProject) return;
      this.sendToInvItems.forEach(i => { if (i.selected) i.project = this.batchProject; });
    },
    async confirmSendToInventory() {
      const toSend = this.sendToInvItems.filter(i => i.selected && i.material);
      if (toSend.length === 0) return alert('No items selected!');
      const missing = toSend.filter(i => !i.project);
      if (missing.length > 0) return alert(`${missing.length} item(s) are missing a Project Location! Please fill them in.`);
      try {
        await Promise.all(toSend.map(item =>
          addItem({ project: item.project, material: item.material, unit: item.unit || '', quantity: item.quantity || 0, withdraw_qty: 0, remarks: item.remarks || '' })
        ));
        await this.fetchItems();
        this.sendToInvModal = false;
        this.closePOModal();
        this.activeTab = 'inventory';
        alert(`✅ ${toSend.length} item(s) successfully added to Inventory!`);
      } catch(e) { alert('Failed to send to inventory: ' + e.message); }
    },
    printPOList(){
      const rows=this.filteredPOs.map((po,i)=>`<tr><td>${i+1}</td><td>${po.source_of_fund||''}</td><td>${po.work_description||''}</td><td>${po.supplier||''}</td><td>${po.po_no||''}</td><td>${po.pr_no||'—'}</td><td>${po.delivery_date_completed?this.formatDate2(po.delivery_date_completed):'—'}</td><td>${po.status||''}</td></tr>`).join('');
      this.openPrintWindow('Purchase Order List',this.today,`<th>#</th><th>Source of Fund</th><th>Work Description</th><th>Supplier</th><th>P.O. No.</th><th>P.R. No.</th><th>Delivery Completed</th><th>Status</th>`,rows);
    },
    exportPOListExcel(){
      const fd=v=>v?this.formatDate2(v):'—';
      const statusBg={'Delivered':'#D1E7DD','Completed':'#D1E7DD','Pending':'#FFF3CD','In Progress':'#CFE2FF','On-going':'#CFE2FF','Cancelled':'#F8D7DA','Partial':'#E2D9F3'};
      const statusColor={'Delivered':'#0A3622','Completed':'#0A3622','Pending':'#856404','In Progress':'#084298','On-going':'#084298','Cancelled':'#842029','Partial':'#432874'};
      const headers=['#','Source of Fund','Work Description','Supplier','P.O. No.','P.R. No.','RIS No.','Date Delivered','Partial Delivery Date','Delivery Date Completed','Work Date Started','Work Date Completed','Status','POW Status'];
      const colWidths=['40px','160px','280px','220px','130px','130px','130px','120px','140px','160px','120px','140px','100px','100px'];
      const headerCells=headers.map((h,i)=>`<td style="background:#004D26;color:white;font-weight:bold;font-size:11px;padding:8px 6px;text-align:center;border:1px solid #002211;white-space:nowrap;width:${colWidths[i]}">${h}</td>`).join('');
      const dataRows=this.filteredPOs.map((po,i)=>{
        const bg=i%2===0?'#FFFFFF':'#F0FFF4';
        const status=po.status||'';const pow=po.pow_status||'';
        const sBg=statusBg[status]||bg;const sColor=statusColor[status]||'#000';
        const pBg=statusBg[pow]||bg;const pColor=statusColor[pow]||'#000';
        const td=(v,extra='')=>`<td style="padding:6px;border:1px solid #ccc;font-size:10px;background:${bg};vertical-align:top;${extra}">${v||''}</td>`;
        const std=(v,b,c)=>`<td style="padding:6px;border:1px solid #ccc;font-size:10px;background:${b};color:${c};font-weight:bold;text-align:center;vertical-align:middle;">${v||'—'}</td>`;
        return `<tr>${td(i+1,'text-align:center;')}${td(po.source_of_fund)}${td(po.work_description)}${td(po.supplier)}${td(po.po_no)}${td(po.pr_no||'—')}${td(po.ris_no||'—')}${td(fd(po.date_delivered))}${td(fd(po.delivery_date_started))}${td(fd(po.delivery_date_completed))}${td(fd(po.date_started))}${td(fd(po.date_completed))}${std(status,sBg,sColor)}${std(pow,pBg,pColor)}</tr>`;
      }).join('');
      const html=`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;}table{border-collapse:collapse;width:100%;}</style></head><body><h2 style="color:#004D26;text-align:center;font-size:14px;margin-bottom:4px;">PURCHASE ORDER LIST</h2><p style="text-align:center;color:#666;font-size:10px;margin:0 0 10px;">Exported: ${this.today} | Total Records: ${this.filteredPOs.length}</p><table><thead><tr>${headerCells}</tr></thead><tbody>${dataRows}</tbody></table></body></html>`;
      const blob=new Blob([html],{type:'application/vnd.ms-excel;charset=utf-8'});
      const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`PO_List_${this.today}.xls`;a.click();URL.revokeObjectURL(url);
    },
    printSinglePO(po){
      const items=(po.items||[]).map((item,i)=>`<tr><td>${i+1}</td><td>${item.description||''}</td><td>${item.unit||''}</td><td>${item.quantity}</td><td>&#x20B1;${Number(item.unit_cost||0).toLocaleString('en-PH',{minimumFractionDigits:2})}</td><td>&#x20B1;${((item.quantity||0)*(item.unit_cost||0)).toLocaleString('en-PH',{minimumFractionDigits:2})}</td><td>${item.partial_delivery||0}</td><td>${item.item_status||''}</td><td>${item.remarks||''}</td></tr>`).join('');
      const total=(po.items||[]).reduce((s,r)=>s+((r.quantity||0)*(r.unit_cost||0)),0);
      const fd=v=>v?this.formatDate2(v):'—';
      const html=`<!DOCTYPE html><html><head><title>Purchase Order</title><style>body{font-family:Arial,sans-serif;padding:20px;font-size:12px;}h2{text-align:center;color:#004d26;margin-bottom:8px;}table{width:100%;border-collapse:collapse;}th{background:#004d26;color:white;padding:8px;text-align:left;-webkit-print-color-adjust:exact;print-color-adjust:exact;}td{padding:6px 8px;border:1px solid #ccc;}.meta{margin-bottom:10px;display:grid;grid-template-columns:1fr 1fr;gap:5px 20px;font-size:12px;}.meta-full{grid-column:1/-1;}.dates-section{margin:10px 0;border:1px solid #c8e6c9;border-radius:6px;overflow:hidden;}.dates-title{background:#004d26;color:white;padding:5px 10px;font-size:11px;font-weight:700;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.dates-row{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:8px 10px;font-size:12px;}.dates-row2{display:grid;grid-template-columns:repeat(2,1fr);gap:6px;padding:8px 10px;font-size:12px;}.total{text-align:right;font-weight:700;font-size:14px;margin-top:12px;}@media print{th,.dates-title{background:#004d26!important;color:white!important;}}</style></head><body><h2>PURCHASE ORDER</h2><div class="meta"><div><b>Supplier:</b> ${po.supplier||''}</div><div><b>P.R. No.:</b> ${po.pr_no||''}</div><div><b>P.O. No.:</b> ${po.po_no||''}</div><div><b>RIS No.:</b> ${po.ris_no||'—'}</div><div><b>Source of Fund:</b> ${po.source_of_fund||''}</div><div><b>Status:</b> ${po.status||'—'}&nbsp;&nbsp;<b>POW Status:</b> ${po.pow_status||'—'}</div><div class="meta-full"><b>Work Description:</b> ${po.work_description||''}</div></div><div class="dates-section"><div class="dates-title">DELIVERY DATES</div><div class="dates-row"><div><b>Date Delivered:</b> ${fd(po.date_delivered)}</div><div><b>Partial Delivery Date:</b> ${fd(po.delivery_date_started)}</div><div><b>Delivery Date Completed:</b> ${fd(po.delivery_date_completed)}</div></div></div><div class="dates-section"><div class="dates-title">WORK DATES</div><div class="dates-row2"><div><b>Work Date Started:</b> ${fd(po.date_started)}</div><div><b>Work Date Completed:</b> ${fd(po.date_completed)}</div></div></div><table><thead><tr><th>#</th><th>Description</th><th>Unit</th><th>Qty</th><th>Unit Cost</th><th>Amount</th><th>Partial Delivery (Qty)</th><th>Status</th><th>Remarks</th></tr></thead><tbody>${items}</tbody></table><div class="total">TOTAL AMOUNT: &#x20B1;${total.toLocaleString('en-PH',{minimumFractionDigits:2})}</div><script>window.onload=()=>window.print();<\/script></body></html>`;
      const win=window.open('','_blank');
      if(win){ win.document.write(html); win.document.close(); } else alert('Please allow popups.');
    },
    exportSinglePOExcel(po){
      const fd=v=>v?this.formatDate2(v):'—';
      const statusBg={'Delivered':'#D1E7DD','Completed':'#D1E7DD','Pending':'#FFF3CD','In Progress':'#CFE2FF','On-going':'#CFE2FF','Cancelled':'#F8D7DA','Partial':'#E2D9F3'};
      const statusColor={'Delivered':'#0A3622','Completed':'#0A3622','Pending':'#856404','In Progress':'#084298','On-going':'#084298','Cancelled':'#842029','Partial':'#432874'};
      const total=(po.items||[]).reduce((s,r)=>s+((r.quantity||0)*(r.unit_cost||0)),0);
      const itemRows=(po.items||[]).map((item,i)=>{
        const bg=i%2===0?'#FFFFFF':'#F0FFF4';
        const isBg=statusBg[item.item_status]||bg;const isColor=statusColor[item.item_status]||'#000';
        const td=(v,extra='')=>`<td style="padding:6px 8px;border:1px solid #ccc;font-size:10px;background:${bg};vertical-align:top;${extra}">${v===undefined||v===null?'':v}</td>`;
        const std=(v)=>`<td style="padding:6px 8px;border:1px solid #ccc;font-size:10px;background:${isBg};color:${isColor};font-weight:bold;text-align:center;">${v||''}</td>`;
        return `<tr>${td(i+1,'text-align:center;')}${td(item.description||'')}${td(item.unit||'')}${td(item.quantity,'text-align:center;')}${td('₱'+Number(item.unit_cost||0).toLocaleString('en-PH',{minimumFractionDigits:2}),'text-align:right;')}${td('₱'+((item.quantity||0)*(item.unit_cost||0)).toLocaleString('en-PH',{minimumFractionDigits:2}),'text-align:right;font-weight:bold;')}${td(item.partial_delivery||0,'text-align:center;')}${std(item.item_status)}${td(item.remarks||'')}</tr>`;
      }).join('');
      const sBg=statusBg[po.status]||'#eee';const sColor=statusColor[po.status]||'#000';
      const pBg=statusBg[po.pow_status]||'#eee';const pColor=statusColor[po.pow_status]||'#000';
      const badge=(v,bg,color)=>v?`<span style="background:${bg};color:${color};padding:2px 8px;border-radius:4px;font-weight:bold;font-size:10px;">${v}</span>`:'—';
      const html=`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;}table{border-collapse:collapse;}</style></head><body><h2 style="color:#004D26;text-align:center;font-size:14px;margin-bottom:6px;">PURCHASE ORDER</h2><table style="width:100%;margin-bottom:6px;border:1px solid #c8e6c9;"><tr><td style="padding:5px 10px;font-size:11px;width:50%;"><b>Supplier:</b> ${po.supplier||''}</td><td style="padding:5px 10px;font-size:11px;"><b>P.R. No.:</b> ${po.pr_no||''}</td></tr><tr><td style="padding:5px 10px;font-size:11px;"><b>P.O. No.:</b> ${po.po_no||''}</td><td style="padding:5px 10px;font-size:11px;"><b>RIS No.:</b> ${po.ris_no||'—'}</td></tr><tr><td style="padding:5px 10px;font-size:11px;"><b>Source of Fund:</b> ${po.source_of_fund||''}</td><td style="padding:5px 10px;font-size:11px;"><b>Status:</b> ${badge(po.status,sBg,sColor)} &nbsp; <b>POW Status:</b> ${badge(po.pow_status,pBg,pColor)}</td></tr><tr><td colspan="2" style="padding:5px 10px;font-size:11px;"><b>Work Description:</b> ${po.work_description||''}</td></tr></table><table style="width:100%;margin-bottom:4px;border:1px solid #c8e6c9;"><tr><td colspan="3" style="background:#004D26;color:white;font-weight:bold;font-size:10px;padding:5px 10px;">DELIVERY DATES</td></tr><tr><td style="padding:6px 10px;font-size:11px;"><b>Date Delivered:</b> ${fd(po.date_delivered)}</td><td style="padding:6px 10px;font-size:11px;"><b>Partial Delivery Date:</b> ${fd(po.delivery_date_started)}</td><td style="padding:6px 10px;font-size:11px;"><b>Delivery Date Completed:</b> ${fd(po.delivery_date_completed)}</td></tr></table><table style="width:100%;margin-bottom:10px;border:1px solid #c8e6c9;"><tr><td colspan="2" style="background:#004D26;color:white;font-weight:bold;font-size:10px;padding:5px 10px;">WORK DATES</td></tr><tr><td style="padding:6px 10px;font-size:11px;width:50%;"><b>Work Date Started:</b> ${fd(po.date_started)}</td><td style="padding:6px 10px;font-size:11px;"><b>Work Date Completed:</b> ${fd(po.date_completed)}</td></tr></table><table style="width:100%;border-collapse:collapse;"><thead><tr><td style="background:#004D26;color:white;font-weight:bold;font-size:11px;padding:8px;text-align:center;border:1px solid #002211;width:30px;">#</td><td style="background:#004D26;color:white;font-weight:bold;font-size:11px;padding:8px;border:1px solid #002211;min-width:200px;">Description</td><td style="background:#004D26;color:white;font-weight:bold;font-size:11px;padding:8px;text-align:center;border:1px solid #002211;width:70px;">Unit</td><td style="background:#004D26;color:white;font-weight:bold;font-size:11px;padding:8px;text-align:center;border:1px solid #002211;width:50px;">Qty</td><td style="background:#004D26;color:white;font-weight:bold;font-size:11px;padding:8px;text-align:right;border:1px solid #002211;width:90px;">Unit Cost</td><td style="background:#004D26;color:white;font-weight:bold;font-size:11px;padding:8px;text-align:right;border:1px solid #002211;width:100px;">Amount</td><td style="background:#004D26;color:white;font-weight:bold;font-size:11px;padding:8px;text-align:center;border:1px solid #002211;width:80px;">Partial Delivery</td><td style="background:#004D26;color:white;font-weight:bold;font-size:11px;padding:8px;text-align:center;border:1px solid #002211;width:90px;">Status</td><td style="background:#004D26;color:white;font-weight:bold;font-size:11px;padding:8px;border:1px solid #002211;min-width:140px;">Remarks</td></tr></thead><tbody>${itemRows}</tbody><tfoot><tr><td colspan="5" style="border:1px solid #ccc;"></td><td style="padding:8px;font-weight:bold;font-size:12px;text-align:right;background:#E8F5E9;border:1px solid #ccc;">₱${total.toLocaleString('en-PH',{minimumFractionDigits:2})}</td><td colspan="3" style="padding:8px;font-weight:bold;font-size:11px;background:#E8F5E9;border:1px solid #ccc;">TOTAL AMOUNT</td></tr></tfoot></table></body></html>`;
      const blob=new Blob([html],{type:'application/vnd.ms-excel;charset=utf-8'});
      const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`PO_${po.po_no||'Order'}_${this.today}.xls`;a.click();URL.revokeObjectURL(url);
    },
    async saveManualLog(){
      if(!this.manualForm.material||!this.manualForm.log_date){ alert('Date and Material are required.'); return; }
      this.manualSaving=true;
      try {
        const data={ log_date:this.manualForm.log_date, control_no:this.manualForm.control_no, material:this.manualForm.material, unit:this.manualForm.unit||'', incharge:this.manualForm.incharge, origin_project:this.manualForm.origin_project, qty:this.manualForm.qty||0, project_location:this.manualForm.project_location, remarks:this.manualForm.remarks };
        if(this.manualEditMode){ await updateManualLog(this.manualEditId,data); this.manualLogs=this.manualLogs.map(l=>l.id===this.manualEditId?{...l,...data}:l); this.manualEditMode=false; this.manualEditId=null; }
        else { const id=await addManualLog(data); this.manualLogs.unshift({id,...data}); }
        this.manualForm={ log_date:'', control_no:'', material:'', unit:'', incharge:'', origin_project:'', qty:0, project_location:'', remarks:'' };
      } catch(e){ alert('Error saving: '+e.message); }
      this.manualSaving=false;
    },
    editManualLog(log){ this.manualForm={log_date:log.log_date||'',control_no:log.control_no||'',material:log.material||'',unit:log.unit||'',incharge:log.incharge||'',origin_project:log.origin_project||'',qty:log.qty||0,project_location:log.project_location||'',remarks:log.remarks||''}; this.manualEditMode=true; this.manualEditId=log.id; window.scrollTo({top:0,behavior:'smooth'}); },
    cancelManualEdit(){ this.manualEditMode=false; this.manualEditId=null; this.manualForm={ log_date:'', control_no:'', material:'', unit:'', incharge:'', origin_project:'', qty:0, project_location:'', remarks:'' }; },
    async deleteManualLogEntry(id){ if(!confirm('Delete this entry?')) return; await deleteManualLog(id); this.manualLogs=this.manualLogs.filter(l=>l.id!==id); },
    printManualLog(){
      const rows=this.filteredManualLogs.map((l,i)=>`<tr><td>${i+1}</td><td>${l.log_date?this.formatDate2(l.log_date):'—'}</td><td>${l.control_no||'—'}</td><td>${l.material||''}</td><td>${l.unit||'—'}</td><td>${l.incharge||'—'}</td><td>${l.origin_project||''}</td><td>${l.qty||0}</td><td>${l.project_location||''}</td><td>${l.remarks||''}</td></tr>`).join('');
      this.openPrintWindow('Manual Withdrawal Log',this.today,`<th>#</th><th>Date</th><th>Control #</th><th>Material</th><th>Unit</th><th>In-charge</th><th>Origin Project Location</th><th>Qty</th><th>Project Location</th><th>Remarks</th>`,rows);
    },
    exportManualLogExcel(){
      const headers=['#','Date','Control #','Material','Unit','In-charge','Origin Project Location','Qty','Project Location','Remarks'];
      const colWidths=['40px','110px','130px','200px','80px','150px','200px','60px','200px','200px'];
      const headerCells=headers.map((h,i)=>`<td style="background:#004D26;color:white;font-weight:bold;font-size:11px;padding:8px 6px;text-align:center;border:1px solid #002211;width:${colWidths[i]}">${h}</td>`).join('');
      const dataRows=this.filteredManualLogs.map((l,i)=>{
        const bg=i%2===0?'#FFFFFF':'#F0FFF4';
        const td=(v,extra='')=>`<td style="padding:6px 8px;border:1px solid #ccc;font-size:10px;background:${bg};${extra}">${v===undefined||v===null?'':v}</td>`;
        return `<tr>${td(i+1,'text-align:center;')}${td(l.log_date?this.formatDate2(l.log_date):'—')}${td(l.control_no||'—')}${td(l.material||'')}${td(l.unit||'—')}${td(l.incharge||'—')}${td(l.origin_project||'')}${td(l.qty||0,'text-align:center;font-weight:bold;')}${td(l.project_location||'')}${td(l.remarks||'')}</tr>`;
      }).join('');
      const html=`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;}table{border-collapse:collapse;width:100%;}</style></head><body><h2 style="color:#004D26;text-align:center;font-size:14px;margin-bottom:4px;">MANUAL WITHDRAWAL LOG</h2><p style="text-align:center;color:#666;font-size:10px;margin:0 0 10px;">Exported: ${this.today} | Total: ${this.filteredManualLogs.length}</p><table><thead><tr>${headerCells}</tr></thead><tbody>${dataRows}</tbody></table></body></html>`;
      const blob=new Blob([html],{type:'application/vnd.ms-excel;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`Manual_Log_${this.today}.xls`;a.click();URL.revokeObjectURL(url);
    },
    exportWithdrawalExcel(){
      const headers=['#','Date','Control #','Material','In-charge','Origin Project Location','Qty','Project Location','Remarks'];
      const colWidths=['40px','120px','130px','200px','150px','200px','80px','200px','200px'];
      const headerCells=headers.map((h,i)=>`<td style="background:#004D26;color:white;font-weight:bold;font-size:11px;padding:8px 6px;text-align:center;border:1px solid #002211;width:${colWidths[i]}">${h}</td>`).join('');
      const dataRows=this.filteredWithdrawals.map((w,i)=>{
        const bg=i%2===0?'#FFFFFF':'#F0FFF4';
        const td=(v,extra='')=>`<td style="padding:6px 8px;border:1px solid #ccc;font-size:10px;background:${bg};${extra}">${v===undefined||v===null?'':v}</td>`;
        return `<tr>${td(i+1,'text-align:center;')}${td(this.formatDate(w.withdraw_date))}${td(w.control_no||'—')}${td(w.material||'')}${td(w.incharge||'—')}${td(w.item_project||'')}${td(w.quantity_used,'text-align:center;font-weight:bold;')}${td(w.project_location||'')}${td(w.remarks||'')}</tr>`;
      }).join('');
      const html=`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;}table{border-collapse:collapse;width:100%;}</style></head><body><h2 style="color:#004D26;text-align:center;font-size:14px;margin-bottom:4px;">WITHDRAWAL LOG</h2><p style="text-align:center;color:#666;font-size:10px;margin:0 0 10px;">Exported: ${this.today} | Total Records: ${this.filteredWithdrawals.length}</p><table><thead><tr>${headerCells}</tr></thead><tbody>${dataRows}</tbody></table></body></html>`;
      const blob=new Blob([html],{type:'application/vnd.ms-excel;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`Withdrawal_Log_${this.today}.xls`;a.click();URL.revokeObjectURL(url);
    },
    exportInventoryExcel(){
      const headers=['#','Origin Project Location','Materials','Unit','Quantity','Withdraw','Remaining','Remarks','Date Added'];
      const colWidths=['40px','200px','200px','80px','80px','80px','80px','180px','120px'];
      const headerCells=headers.map((h,i)=>`<td style="background:#004D26;color:white;font-weight:bold;font-size:11px;padding:8px 6px;text-align:center;border:1px solid #002211;width:${colWidths[i]}">${h}</td>`).join('');
      const dataRows=this.filteredItems.map((item,i)=>{
        const bg=i%2===0?'#FFFFFF':'#F0FFF4';
        const remBg=item.remaining<=0?'#F8D7DA':item.remaining<=5?'#FFF3CD':'#D1E7DD';
        const remColor=item.remaining<=0?'#842029':item.remaining<=5?'#856404':'#0A3622';
        const td=(v,extra='')=>`<td style="padding:6px 8px;border:1px solid #ccc;font-size:10px;background:${bg};${extra}">${v===undefined||v===null?'':v}</td>`;
        return `<tr>${td(i+1,'text-align:center;')}${td(item.project||'')}${td(item.material||'')}${td(item.unit||'','text-align:center;')}${td(item.quantity,'text-align:center;')}${td(item.withdraw_qty||0,'text-align:center;')}<td style="padding:6px 8px;border:1px solid #ccc;font-size:10px;background:${remBg};color:${remColor};font-weight:bold;text-align:center;">${item.remaining}</td>${td(item.remarks||'')}${td(item.created_at?this.formatDate(item.created_at):'—')}</tr>`;
      }).join('');
      const html=`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;}table{border-collapse:collapse;width:100%;}</style></head><body><h2 style="color:#004D26;text-align:center;font-size:14px;margin-bottom:4px;">MATERIAL LOG INVENTORY</h2><p style="text-align:center;color:#666;font-size:10px;margin:0 0 10px;">Exported: ${this.today} | Total Items: ${this.filteredItems.length}</p><table><thead><tr>${headerCells}</tr></thead><tbody>${dataRows}</tbody></table></body></html>`;
      const blob=new Blob([html],{type:'application/vnd.ms-excel;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`Inventory_${this.today}.xls`;a.click();URL.revokeObjectURL(url);
    },
    printReport(){
      const rows=this.filteredItems.map((item,i)=>`<tr><td>${i+1}</td><td>${item.project||''}</td><td>${item.material||''}</td><td>${item.unit||''}</td><td>${item.quantity}</td><td>${item.withdraw_qty||0}</td><td><strong>${item.remaining}</strong></td><td>${item.remarks||''}</td><td>${item.created_at?this.formatDate(item.created_at):'—'}</td></tr>`).join('');
      this.openPrintWindow('Summary of Material Log Monitoring Sheet',this.printDateLabel,`<th>#</th><th>Project Location</th><th>Materials</th><th>Unit</th><th>Quantity</th><th>Withdraw</th><th>Remaining</th><th>Remarks</th><th>Date Added</th>`,rows);
    },
    printWithdrawalReport(){
      const rows=this.filteredWithdrawals.map((w,i)=>`<tr><td>${i+1}</td><td>${this.formatDate(w.withdraw_date)}</td><td>${w.control_no||'—'}</td><td>${w.material||''}</td><td>${w.incharge||'—'}</td><td>${w.item_project||''}</td><td>${w.quantity_used}</td><td>${w.project_location||''}</td><td>${w.remarks||''}</td></tr>`).join('');
      this.openPrintWindow('Withdrawal Log Monitoring Sheet',this.withdrawalDateLabel,`<th>#</th><th>Date</th><th>Control #</th><th>Material</th><th>In-charge</th><th>Origin Project Location</th><th>Qty</th><th>Project Location</th><th>Remarks</th>`,rows);
    },
    async downloadOnlyWithdrawals(){
      const year=this.archiveYear;
      const toArchive=this.withdrawals.filter(w=>{if(!w.withdraw_date)return false;return new Date(typeof w.withdraw_date==='number'?w.withdraw_date:Number(w.withdraw_date)).getFullYear()===year;});
      if(toArchive.length===0)return alert(`No withdrawal records found for ${year}.`);
      const headers=['#','Date','Control #','Material','In-charge','Origin Project Location','Qty','Project Location','Remarks'];
      let csv=headers.join(',')+'\n';
      toArchive.forEach((w,i)=>{const row=[i+1,this.formatDate(w.withdraw_date),w.control_no||'—',w.material||'',w.incharge||'—',w.item_project||'',w.quantity_used||0,w.project_location||'',w.remarks||''];csv+=row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')+'\n';});
      const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`Withdrawal_${year}_TEST.csv`;a.click();URL.revokeObjectURL(url);
      alert(`Downloaded ${toArchive.length} records for ${year} as CSV.\n\nNothing was deleted from Firebase.`);
    },
    async archiveWithdrawals(){
      const year=this.archiveYear;
      const toArchive=this.withdrawals.filter(w=>{if(!w.withdraw_date)return false;return new Date(typeof w.withdraw_date==='number'?w.withdraw_date:Number(w.withdraw_date)).getFullYear()===year;});
      if(toArchive.length===0)return alert(`No withdrawal records found for ${year}.`);
      if(!confirm(`Found ${toArchive.length} records for ${year}.\n\nStep 1: CSV file will download automatically.\nStep 2: Records will be deleted from Firebase.\n\nProceed?`))return;
      this.archiving=true;
      try{
        const headers=['#','Date','Control #','Material','In-charge','Origin Project Location','Qty','Project Location','Remarks'];
        let csv=headers.join(',')+'\n';
        toArchive.forEach((w,i)=>{const row=[i+1,this.formatDate(w.withdraw_date),w.control_no||'—',w.material||'',w.incharge||'—',w.item_project||'',w.quantity_used||0,w.project_location||'',w.remarks||''];csv+=row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')+'\n';});
        const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`Withdrawal_Archive_${year}.csv`;a.click();URL.revokeObjectURL(url);
        await Promise.all(toArchive.map(w=>remove(ref(db,`withdrawals/${w.id}`))));
        await this.fetchWithdrawals();
        this.showArchiveModal=false;
        alert(`Done! ${toArchive.length} records for ${year} archived and deleted from Firebase.`);
      }catch(e){console.error(e);alert('Archive failed. Please try again.');}
      finally{this.archiving=false;}
    },
    openPrintWindow(title,dateLabel,headers,rows){
      const html=`<!DOCTYPE html><html><head><title>${title}</title><link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@700&display=swap" rel="stylesheet"><style>body{font-family:Arial,sans-serif;padding:20px;font-size:12px;}h2{text-align:center;color:#004d26;font-family:'Merriweather',serif;margin-bottom:4px;}p{text-align:center;margin:2px 0 16px;color:#555;}table{width:100%;border-collapse:collapse;}th{background:#004d26;color:white;padding:8px;text-align:left;font-size:13px;-webkit-print-color-adjust:exact;print-color-adjust:exact;}td{padding:6px 8px;border:1px solid #ccc;}tr:nth-child(even){background:#f0faf0;}.footer{margin-top:30px;font-size:11px;color:#888;text-align:right;}@media print{th{background:#004d26!important;color:white!important;}}</style></head><body><h2>${title}</h2><p>${dateLabel}</p><table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table><div class="footer">Printed on: ${new Date().toLocaleString()}</div><script>window.onload=()=>window.print();<\/script></body></html>`;
      const win=window.open('','_blank');
      if(win){win.document.write(html);win.document.close();}else alert('Please allow popups to print.');
    }
  },
  async mounted(){
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.matches('input, select')) {
        const form = e.target.closest('.form-box, .modal, .form-grid');
        if (!form) return;
        e.preventDefault();
        const inputs = Array.from(form.querySelectorAll('input:not([disabled]), select:not([disabled]), textarea:not([disabled])'));
        const index = inputs.indexOf(e.target);
        if (index > -1 && index < inputs.length - 1) { inputs[index + 1].focus(); }
      }
    });
    this.fetchItems();
    this.fetchWithdrawals();
    this.fetchPOs();
    try { this.manualLogs = await getAllManualLogs(); } catch(e) { console.error(e); }
    setTimeout(()=>{this.showHeader=true;},100);
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
* { box-sizing: border-box; }

.app-wrapper { min-height: 100vh; background: linear-gradient(160deg, #001208 0%, #003318 35%, #006633 65%, #00a854 100%); padding: 50px 40px; font-family: 'DM Sans', Arial, sans-serif; position: relative; }
.bg-orbs { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.orb { position: absolute; border-radius: 50%; filter: blur(100px); animation: orbFloat 10s ease-in-out infinite; }
.orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(0,255,120,0.22), transparent 70%); top: -200px; left: -200px; }
.orb-2 { width: 450px; height: 450px; background: radial-gradient(circle, rgba(255,200,0,0.15), transparent 70%); bottom: 0; right: -150px; animation-delay: 3.5s; }
.orb-3 { width: 350px; height: 350px; background: radial-gradient(circle, rgba(0,180,255,0.12), transparent 70%); top: 40%; left: 30%; animation-delay: 6s; }
.orb-4 { width: 280px; height: 280px; background: radial-gradient(circle, rgba(255,80,120,0.1), transparent 70%); bottom: 20%; left: -80px; animation-delay: 1.5s; }
@keyframes orbFloat { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(30px,-30px) scale(1.06);} 66%{transform:translate(-20px,20px) scale(0.94);} }
.particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
.particle { position: absolute; width: 3px; height: 3px; background: rgba(0,255,120,0.5); border-radius: 50%; left: calc(var(--i) * 5.5%); top: 100%; animation: particleRise calc(8s + var(--i) * 0.4s) linear infinite; animation-delay: calc(var(--i) * 0.5s); }
@keyframes particleRise { 0%{top:110%;opacity:0;} 10%{opacity:0.7;} 90%{opacity:0.4;} 100%{top:-10%;opacity:0;transform:translateX(40px);} }

.container { max-width: 1400px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: visible; box-shadow: 0 40px 120px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,255,120,0.1), inset 0 1px 0 rgba(255,255,255,0.8); position: relative; z-index: 1; opacity: 0; transform: translateY(40px) scale(0.98); transition: opacity 0s, transform 0s; }
.container-in { opacity: 1 !important; transform: translateY(0) scale(1) !important; transition: opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1) !important; }

.header { position: relative; overflow: hidden; background: linear-gradient(135deg, #001a0a 0%, #003318 40%, #005522 70%, #007733 100%); padding: 0; }
.header-bg-mesh { position: absolute; inset: 0; pointer-events: none; background-image: radial-gradient(circle at 20% 50%, rgba(0,255,100,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,200,0,0.05) 0%, transparent 40%), radial-gradient(circle at 60% 80%, rgba(0,150,255,0.04) 0%, transparent 40%); }
.header-inner { display: flex; align-items: center; gap: 32px; padding: 36px 44px 28px; position: relative; z-index: 1; flex-wrap: wrap; }
.logo-zone { position: relative; width: 100px; height: 100px; flex-shrink: 0; opacity: 0; transform: scale(0.4) rotate(-20deg); transition: all 0s; }
.logo-in { opacity: 1 !important; transform: scale(1) rotate(0deg) !important; transition: all 0.9s cubic-bezier(0.34,1.56,0.64,1) 0.15s !important; }
.logo { width: 100px; height: 100px; object-fit: contain; position: relative; z-index: 2; filter: drop-shadow(0 0 20px rgba(0,255,100,0.4)); }
.logo-halo { position: absolute; inset: -14px; border-radius: 50%; background: radial-gradient(circle, rgba(0,255,100,0.15) 0%, transparent 70%); animation: haloPulse 3s ease-in-out infinite; }
@keyframes haloPulse { 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
.logo-ring-1 { position: absolute; inset: -10px; border-radius: 50%; border: 1.5px solid rgba(0,255,100,0.3); animation: ringSpin 8s linear infinite; }
.logo-ring-2 { position: absolute; inset: -20px; border-radius: 50%; border: 1px dashed rgba(0,255,100,0.15); animation: ringSpin 14s linear infinite reverse; }
@keyframes ringSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

.header-copy { flex: 1; min-width: 200px; opacity: 0; transform: translateX(-30px); transition: all 0s; }
.copy-in { opacity: 1 !important; transform: translateX(0) !important; transition: all 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s !important; }
.header-eyebrow { font-size: 11px; font-weight: 600; color: rgba(0,255,100,0.7); letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 10px; }
.header-title { display: flex; flex-direction: column; gap: 2px; margin: 0; }
.ht-line1 { font-family: 'Cinzel', serif; font-size: 38px; font-weight: 900; color: #ffffff; line-height: 1; text-shadow: 0 0 40px rgba(0,255,100,0.3), 0 2px 4px rgba(0,0,0,0.5); }
.ht-line2 { font-family: 'Cinzel', serif; font-size: 24px; font-weight: 700; color: #00e676; line-height: 1.1; text-shadow: 0 0 30px rgba(0,230,118,0.5); }
.ht-line2 em { font-style: normal; color: #ffcc00; }
.ht-line3 { font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; color: rgba(255,255,255,0.55); letter-spacing: 6px; text-transform: uppercase; }
.header-underline { margin-top: 12px; height: 2px; width: 160px; background: linear-gradient(90deg, #00e676, #ffcc00, transparent); border-radius: 2px; animation: underlineGrow 1s ease 0.8s both; }
@keyframes underlineGrow { from{width:0;opacity:0} to{width:160px;opacity:1} }

.header-stats-strip { display: flex; align-items: center; gap: 0; background: rgba(0,0,0,0.25); border-radius: 16px; padding: 16px 24px; border: 1px solid rgba(255,255,255,0.07); opacity: 0; transform: translateX(30px); transition: all 0s; flex-wrap: wrap; }
.strip-in { opacity: 1 !important; transform: translateX(0) !important; transition: all 0.8s cubic-bezier(0.22,1,0.36,1) 0.5s !important; }
.hstat { text-align: center; padding: 0 20px; }
.hstat-num { display: block; font-family: 'Cinzel', serif; font-size: 28px; font-weight: 900; color: #fff; line-height: 1; }
.hstat-num.green { color: #00e676; text-shadow: 0 0 16px rgba(0,230,118,0.6); }
.hstat-num.red { color: #ff5252; text-shadow: 0 0 16px rgba(255,82,82,0.6); }
.hstat-num.gold { color: #ffcc00; text-shadow: 0 0 16px rgba(255,204,0,0.6); }
.hstat-label { display: block; font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.4); letter-spacing: 1.5px; text-transform: uppercase; margin-top: 3px; }
.hstat-div { width: 1px; height: 36px; background: rgba(255,255,255,0.1); }
.header-date-bar { background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255,255,255,0.06); padding: 9px 44px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.5); }

.main-layout { display: flex; gap: 0; align-items: stretch; min-height: 60vh; }
.sidebar { width: 190px; flex-shrink: 0; background: linear-gradient(180deg, #001a0a, #003318 60%, #004422); padding: 24px 14px; display: flex; flex-direction: column; gap: 8px; border-radius: 0 0 0 24px; position: sticky; top: 0; align-self: flex-start; min-height: 100vh; z-index: 100; box-shadow: 4px 0 24px rgba(0,0,0,0.3); }
.sidebar-brand { font-size: 10px; font-weight: 700; letter-spacing: 3px; color: rgba(0,255,100,0.4); padding: 0 8px; margin-bottom: 8px; }
.nav-item { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: transparent; border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.55); text-align: left; transition: all 0.2s; width: 100%; font-family: 'DM Sans', Arial, sans-serif; }
.nav-item:hover { background: rgba(0,255,100,0.07); color: white; border-color: rgba(0,255,100,0.2); transform: translateX(4px); }
.nav-active { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: linear-gradient(135deg, rgba(0,230,118,0.2), rgba(0,255,100,0.08)); border: 1px solid rgba(0,230,118,0.4); border-radius: 10px; cursor: pointer; font-size: 13px; font-weight: 700; color: #00e676; text-align: left; width: 100%; box-shadow: 0 4px 20px rgba(0,230,118,0.15); font-family: 'DM Sans', Arial, sans-serif; }
.nav-svg { width: 16px; height: 16px; flex-shrink: 0; color: rgba(0,230,118,0.85); }
.nav-active .nav-svg { color: #00e676; }

.main-content { flex: 1; min-width: 0; padding: 28px; background: #f7f9f8; }
.tab-pane { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1); }
@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

.form-box { background: linear-gradient(135deg, #f0faf4, #e8f5e9); padding: 22px; border-radius: 14px; margin-bottom: 20px; border: 1px solid #c8e6c9; box-shadow: 0 8px 32px rgba(0,77,38,0.13); animation: slideDown 0.3s ease; position: relative; }
@keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
.form-title { font-family: 'Cinzel', serif; color: #004d26; font-size: 15px; font-weight: 700; margin: 0 0 16px 0; }
.form-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(200px,1fr)); gap: 12px; margin-bottom: 14px; }
.form-field { display: flex; flex-direction: column; gap: 4px; }
.field-label { font-size: 11px; font-weight: 700; color: #004d26; }
input, select { padding: 9px 12px; border: 1.5px solid #a5d6a7; border-radius: 7px; font-size: 13px; width: 100%; background: white; color: #1a1a1a; font-family: 'DM Sans', Arial, sans-serif; transition: all 0.2s; }
input:focus, select:focus { outline: none; border-color: #0f9d58; box-shadow: 0 0 0 3px rgba(15,157,88,0.12); }
.form-actions { display: flex; gap: 10px; flex-wrap: wrap; }

.toolbar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 18px; padding: 14px 16px; background: white; border-radius: 12px; border: 1px solid #dde7e2; box-shadow: 0 8px 28px rgba(0,77,38,0.10); }
.search-input { min-width: 200px; flex: 1; }
.date-filter { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.date-filter label { font-weight: 700; font-size: 12px; color: #004d26; }
.date-filter input { width: auto; min-width: 130px; padding: 7px 10px; flex: 1; }
.select-input { min-width: 150px; padding: 8px 10px; }

.summary-cards { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 20px; }
.card { padding: 20px 18px; border-radius: 18px; text-align: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); position: relative; overflow: hidden; border: 2px solid transparent; }
.card:hover { transform: translateY(-8px) scale(1.04); }
.card-active { outline: 3px solid #004d26; outline-offset: 2px; transform: translateY(-5px) scale(1.02); }
.card-glow { position: absolute; inset: 0; opacity: 0; transition: opacity 0.3s; border-radius: 18px; }
.card:hover .card-glow { opacity: 1; }
.card-shine { position: absolute; top: -60%; left: -60%; width: 220%; height: 220%; background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%); transform: translateX(-100%); transition: transform 0.7s ease; }
.card:hover .card-shine { transform: translateX(110%); }
.card-icon-big { width: 44px; height: 44px; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; }
.card-icon-big svg { width: 44px; height: 44px; opacity: 0.85; }
.card-value { font-size: 32px; font-weight: 700; line-height: 1; margin-bottom: 5px; font-family: 'Cinzel', serif; }
.card-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; opacity: 0.75; margin-bottom: 3px; }
.card-hint { font-size: 10px; opacity: 0.45; }
.card-blue { background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #1e40af; box-shadow: 0 6px 24px rgba(30,64,175,0.12); }
.card-blue .card-glow { background: radial-gradient(circle at 50% 0%, rgba(59,130,246,0.15), transparent 70%); }
.card-green { background: linear-gradient(135deg, #dcfce7, #bbf7d0); color: #15803d; box-shadow: 0 6px 24px rgba(21,128,61,0.12); }
.card-green .card-glow { background: radial-gradient(circle at 50% 0%, rgba(34,197,94,0.15), transparent 70%); }
.card-red { background: linear-gradient(135deg, #fee2e2, #fecaca); color: #b91c1c; box-shadow: 0 6px 24px rgba(185,28,28,0.12); }
.card-red .card-glow { background: radial-gradient(circle at 50% 0%, rgba(239,68,68,0.15), transparent 70%); }
.card-orange { background: linear-gradient(135deg, #ffedd5, #fed7aa); color: #c2410c; box-shadow: 0 6px 24px rgba(194,65,12,0.12); }
.card-orange .card-glow { background: radial-gradient(circle at 50% 0%, rgba(249,115,22,0.15), transparent 70%); }

.table-wrapper { overflow-x: auto; border-radius: 14px; border: 2px solid #2d2d2d; background: #faf6f0; box-shadow: 0 12px 40px rgba(0,77,38,0.15); -webkit-overflow-scrolling: touch; }
table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 600px; }
th { background: linear-gradient(135deg, #003318, #005522); color: white; padding: 12px 11px; text-align: left; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; border: 1px solid #002211; white-space: nowrap; }
td { padding: 10px 11px; border: 1px solid #555; color: #222; vertical-align: middle; }
tr { transition: filter 0.15s; }
tr:hover td { filter: brightness(0.95); }
.actions-cell { display: flex; flex-direction: column; gap: 5px; align-items: stretch; min-width: 90px; }
.empty-row { text-align: center; padding: 32px !important; color: #888; font-style: italic; background: white !important; border: none !important; }
.remarks-cell { font-size: 11px; color: #666; max-width: 160px; word-break: break-word; }
.date-cell { font-size: 11px; color: #555; white-space: nowrap; }
.row-empty td { background: #c62828 !important; color: #fff !important; border-color: #b71c1c !important; font-weight: 600; }
.row-empty td strong { color: #fff !important; }
.row-low-stock td { background: #fff8e1 !important; border-color: #bbb !important; }
.row-has-stock td { background: #d4edda !important; border-color: #555 !important; }

button { padding: 7px 13px; border: none; border-radius: 7px; cursor: pointer; font-size: 12px; font-weight: 700; font-family: 'DM Sans', Arial, sans-serif; transition: all 0.18s ease; }
button:hover { transform: translateY(-2px); }
button:active { transform: translateY(0); }
.btn-primary { background: linear-gradient(135deg, #0f9d58, #004d26); color: white; box-shadow: 0 4px 14px rgba(15,157,88,0.4); }
.btn-warning { background: linear-gradient(135deg, #f9a825, #e65100); color: white; box-shadow: 0 4px 14px rgba(230,81,0,0.35); }
.btn-gray { background: linear-gradient(135deg, #43a047, #1b5e20); color: white; box-shadow: 0 4px 12px rgba(27,94,32,0.3); }
.btn-info { background: linear-gradient(135deg, #0288d1, #01579b); color: white; text-align: center; box-shadow: 0 4px 12px rgba(1,87,155,0.3); }
.btn-warning-sm { background: linear-gradient(135deg, #f9a825, #e65100); color: white; text-align: center; box-shadow: 0 4px 12px rgba(230,81,0,0.3); }
.btn-danger { background: linear-gradient(135deg, #f44336, #b71c1c); color: white; text-align: center; box-shadow: 0 4px 12px rgba(183,28,28,0.3); }
.btn-print { background: linear-gradient(135deg, #6a1b9a, #4a148c); color: white; padding: 8px 16px; font-size: 13px; box-shadow: 0 4px 14px rgba(74,20,140,0.35); }
.btn-excel { background: linear-gradient(135deg, #1b5e20, #2e7d32); color: white; padding: 8px 16px; font-size: 13px; box-shadow: 0 4px 14px rgba(27,94,32,0.35); }
.btn-archive { background: linear-gradient(135deg, #e65100, #bf360c); color: white; padding: 8px 16px; font-size: 13px; }
.btn-send-inv { background: linear-gradient(135deg, #1565c0, #0d47a1); color: white; padding: 8px 16px; font-size: 13px; box-shadow: 0 4px 14px rgba(13,71,161,0.35); }
.btn-send-inv:hover { box-shadow: 0 6px 22px rgba(13,71,161,0.55); }
.btn-send-inv:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.form-toggle { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.toggle-btn { background: white; border: 2px solid #c8e6c9; color: #555; padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: 'DM Sans', Arial, sans-serif; }
.toggle-btn:hover { border-color: #0f9d58; color: #004d26; }
.toggle-active { background: linear-gradient(135deg, #0f9d58, #004d26); border: 2px solid transparent; color: white; padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', Arial, sans-serif; box-shadow: 0 4px 14px rgba(15,157,88,0.35); }

.suggestions-box { position: absolute; top: 100%; left: 0; right: 0; background: white; border: 1.5px solid #0f9d58; border-radius: 0 0 8px 8px; max-height: 200px; overflow-y: auto; z-index: 200; box-shadow: 0 6px 16px rgba(0,0,0,0.15); }
.suggestion-item { padding: 9px 12px; font-size: 13px; cursor: pointer; color: #333; border-bottom: 1px solid #f0f0f0; transition: all 0.15s; }
.suggestion-item:hover { background: #e8f5e9; color: #004d26; padding-left: 18px; font-weight: 600; }

.bulk-hint { font-size: 12px; color: #666; margin-bottom: 12px; }
.bulk-table-wrapper { overflow-x: auto; border-radius: 8px; border: 1.5px solid #c8e6c9; margin-bottom: 14px; -webkit-overflow-scrolling: touch; }
.bulk-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.bulk-table th { background: linear-gradient(135deg,#003318,#005522); color: white; padding: 9px 8px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; white-space: nowrap; }
.bulk-table td { padding: 6px 6px; border-bottom: 1px solid #e8f5e9; vertical-align: middle; }
.bulk-table tr:nth-child(even) td { background: #f8fffc; }
.bulk-table tr:hover td { background: #e8f5e9; }
.row-num { text-align: center; font-weight: 700; color: #004d26; font-size: 12px; width: 30px; }
.bulk-input { padding: 7px 10px; border: 1.5px solid #a5d6a7; border-radius: 6px; font-size: 12px; width: 100%; min-width: 100px; background: white; font-family: 'DM Sans', Arial, sans-serif; }
.bulk-input:focus { outline: none; border-color: #0f9d58; box-shadow: 0 0 0 2px rgba(15,157,88,0.12); }
.bulk-input:disabled { background: #f5f5f5; color: #aaa; cursor: not-allowed; }
.bulk-num { min-width: 60px; }
.bulk-actions { display: flex; gap: 4px; white-space: nowrap; }
.btn-copy { background: #e3f2fd; color: #1565c0; border: none; border-radius: 4px; padding: 5px 8px; cursor: pointer; font-size: 12px; font-weight: 700; transition: all 0.2s; }
.btn-copy:hover { background: #1565c0; color: white; }
.btn-remove { background: #ffebee; color: #c62828; border: none; border-radius: 4px; padding: 5px 8px; cursor: pointer; font-size: 12px; font-weight: 700; transition: all 0.2s; }
.btn-remove:hover { background: #c62828; color: white; }
.btn-remove:disabled { opacity: 0.3; cursor: not-allowed; }
.bulk-footer { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.btn-add-row { background: #e8f5e9; color: #004d26; border: 2px dashed #0f9d58; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 12px; font-weight: 700; font-family: 'DM Sans', Arial, sans-serif; transition: all 0.2s; }
.btn-add-row:hover { background: #0f9d58; color: white; border-style: solid; }
.btn-add-row-same { background: #e3f2fd; color: #1565c0; border: 2px dashed #1565c0; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 12px; font-weight: 700; font-family: 'DM Sans', Arial, sans-serif; transition: all 0.2s; }
.btn-add-row-same:hover { background: #1565c0; color: white; border-style: solid; }
.bulk-count { font-size: 12px; color: #666; font-weight: 600; }

/* Column Filter Button and Dropdown */
.column-filter-btn {
  margin-left: 6px;
  background: transparent;
  color: white;
  border: none;
  border-radius: 0;
  padding: 0;
  min-width: auto;
  min-height: auto;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 800;
  font-family: 'DM Sans', Arial, sans-serif;
}

.column-filter-btn:hover {
  color: white;
}

.column-filter-btn.filter-active {
  color: white;
}

.column-filter-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  min-width: 200px;
  max-width: 300px;
  max-height: 350px;
  overflow-y: auto;
  margin-top: 4px;
}

.filter-option {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  color: #333;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.15s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.filter-option:last-child {
  border-bottom: none;
}

.filter-option:hover {
  background: #f5f5f5;
  color: #004d26;
}

.filter-option.option-active {
  background: #e8f5e9;
  color: #004d26;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(6px);
  animation: fadeIn 0.2s ease;
  padding: 16px;
  overflow-y: auto;
}
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.modal { background: white; padding: 0; border-radius: 20px; width: 430px; max-width: 100%; text-align: center; overflow: hidden; box-shadow: 0 32px 80px rgba(0,0,0,0.4); max-height: 90vh; overflow-y: auto; }
.modal-animate { animation: modalBounce 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }
@keyframes modalBounce { from{opacity:0;transform:scale(0.65) translateY(40px)} to{opacity:1;transform:scale(1) translateY(0)} }
.modal-accent-bar { height: 5px; background: linear-gradient(90deg, #00e676, #0f9d58, #004d26); }
.modal-title { font-family: 'Cinzel', serif; color: #004d26; font-size: 16px; font-weight: 700; margin: 20px 20px 4px; }
.modal-available { color: #666; margin: 0 20px 14px; font-size: 13px; }
.modal-field { text-align: left; margin: 0 20px 10px; }
.modal-label { font-size: 11px; font-weight: 700; color: #004d26; display: block; margin-bottom: 4px; }
.modal input { margin: 0; }
.modal-actions { display: flex; gap: 10px; justify-content: center; margin: 16px 20px 20px; flex-wrap: wrap; }

.inner-tabs { display:flex; gap:6px; margin-bottom:18px; border-bottom:2px solid #e0f0e8; flex-wrap: wrap; }
.inner-tab-btn { padding:8px 20px; border:none; background:transparent; font-size:13px; font-weight:600; color:#666; cursor:pointer; border-bottom:3px solid transparent; margin-bottom:-2px; border-radius:6px 6px 0 0; transition:all 0.2s; font-family:'DM Sans',Arial,sans-serif; }
.inner-tab-btn:hover { color:#004d26; background:#f0fff4; }
.inner-tab-active { color:#004d26 !important; border-bottom-color:#004d26 !important; background:#f0fff4 !important; }

.po-section-label { font-size: 11px; font-weight: 800; color: #004d26; letter-spacing: 1px; text-transform: uppercase; padding: 6px 10px; background: linear-gradient(135deg,#e8f5e9,#c8e6c9); border-left: 3px solid #0f9d58; border-radius: 4px; margin-bottom: 10px; }
.po-info-dates { display: flex; flex-direction: column; gap: 8px; margin: 10px 20px 4px; }
.po-info-date-group { background: #f8fffe; border: 1px solid #c8e6c9; border-radius: 8px; padding: 10px 14px; }
.po-info-date-title { font-size: 10px; font-weight: 800; color: #004d26; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #c8e6c9; }
.po-info-date-row { display: flex; flex-wrap: wrap; gap: 12px; font-size: 13px; }
.po-info-date-row > div { min-width: 160px; flex: 1; }
.po-pow-pending { background: #fff3cd; color: #856404; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-block; }
.po-pow-on-going { background: #cfe2ff; color: #084298; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-block; }
.po-pow-completed { background: #d1e7dd; color: #0a3622; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-block; }
.po-status { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-block; white-space: nowrap; }
.po-status-pending { background: #fff3cd; color: #856404; }
.po-status-delivered { background: #d1ecf1; color: #0c5460; }
.po-status-in-progress { background: #cce5ff; color: #004085; }
.po-status-completed { background: #d4edda; color: #155724; }
.po-status-cancelled { background: #f8d7da; color: #721c24; }
.po-meta-label { color: #666; font-size: 11px; font-weight: 700; text-transform: uppercase; }

/* REPLACE WITH this */
.po-detail-modal {
  position: relative;
  width: min(1200px, 96vw);
  text-align: left;
  max-height: 88vh;
  overflow-y: auto;
  margin: auto;
}
.po-detail-header { padding: 0 20px 16px; }
.po-meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; margin-top: 12px; font-size: 13px; }
.po-detail-table-wrapper { overflow-x: auto; margin: 0 20px 16px; border-radius: 8px; border: 1.5px solid #c8e6c9; -webkit-overflow-scrolling: touch; }
.po-detail-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.po-detail-table th { background: linear-gradient(135deg,#003318,#005522); color: white; padding: 9px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; white-space: nowrap; transition: background 0.2s; }
.po-detail-table th:hover { background: linear-gradient(135deg,#004d26,#007733); }
.po-detail-table tfoot td { background: #f0faf4; }
.po-detail-table td { padding: 4px 6px; border: 1px solid #ddd; vertical-align: middle; }
.detail-input { padding: 5px 8px; border: 1.5px solid #a5d6a7; border-radius: 5px; font-size: 12px; width: 100%; background: white; font-family: 'DM Sans', Arial, sans-serif; }
.detail-input:focus { outline: none; border-color: #0f9d58; box-shadow: 0 0 0 2px rgba(15,157,88,0.12); }
.detail-num { min-width: 60px; max-width: 100px; }
.detail-textarea { resize: vertical; min-height: 38px; line-height: 1.4; padding: 5px 8px; width: 100%; }

/* ── SEND TO INVENTORY MODAL ── */
.send-inv-modal { width: min(960px, 98vw); text-align: left; max-height: 92vh; overflow-y: auto; }
.send-inv-header { padding: 12px 20px 8px; }
.send-inv-title { font-family: 'Cinzel', serif; color: #0d47a1; font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.send-inv-sub { font-size: 12px; color: #555; margin-bottom: 6px; }
.send-inv-hint { font-size: 11px; color: #666; background: #e3f2fd; border-left: 3px solid #1565c0; padding: 7px 10px; border-radius: 4px; line-height: 1.5; }
.send-inv-batch { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: #f0fff4; border-top: 1px solid #c8e6c9; border-bottom: 1px solid #c8e6c9; flex-wrap: wrap; }
.send-inv-table-wrap { overflow-x: auto; margin: 0 16px; border-radius: 8px; border: 1.5px solid #c8e6c9; max-height: 380px; overflow-y: auto; -webkit-overflow-scrolling: touch; }
.send-inv-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.send-inv-table th { background: linear-gradient(135deg, #0d47a1, #1565c0); color: white; padding: 9px 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; white-space: nowrap; position: sticky; top: 0; z-index: 2; }
.send-inv-table td { border-bottom: 1px solid #e8f5e9; vertical-align: middle; }
.sinv-row-on { background: #f0fff8; }
.sinv-row-off { background: #fafafa; opacity: 0.5; }
.sinv-row-on:hover { background: #e8f5e9; }
.input-required { border-color: #f44336 !important; box-shadow: 0 0 0 2px rgba(244,67,54,0.15) !important; }
.send-inv-footer { display: flex; align-items: center; justify-content: space-between; padding: 10px 20px 6px; flex-wrap: wrap; gap: 8px; }
.send-inv-count { font-size: 13px; font-weight: 700; color: #0d47a1; display: flex; align-items: center; gap: 8px; }
.sinv-badge { background: #1565c0; color: white; border-radius: 20px; padding: 2px 10px; font-size: 14px; font-family: 'Cinzel', serif; }

/* ── RESPONSIVE ── */
@media (max-width: 1100px) {
  .app-wrapper { padding: 20px 16px; }
  .ht-line1 { font-size: 30px; }
  .ht-line2 { font-size: 20px; }
  .summary-cards { grid-template-columns: repeat(2, 1fr); }
  .sidebar { width: 160px; }
}
@media (max-width: 900px) {
  .app-wrapper { padding: 0; }
  .container { border-radius: 0; }
  .header-inner { flex-direction: column; align-items: center; padding: 20px 16px 16px; text-align: center; gap: 14px; }
  .header-copy { text-align: center; }
  .header-underline { margin: 10px auto 0; }
  .ht-line1 { font-size: 24px; }
  .ht-line2 { font-size: 16px; }
  .ht-line3 { font-size: 13px; letter-spacing: 3px; }
  .logo-zone { width: 72px; height: 72px; }
  .logo { width: 72px; height: 72px; }
  .header-stats-strip { flex-wrap: wrap; justify-content: center; padding: 12px 16px; }
  .hstat { padding: 6px 10px; }
  .hstat-num { font-size: 20px; }
  .hstat-div { display: none; }
  .header-date-bar { padding: 9px 16px; text-align: center; }
  .main-layout { flex-direction: column; }
  .sidebar { width: 100%; min-height: unset; flex-direction: row; flex-wrap: wrap; padding: 8px; gap: 6px; border-radius: 0; position: relative; box-shadow: 0 2px 12px rgba(0,0,0,0.25); align-self: auto; }
  .sidebar-brand { display: none; }
  .nav-item, .nav-active { flex: 1; min-width: 90px; justify-content: center; padding: 9px 6px; font-size: 12px; text-align: center; }
  .nav-item:hover { transform: none; }
  .main-content { padding: 12px 8px; }
  .form-box { padding: 14px; }
  .form-grid { grid-template-columns: 1fr; }
  .form-actions { flex-direction: column; }
  .form-actions button { width: 100%; }
  .toolbar { flex-direction: column; align-items: stretch; padding: 12px; gap: 8px; }
  .search-input { min-width: unset; width: 100%; }
  .select-input { width: 100%; }
  .btn-print, .btn-excel, .btn-archive, .btn-primary, .btn-gray { width: 100%; }
  .date-filter { flex-direction: column; align-items: stretch; gap: 6px; }
  .date-filter input { width: 100%; min-width: unset; }
  .summary-cards { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .card { padding: 14px 10px; }
  .card-value { font-size: 24px; }
  .card-icon-big { width: 32px; height: 32px; }
  .card-icon-big svg { width: 32px; height: 32px; }
  table { font-size: 11px; }
  th, td { padding: 7px 7px; }
  .actions-cell { flex-direction: column; gap: 4px; min-width: 80px; }
  .actions-cell button { width: 100%; font-size: 11px; padding: 5px 6px; }
  .modal { width: 100%; border-radius: 16px 16px 0 0; position: fixed; bottom: 0; left: 0; right: 0; max-height: 88vh; }
  .modal-overlay { align-items: flex-end; padding: 0; }
.modal-overlay:has(.po-detail-modal) { align-items: center; padding: 16px; }
  .po-detail-modal { width: 100%; border-radius: 16px 16px 0 0; max-height: 92vh; }
  .send-inv-modal { width: 100%; border-radius: 16px 16px 0 0; max-height: 92vh; }
  .po-meta-grid { grid-template-columns: 1fr; }
  .po-info-date-row { flex-direction: column; }
  .po-detail-table-wrapper { margin: 0 10px 12px; }
  .modal-actions { flex-wrap: wrap; }
  .modal-actions button { flex: 1; min-width: 100px; }
  .inner-tab-btn { flex: 1; min-width: 120px; font-size: 12px; }
  .bulk-footer { flex-direction: column; gap: 8px; }
  .bulk-footer button { width: 100%; }
  .send-inv-batch { flex-direction: column; align-items: stretch; }
  .send-inv-footer { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 500px) {
  .ht-line1 { font-size: 18px; }
  .ht-line2 { font-size: 13px; }
  .ht-line3 { font-size: 11px; letter-spacing: 2px; }
  .hstat-num { font-size: 17px; }
  .logo-zone { width: 60px; height: 60px; }
  .logo { width: 60px; height: 60px; }
  .summary-cards { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .card { padding: 10px 8px; border-radius: 12px; }
  .card-value { font-size: 20px; }
  .card-hint { display: none; }
  .card-icon-big { width: 26px; height: 26px; margin-bottom: 5px; }
  .card-icon-big svg { width: 26px; height: 26px; }
  .nav-ico { display: none; }
  .nav-svg { width: 13px; height: 13px; }
  .main-content { padding: 8px 6px; }
  table { font-size: 10px; }
  th { font-size: 9px; padding: 6px 5px; }
  td { padding: 5px 5px; }
}
@media (min-width: 1600px) {
  .container { max-width: 1600px; }
  .ht-line1 { font-size: 44px; }
  .ht-line2 { font-size: 28px; }
  .sidebar { width: 210px; }
}
</style> 