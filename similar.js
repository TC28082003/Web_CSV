        // Variables globales pour les colonnes et les lignes
        let selectedColumns = [];
        let data_transform = [];
        let profileName = null;
        // Afficher le tableau
        function cleanProfileName(name) {
            // Replace unwanted characters " and \ with an empty string
            return name.replace(/["\\]/g, '');
        }
        console.log(profileName);
        function afficherTableau() {
            profileName = cleanProfileName(profileName);
            console.log("Data: ",data_transform);
            let table = `<h1><P></P> ${profileName}</h1><table><thead><tr>`;
            table += "<th>Select lines</th>";

            // Ajouter une ligne de cases à cocher pour les colonnes
            selectedColumns.forEach((colIndex) => {
                table += `<th><input type='checkbox' class='columnSelect' value='${colIndex}'> ${data_transform[0][colIndex]}</th>`;
            });

            table += "</tr></thead><tbody>";


            // Des valeurs pour chaque colonne
            for (let i = 1; i < data_transform.length; i++) {
                table += "<tr>";
                table += `<td><input type='checkbox' class='rowSelect' value='${i}'></td>`;
                selectedColumns.forEach(colIndex => {
                    table += `<td>${data_transform[i][colIndex]}</td>`;
                });
                table += "</tr>";
            }
            table += "</tbody></table>";
            document.getElementById('table').innerHTML = table;
        }
        function getTableData() {
                let tableData = [];
                // Sélectionner le tableau affiché
                const table = document.querySelector('#table table'); // Trouver le tableau dans le conteneur "table"
                const rows = table.querySelectorAll('tr'); // Récupérer toutes les lignes du tableau
                rows.forEach((row) => {
                    let rowData = [];

                    // Sélectionner toutes les cellules (th ou td)
                    const cells = row.querySelectorAll('th, td');
                    cells.forEach((cell, cellIndex) => {
                        if (cellIndex > 0) { // Ignorer la première cellule de chaque ligne
                            rowData.push(cell.innerText || cell.textContent);
                        }
                    });

                    tableData.push(rowData); // Ajouter la ligne mise à jour dans le tableau final
                });
                return tableData;
        }
            // Écouter les messages de la fenêtre parent
        window.addEventListener('message', (event) => {
            if (event.data && event.data.action === 'updateTable') {
                // Mettre à jour les valeurs depuis localStorage
                const updatedCols = JSON.parse(localStorage.getItem('selectedColumns')) || [];
                const updatedRows = JSON.parse(localStorage.getItem('data_transform')) || [];
                const updatedprofileName = localStorage.getItem('profileName') || '';
                // Réinitialiser les données globales
                selectedColumns.length = 0;
                selectedColumns.push(...updatedCols);
                data_transform.length = 0;
                data_transform.push(...updatedRows);
                profileName = updatedprofileName;
                // Mettre à jour le tableau
                afficherTableau();
            }
        });
        // Initier le tableau lors du premier chargement
        selectedColumns = JSON.parse(localStorage.getItem('selectedColumns')) || [];
        data_transform = JSON.parse(localStorage.getItem('data_transform')) || [];
        profileName = localStorage.getItem('profileName') || '';
        afficherTableau();

        // Fonction pour calculer la distance Euclidienne entre deux vecteurs
        function euclideanDistance(vec1, vec2) {
            let sum = 0;
            for (let i = 0; i < vec1.length; i++) {
                sum += Math.pow(vec1[i] - vec2[i], 2);
            }
            return Math.sqrt(sum);
        }

function trierParDistanceEuclidienne(fullRows, selectedRows, filteredRows) {
    let ligneChoisis = [];
    let autres = [];

    // Diviser les lignes choisi avec des autres lignes
    for (let i = 0; i < filteredRows.length; i++) {
        if (selectedRows.includes(i + 1)) {
            ligneChoisis.push({ original: fullRows[i], filtered: filteredRows[i] });
        } else {
            autres.push({ original: fullRows[i], filtered: filteredRows[i] });
        }
    }
    console.log(ligneChoisis);
    console.log(autres);
    let distanceMin = [];
    // Calculer par le euclidean algorithme
    for (let i = 0; i < autres.length; i++) {
        let distances = [];
        for (let j = 0; j < ligneChoisis.length; j++) {
            let dist = euclideanDistance(autres[i].filtered, ligneChoisis[j].filtered);
            distances.push(dist);
        }
        let minDist = Math.min(...distances);
        distanceMin.push({ row: autres[i].original, distance: minDist });
    }

    // Sort par le distance
    distanceMin.sort((a, b) => a.distance - b.distance);
    console.log(distanceMin);
    // Return un nouveau table après similarité
    return [
        ...ligneChoisis.map(item => item.original),
        ...distanceMin.map(item => item.row)
    ];
}

let result_similarWindow = null;
function calculer_similarity() {
    const selectedRows = Array.from(document.querySelectorAll('input.rowSelect:checked')).map(input => parseInt(input.value));
    const selectedCols = Array.from(document.querySelectorAll('input.columnSelect:checked')).map(input => parseInt(input.value));
    let rows = getTableData();
    console.log("Rows: ",rows);

    const tooltip = document.getElementById('tooltip');
    tooltip.style.display = "none"; // Masquer le tooltip par défaut

    if (selectedRows.length === 0) {
        tooltip.textContent = "if no line selected, message: \"Please select at least one patient!\"";
        tooltip.style.display = "block"; // Afficher le tooltip
        alert("Please select at least one row!");
        return;
    }
    else if (selectedCols.length === 0) {
        tooltip.textContent = "if no column selected, message: \"Please select at least one column!\"";
        tooltip.style.display = "block"; // Afficher le tooltip
        alert("Please select at least one column!");
        return;
    }
    else{
        tooltip.textContent = "Click here to see the result!";
        tooltip.style.display = "block"; // Afficher le tooltip
    }

    // Des valeurs pour les colonnes on a chosi
    const filteredRows = data_transform.slice(1).map(row => {
        return selectedCols.map(colIndex => parseFloat(row[colIndex]) || 0);
    });

    console.log("Fil: ",filteredRows);
    // Valeur original dans ce fichier
    const fullRows = rows.slice(1);
    console.log("Full: ",fullRows);

    // Données après similarité
    const orderedData = trierParDistanceEuclidienne(fullRows, selectedRows, filteredRows);
    console.log(orderedData);
    // Creer un table pour des nouveau fichier .csv après similarité
    let table = `<div class=\"table\" id=\"table\"> <h1> Result Similarity for ${profileName} </h1><table><thead><tr>`;
    rows[0].forEach(header => {
        table += `<th>${header}</th>`;
    });
    table += "</tr></thead><tbody>";

    orderedData.forEach(row => {
        table += "<tr>";
        row.forEach(cell => {
            table += `<td>${cell}</td>`;
        });
        table += "</tr>";
    });
    table += "</tbody></table></div>";
    localStorage.setItem('profileName', JSON.stringify(profileName));
    localStorage.setItem('table', JSON.stringify(table)); // Avec un 'I' majuscule    // Vérifier si la fenêtre `display.html` est déjà ouverte
    const result_similarName = localStorage.getItem("result_similarTabName") || "result_similartab";
    if (result_similarWindow && !result_similarWindow.closed) {
        // Si déjà ouverte, envoyer une commande à la fenêtre pour qu'elle mette à jour son contenu
        result_similarWindow.postMessage({ action: 'updateTable' }, '*');
        result_similarWindow.focus(); // Ramener au premier plan
    } else {
        // Sinon, ouvrir une nouvelle fenêtre et conserver la référence
        result_similarWindow = window.open('result_similar.html', result_similarName);
    }
}


let virtualWindow = null;
function virtual_profile() {
    const selectedRows = Array.from(document.querySelectorAll('input.rowSelect:checked')).map(input => parseInt(input.value));
    let rows = getTableData();
    let selectedCols = selectedColumns;
    console.log(selectedColumns);
    const tooltip1 = document.getElementById('tooltip1');
    tooltip1.style.display = "none"; // Masquer le tooltip par défaut

    if (selectedRows.length === 0) {
        tooltip1.textContent = "if no line selected, message: \"Please select at least one patient!\"";
        tooltip1.style.display = "block"; // Afficher le tooltip
        alert("Please select at least one row!");
        return;
    }
    else {
        tooltip1.textContent = "Click here to display virtual patients!";
        tooltip1.style.display = "block"; // Afficher le tooltip
    }

    // Stocker les colonnes et les lignes dans localStorage
    localStorage.setItem('selectedRows', JSON.stringify(selectedRows));
    localStorage.setItem('selectedCols', JSON.stringify(selectedCols));
    localStorage.setItem('rows', JSON.stringify(rows));
    localStorage.setItem('profileName', JSON.stringify(profileName));
    localStorage.setItem('data_transform', JSON.stringify(data_transform));

    const virtualName = localStorage.getItem("virtualTabName") || "virtualtab";
    //Vérification et gestion de la fenêtre `virtual.html`
    if (virtualWindow && !virtualWindow.closed) {
        // Si la fenêtre existe et est ouverte, envoyer une commande pour mettre à jour
        virtualWindow.postMessage({ action: 'updateTable' }, '*');
        virtualWindow.focus(); // Ramener au premier plan
    } else {
        // Sinon, ouvrir une nouvelle fenêtre et conserver la référence
        virtualWindow = window.open('virtual.html', virtualName);
    }
}

let pagehomeWindow = null;
function return_home_screen() {
    const pagehomeName = localStorage.getItem("pagehomeTabName") || "pagehometab";
    //Vérification et gestion de la fenêtre `similarity.html`
    if (pagehomeWindow && !pagehomeWindow.closed) {
        // Si la fenêtre existe et est ouverte, envoyer une commande pour mettre à jour
        pagehomeWindow.focus(); // Ramener au premier plan
    } else {
        // Sinon, ouvrir une nouvelle fenêtre et conserver la référence
        pagehomeWindow = window.open("index.html", pagehomeName);
        // Attendre que la fenêtre soit prête (au cas où le script n'est pas chargé immédiatement)
        pagehomeWindow.onload = () => {
            pagehomeWindow.postMessage({ action: 'updateTable' }, '*');
        };
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const similarityName = "similaritytab";
    // Store the tab name for Page2
    localStorage.setItem("similarityTabName", similarityName);
    window.name = similarityName; // Assign a unique name to this tab
});

// When this tab is closed or refreshed, clear the reference in localStorage
window.addEventListener("beforeunload", () => {
    localStorage.removeItem("similarityTabName");
});


