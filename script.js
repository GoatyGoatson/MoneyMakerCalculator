document.addEventListener('DOMContentLoaded', () => {
  const tableBody   = document.querySelector('#dataTable tbody');
  const addBtn      = document.getElementById('addRowBtn');
  const uploadBtn   = document.getElementById('uploadBtn');
  const saveBtn     = document.getElementById('saveBtn');
  const fileInput   = document.getElementById('fileInput');
  const settingsBtn = document.getElementById('settingsBtn');

  function toNumber(str) {
    return Number.parseFloat(str.trim().replace(',', '.'));
  }

  function recalcFactors() {
    const rows = tableBody.rows;
    let prevCost = NaN;
    for (let i = 0; i < rows.length; i++) {
      const costCell   = rows[i].cells[1];
      const factorCell = rows[i].cells[3];
      const cost = toNumber(costCell.textContent);
      if (i === 0 || isNaN(cost) || isNaN(prevCost)) {
        factorCell.textContent = '';
      } else {
        factorCell.textContent = (cost / prevCost).toFixed(4);
      }
      prevCost = cost;
    }
  }

  function attachCellListeners(row) {
    row.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
      cell.addEventListener('input', recalcFactors);
      cell.addEventListener('blur',  recalcFactors);
    });
  }

  function addRow() {
    const newRow = tableBody.insertRow();
    [ '', '', '' ].forEach(() => {
      const cell = newRow.insertCell();
      cell.contentEditable = true;
      cell.textContent = '';
    });
    newRow.insertCell().textContent = ''; // Faktor
    newRow.insertCell().textContent = ''; // Idle Cash
    attachCellListeners(newRow);
    recalcFactors();
  }

  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const lines = evt.target.result.split(/\r?\n/);
      tableBody.innerHTML = '';
      lines.forEach(line => {
        if (!line.trim()) return;
        const [lvl, cost, prod] = line.split(',');
        const row = tableBody.insertRow();
        [lvl, cost, prod].forEach(text => {
          const cell = row.insertCell();
          cell.contentEditable = true;
          cell.textContent = text;
        });
        row.insertCell().textContent = '';
        row.insertCell().textContent = '';
        attachCellListeners(row);
      });
      recalcFactors();
    };
    reader.readAsText(file);
  });

  saveBtn.addEventListener('click', () => {
    let csv = '';
    Array.from(tableBody.rows).forEach(row => {
      const lvl  = row.cells[0].textContent.trim();
      const cost = row.cells[1].textContent.trim();
      const prod = row.cells[2].textContent.trim();
      csv += `${lvl},${cost},${prod}\r\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href    = url;
    a.download = 'tabelle.csv';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  settingsBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });

  addBtn.addEventListener('click', addRow);
  document.querySelectorAll('#dataTable tbody tr').forEach(attachCellListeners);
  recalcFactors();
});