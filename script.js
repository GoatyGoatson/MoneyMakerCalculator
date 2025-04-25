document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.querySelector('#dataTable tbody');
  const addBtn = document.getElementById('addRowBtn');

  // Wandelt Zelltext in Gleitkommazahl um (Komma → Punkt)
  function toNumber(str) {
    return Number.parseFloat(str.trim().replace(',', '.'));
  }

  // Berechnet die Faktor-Spalte basierend auf Kosten
  function recalcFactors() {
    const rows = tableBody.rows;
    let prevCost = NaN;

    for (let i = 0; i < rows.length; i++) {
      const costCell  = rows[i].cells[1];
      const factorCell = rows[i].cells[2];
      const cost = toNumber(costCell.textContent);

      if (i === 0 || isNaN(cost) || isNaN(prevCost)) {
        factorCell.textContent = '';
      } else {
        const factor = cost / prevCost;
        factorCell.textContent = factor.toFixed(4);
      }
      prevCost = cost;
    }
  }

  // Bindet Event-Listener an editierbare Zelle
  function attachCellListeners(row) {
    row.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
      cell.addEventListener('input',  recalcFactors);
      cell.addEventListener('blur',   recalcFactors);
    });
  }

  // Fügt eine neue Zeile hinzu
  function addRow() {
    const newRow = tableBody.insertRow();
    // Level- und Kosten-Spalten
    [ '', '' ].forEach(text => {
      const cell = newRow.insertCell();
      cell.contentEditable = true;
      cell.textContent = text;
    });
    // Faktor- und Idle Cash-Spalten
    newRow.insertCell().textContent = '';
    newRow.insertCell().textContent = '';
    attachCellListeners(newRow);
    recalcFactors();
  }

  // Initialisierung
  addBtn.addEventListener('click', addRow);
  tableBody.querySelectorAll('tr').forEach(attachCellListeners);
  recalcFactors();
});
