document.addEventListener('DOMContentLoaded', () => {
  const tableBody  = document.querySelector('#dataTable tbody');
  const addBtn     = document.getElementById('addRowBtn');
  const uploadBtn  = document.getElementById('uploadBtn');
  const saveBtn    = document.getElementById('saveBtn');
  const fileInput  = document.getElementById('fileInput');
  const settingsBtn = document.getElementById('settingsBtn');

  // Convert cell text to float, support comma as decimal
  function toNumber(str) {
    return Number.parseFloat(str.trim().replace(',', '.'));
  }

  // Recalculate factors for all rows
  function recalcFactors() {
    const rows = tableBody.rows;
    let prevCost = NaN;
    for (let i = 0; i < rows.length; i++) {
      const costCell   = rows[i].cells[1];
      const factorCell = rows[i].cells[2];
      const cost = toNumber(costCell.textContent);
      if (i === 0 || isNaN(cost) || isNaN(prevCost)) {
        factorCell.textContent = '';
      } else {
        factorCell.textContent = (cost / prevCost).toFixed(4);
      }
      prevCost = cost;
    }
  }

  // Attach listeners to editable cells
  function attachCellListeners(row) {
    row.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
      cell.addEventListener('input', recalcFactors);
      cell.addEventListener('blur',  recalcFactors);
    });
  }

  // Add new row
  function addRow() {
    const newRow = tableBody.insertRow();
    [ '', '' ].forEach(text => {
      const cell = newRow.insertCell();
      cell.contentEditable = true;
      cell.textContent = text;
    });
    newRow.insertCell().textContent = ''; // Faktor
    newRow.insertCell().textContent = ''; // Idle Cash
    attachCellListeners(newRow);
    recalcFactors();
  }

  // Upload CSV and populate table
  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const lines = evt.target.result.split(/\r?\n/); // ([developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsText?utm_source=chatgpt.com))
      tableBody.innerHTML = '';
      lines.forEach((line, idx) => {
        if (!line.trim()) return;
        const [lvl, cost] = line.split(','); // assumes comma-separated ([stackoverflow.com](https://stackoverflow.com/questions/7431268/how-to-read-data-from-csv-file-using-javascript?utm_source=chatgpt.com))
        const row = tableBody.insertRow();
        [lvl, cost].forEach(text => {
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

  // Save table as CSV
  saveBtn.addEventListener('click', () => {
    let csv = '';
    Array.from(tableBody.rows).forEach(row => {
      const lvl  = row.cells[0].textContent.trim();
      const cost = row.cells[1].textContent.trim();
      csv += `${lvl},${cost}\r\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' }); // ([developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/Blob/Blob?utm_source=chatgpt.com))
    const url  = URL.createObjectURL(blob);           // ([developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static?utm_source=chatgpt.com))
    const a    = document.createElement('a');
    a.href    = url;
    a.download = 'tabelle.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);                         // ([developer.mozilla.org](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL_static?utm_source=chatgpt.com))
  });

  // Toggle Dark Mode
  settingsBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');       // ([stackoverflow.com](https://stackoverflow.com/questions/65738074/how-do-i-properly-structure-a-dark-mode-toggle-using-javascript?utm_source=chatgpt.com))
  });

  // Initial setup
  addBtn.addEventListener('click', addRow);
  document.querySelectorAll('#dataTable tbody tr').forEach(attachCellListeners);
  recalcFactors();
});