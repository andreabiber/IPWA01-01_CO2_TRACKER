
document.addEventListener("DOMContentLoaded", () => {
    loadTableData();
    setupSorting();
});

let selectedFilters = { land: new Set(), unternehmen: new Set() };

async function loadTableData() {
    try {
        const response = await fetch("../assets/table.json");

        if (!response.ok) {
            throw new Error(`HTTP-Fehler: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Unerwartetes Datenformat: Erwartet wurde ein Array.");
        }

        data.forEach(({ land, unternehmen }) => {
            selectedFilters.land.add(land);
            selectedFilters.unternehmen.add(unternehmen);
        });

        updateTable(data);
        setupFilters(data);
    } catch (error) {
        console.error("Fehler beim Laden der JSON-Daten:", error);
    }
}

function updateTable(data) {
    const tableBody = document.querySelector("#emissionsTable tbody");
    tableBody.innerHTML = "";

    const fragment = document.createDocumentFragment();

    data.forEach(({ land, unternehmen, emissionen }) => {
        const row = document.createElement("tr");
        row.dataset.land = land;
        row.dataset.unternehmen = unternehmen;
        
        row.innerHTML = `
            <td>${land}</td>
            <td>${unternehmen}</td>
            <td>${emissionen}</td>
        `;

        fragment.appendChild(row);
    });

    tableBody.appendChild(fragment);
}

function setupSorting() {
    const tableHeaders = document.querySelectorAll("#emissionsTable thead th");
    let sortOrder = {};

    tableHeaders.forEach((header, index) => {
        sortOrder[index] = 1;
        header.addEventListener("click", () => {
            sortTable(index, sortOrder[index]);
            sortOrder[index] *= -1;
        });
    });
}

function sortTable(columnIndex, order) {
    const tableBody = document.querySelector("#emissionsTable tbody");
    const rows = Array.from(tableBody.rows);

    rows.sort((a, b) => {
        const aValue = a.cells[columnIndex].textContent.trim();
        const bValue = b.cells[columnIndex].textContent.trim();
        const isNumeric = !isNaN(aValue) && !isNaN(bValue);
        return isNumeric
            ? (parseFloat(aValue) - parseFloat(bValue)) * order
            : aValue.localeCompare(bValue, "de", { numeric: true }) * order;
    });

    tableBody.innerHTML = "";
    rows.forEach((row) => tableBody.appendChild(row));
}

function setupFilters(data) {
    const filters = ["land", "unternehmen"];
    const tableHeaders = document.querySelectorAll("#emissionsTable thead th");
    
    filters.forEach((filter, index) => {
        const header = tableHeaders[index];
        const filterButton = document.createElement("span");
        filterButton.innerHTML = " &#9662;";
        filterButton.style.cursor = "pointer";
        filterButton.style.marginLeft = "5px";
        filterButton.addEventListener("click", (event) => showFilterPopup(event, filter, data, filterButton));
        header.appendChild(filterButton);
    });
}

function showFilterPopup(event, filterKey, data, triggerElement) {
    event.stopPropagation();
    closeFilterPopup();

    const uniqueValues = [...new Set(data.map(item => item[filterKey]))];
    const popup = document.createElement("div");
    popup.className = "filter-popup";
    popup.style.position = "absolute";
    popup.style.background = "white";
    popup.style.border = "1px solid black";
    popup.style.padding = "10px";
    popup.style.boxShadow = "0px 4px 6px rgba(0,0,0,0.1)";
    popup.style.zIndex = "1000";
    
    const rect = triggerElement.getBoundingClientRect();
    popup.style.left = `${rect.left}px`;
    popup.style.top = `${rect.top + window.scrollY + triggerElement.offsetHeight}px`;

    uniqueValues.forEach(value => {
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = value;
        checkbox.checked = selectedFilters[filterKey].has(value);
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                selectedFilters[filterKey].add(value);
            } else {
                selectedFilters[filterKey].delete(value);
            }
            applyFilter();
        });

        const label = document.createElement("label");
        label.textContent = value;
        label.prepend(checkbox);

        popup.appendChild(label);
        popup.appendChild(document.createElement("br"));
    });

    const resetButton = document.createElement("button");
    resetButton.textContent = "Zurücksetzen";
    resetButton.style.marginTop = "10px";
    resetButton.style.display = "block";
    resetButton.style.width = "100%";
    resetButton.addEventListener("click", () => {
        selectedFilters[filterKey] = new Set(uniqueValues);
        applyFilter();
        showFilterPopup(event, filterKey, data, triggerElement);
    });

    popup.appendChild(resetButton);
    document.body.appendChild(popup);
    setTimeout(() => document.addEventListener("click", closeFilterPopup), 0);
}

function closeFilterPopup(event) {
    if (!event || !document.querySelector(".filter-popup").contains(event.target)) {
        const existingPopup = document.querySelector(".filter-popup");
        if (existingPopup) existingPopup.remove();
        document.removeEventListener("click", closeFilterPopup);
    }
}

function applyFilter() {
    const tableRows = document.querySelectorAll("#emissionsTable tbody tr");
    tableRows.forEach(row => {
        const land = row.dataset.land;
        const unternehmen = row.dataset.unternehmen;
        const showLand = selectedFilters.land.has(land);
        const showUnternehmen = selectedFilters.unternehmen.has(unternehmen);
        row.style.display = showLand && showUnternehmen ? "" : "none";
    });
}
