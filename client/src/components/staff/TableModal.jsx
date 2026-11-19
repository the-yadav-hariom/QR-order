import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';

const SECTIONS = ['Main Dining', 'Outdoor Terrace', 'Balcony', 'Bar & Lounge', 'VIP Room'];
const SEAT_PRESETS = [2, 4, 6, 8, 10];

export default function TableModal() {
  const { state, tableModal, setTableModal, addTable, updateTable, deleteTable } = useRestaurant();

  const isEdit = tableModal?.mode === 'edit';
  const currentKey = tableModal?.tableKey || '';

  const [tableNum, setTableNum] = useState('');
  const [label, setLabel] = useState('');
  const [seats, setSeats] = useState(4);
  const [section, setSection] = useState('Main Dining');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (tableModal) {
      if (tableModal.mode === 'edit') {
        const tKey = tableModal.tableKey;
        const existing = state.tables?.[tKey] || {};
        const rawNum = tKey.replace(/[^0-9]/g, '');
        setTableNum(rawNum || tKey.replace('T', ''));
        setLabel(existing.label || `Table ${tKey.replace('T', '')}`);
        setSeats(existing.seats || 4);
        setSection(existing.section || 'Main Dining');
      } else {
        // Mode 'add': auto-suggest next number
        const nums = Object.keys(state.tables || {})
          .map((k) => parseInt(k.replace(/[^0-9]/g, '')) || 0)
          .filter((n) => n > 0);
        const nextNum = nums.length ? Math.max(...nums) + 1 : 1;
        setTableNum(String(nextNum));
        setLabel(`Table ${nextNum}`);
        setSeats(4);
        setSection('Main Dining');
      }
      setError('');
      setConfirmDelete(false);
    }
  }, [tableModal, state.tables]);

  if (!tableModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanNum = tableNum.trim();
    if (!cleanNum) {
      return setError('Please enter a table number');
    }

    const key = cleanNum.startsWith('T') ? cleanNum : 'T' + cleanNum;

    // Check duplicate if adding or if changing key in edit mode
    if (!isEdit && state.tables?.[key]) {
      return setError(`Table ${key} already exists. Pick another number.`);
    }
    if (isEdit && key !== currentKey && state.tables?.[key]) {
      return setError(`Table ${key} already exists.`);
    }

    const cleanLabel = label.trim() || `Table ${cleanNum.replace('T', '')}`;

    if (isEdit) {
      updateTable(currentKey, {
        label: cleanLabel,
        seats: Number(seats) || 4,
        section,
        newKey: key,
      });
    } else {
      addTable({
        key,
        label: cleanLabel,
        seats: Number(seats) || 4,
        section,
      });
    }
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteTable(currentKey);
  };

  const hasOpenOrders = (state.orders || []).some(
    (o) => o.table === currentKey && !o.cleared && o.status !== 'PAID'
  );

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#161616] border border-[#2A2A2A] rounded-3xl p-6 w-full max-w-md text-[#F2EEE8] shadow-2xl animate-rin my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#2A2A2A]">
          <div>
            <h3 className="text-lg font-black tracking-tight text-[#F2EEE8] flex items-center gap-2">
              <span>{isEdit ? '✎' : '➕'}</span>
              <span>{isEdit ? `Edit ${label || currentKey}` : 'Add New Table'}</span>
            </h3>
            <p className="text-xs text-[#8D8780] mt-0.5">
              {isEdit
                ? 'Update table number, seating capacity, or floor section'
                : 'Instantly adds table to live floor plan & guest selector'}
            </p>
          </div>
          <button
            onClick={() => setTableModal(null)}
            className="w-8 h-8 rounded-full bg-[#2A2A2A] hover:bg-[#333] text-[#8D8780] hover:text-white flex items-center justify-center text-sm transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Table Number / Key */}
          <div>
            <label className="block text-xs font-bold text-[#8D8780] mb-1">
              Table Number * <span className="font-normal text-[11px]">(e.g. 7, 8, or T7)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="bg-[#212121] border border-[#333] px-3 py-2 rounded-xl text-xs font-bold text-[#8D8780]">
                T
              </span>
              <input
                type="text"
                value={tableNum.replace(/^T/i, '')}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9A-Za-z_-]/g, '');
                  setTableNum(val);
                  if (!isEdit || label.startsWith('Table ')) {
                    setLabel(`Table ${val}`);
                  }
                }}
                placeholder="7"
                maxLength={8}
                className="flex-1 bg-[#0F0F0F] text-[#F2EEE8] border border-[#333] focus:border-[#F25C2A] rounded-xl px-3 py-2 text-xs outline-none font-bold"
                required
              />
            </div>
          </div>

          {/* Table Display Label */}
          <div>
            <label className="block text-xs font-bold text-[#8D8780] mb-1">
              Display Name / Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Table 7 or VIP Booth"
              maxLength={30}
              className="w-full bg-[#0F0F0F] text-[#F2EEE8] border border-[#333] focus:border-[#F25C2A] rounded-xl px-3 py-2 text-xs outline-none"
            />
          </div>

          {/* Seating Capacity */}
          <div>
            <label className="block text-xs font-bold text-[#8D8780] mb-1.5">
              Seating Capacity (Guests)
            </label>
            <div className="flex gap-2 items-center">
              {SEAT_PRESETS.map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setSeats(cnt)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                    seats === cnt
                      ? 'bg-[#F25C2A] text-white border-[#F25C2A] shadow-sm'
                      : 'bg-[#212121] border-[#333] text-[#8D8780] hover:text-[#F2EEE8]'
                  }`}
                >
                  {cnt}
                </button>
              ))}
              <input
                type="number"
                min="1"
                max="30"
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="w-16 bg-[#0F0F0F] text-[#F2EEE8] border border-[#333] focus:border-[#F25C2A] rounded-xl px-2 py-1.5 text-xs outline-none text-center font-bold"
                title="Custom seats"
              />
            </div>
          </div>

          {/* Floor Section */}
          <div>
            <label className="block text-xs font-bold text-[#8D8780] mb-1">
              Floor Section / Location
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full bg-[#0F0F0F] text-[#F2EEE8] border border-[#333] focus:border-[#F25C2A] rounded-xl px-3 py-2 text-xs outline-none cursor-pointer"
            >
              {SECTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="text-xs font-bold text-[#EF4444] pt-1">{error}</div>}

          {/* Footer Controls */}
          <div className="flex items-center gap-2 pt-3 border-t border-[#2A2A2A]">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={hasOpenOrders}
                className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition ${
                  hasOpenOrders
                    ? 'opacity-40 cursor-not-allowed bg-[#212121] text-[#666] border-[#333]'
                    : confirmDelete
                    ? 'bg-[#EF4444] text-white border-[#EF4444]'
                    : 'text-[#EF4444] bg-[#2A2A2A] hover:bg-[#EF4444]/20 border-[#333]'
                }`}
                title={hasOpenOrders ? 'Cannot delete table with open orders' : 'Remove table'}
              >
                {confirmDelete ? 'Confirm Delete' : '🗑 Delete'}
              </button>
            )}

            <button
              type="button"
              onClick={() => setTableModal(null)}
              className="ml-auto py-2.5 px-4 rounded-xl text-xs font-bold text-[#8D8780] hover:text-[#F2EEE8] bg-[#2A2A2A] border border-[#333] transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl text-xs font-extrabold text-white bg-[#F25C2A] hover:bg-[#e04d1d] shadow-md transition transform active:scale-95 flex items-center gap-1.5"
            >
              <span>✓</span>
              <span>{isEdit ? 'Save Changes' : 'Add Table'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
