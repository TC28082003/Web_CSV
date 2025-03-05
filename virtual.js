        // Variables globales pour les colonnes et les lignes
        let selectedCols = [];
        let rows = [];

        // Afficher le tableau
        function afficherTableau() {
            let table = "<table><thead><tr>";
            table += "<th>Sélectionner lignes</th>";

            // Faire des colonnes en tête
            selectedCols.forEach(colIndex => {
                table += `<th>${rows[0][colIndex]}</th>`;
            });
            table += "</tr></thead><tbody>";

            // Des valeurs pour chaque colonne
            for (let i = 1; i < rows.length; i++) {
                table += "<tr>";
                table += `<td><input type='checkbox' class='rowSelect' value='${i}'></td>`;
                selectedCols.forEach(colIndex => {
                    table += `<td>${rows[i][colIndex]}</td>`;
                });
                table += "</tr>";
            }
            table += "</tbody></table>";
            document.getElementById('table').innerHTML = table;
        }

            // Écouter les messages de la fenêtre parent
        window.addEventListener('message', (event) => {
            if (event.data && event.data.action === 'updateTable') {
                // Mettre à jour les valeurs depuis localStorage
                const updatedCols = JSON.parse(localStorage.getItem('selectedColumns')) || [];
                const updatedRows = JSON.parse(localStorage.getItem('rows')) || [];

                // Réinitialiser les données globales
                selectedCols.length = 0;
                selectedCols.push(...updatedCols);
                rows.length = 0;
                rows.push(...updatedRows);

                // Mettre à jour le tableau
                afficherTableau();
            }
        });
        // Initier le tableau lors du premier chargement
        selectedCols = JSON.parse(localStorage.getItem('selectedColumns')) || [];
        rows = JSON.parse(localStorage.getItem('rows')) || [];
        afficherTableau();

    function calculer_virtual_sort(){

    }