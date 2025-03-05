        // Variables globales
        let profiles = {}; // Stockera les colonnes correspondant aux profils
        let rows = [];

        window.addEventListener('message', (event) => {
            if (event.data && event.data.action === 'updateTable') {
                // Mettre à jour les valeurs depuis localStorage
                const updatedprofiless = JSON.parse(localStorage.getItem('profiles')) || {};
                const updatedRows = JSON.parse(localStorage.getItem('rows')) || [];

                // Réinitialiser les données globales
                profiles.length = 0;
                profiles = updatedprofiless;
                rows.length = 0;
                rows.push(...updatedRows);

                afficherListeProfiles(); // Afficher la liste des profils disponibles

            }
        });

        rows = JSON.parse(localStorage.getItem('rows') || "[]");
        profiles = JSON.parse(localStorage.getItem('profiles') || "{}");
        afficherListeProfiles(); // Afficher la liste des profils disponibles

    // Fonction pour afficher la liste des profils
    function afficherListeProfiles() {
        const profileListContent = document.getElementById("profileListContent");
        profileListContent.innerHTML = ""; // Réinitialiser la liste

        // Vérifier si des profils sont disponibles
        if (Object.keys(profiles).length === 0) {
            profileListContent.innerHTML = `
                <tr>
                    <td colspan="2" style="text-align: center;">Aucun profil disponible.</td>
                </tr>
            `;
            return;
        }

        // Générer les lignes du tableau
        for (let profileName in profiles) {
            profileListContent.innerHTML += `
                <tr>
                    <td style="text-align: left; padding-left: 10px;">${profileName}</td>
                    <td style="text-align: center;">
                        <button style="background-color: #007bff; color: white; padding: 5px 10px; border: none; border-radius: 20px; cursor: pointer;"
                            onclick="afficherProfil('${profileName}')">
                            Display
                        </button>
                        <button style="background-color: #007bff; color: white; padding: 2px 2px; border: none; border-radius: 20px; cursor: pointer;"
                            onclick="export_en_CSV('${profileName}')">
                            Save
                        </button>
                        <button style="background-color: #007bff; color: white; padding: 2px 2px; border: none; border-radius: 20px; cursor: pointer;"
                            onclick="delete_profil('${profileName}')">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        }
    }

        // Fonction pour afficher un tableau basé sur le profil sélectionné
        function afficherProfil(profileName) {
            // Vérifier si le profil existe dans l'objet profiles
            if (!profiles[profileName]) {
                alert(`Le profil "${profileName}" n'existe pas !`);
                return;
            }

            // Récupérer les données du profil
            const profileData = profiles[profileName];
            const columnHeaders = Object.keys(profileData); // Les colonnes (les clés)
            console.log(columnHeaders);
            const numRows = profileData[columnHeaders[0]].length; // Nombre de lignes basé sur le premier tableau

            // Générer l'en-tête du tableau
            let table = `
                <h2 id="profileTitle">Profil : ${profileName}</h2>
                <table>
                    <thead>
                        <tr>`;
            columnHeaders.forEach(header => {
                table += `<th>${header}</th>`;
            });
            table += `
                        </tr>
                    </thead>
                    <tbody>`;

            // Générer les lignes du tableau
            for (let i = 0; i < numRows; i++) {
                table += "<tr>";
                columnHeaders.forEach(header => {
                    table += `<td>${profileData[header][i]}</td>`;
                });
                table += "</tr>";
            }

            table += `
                    </tbody>
                </table>`;

            // Injecter le tableau dans un élément HTML
            document.getElementById('table').innerHTML = table;


            // Mettre à jour le titre du profil
            const profileTitle = document.getElementById("profileTitle");
            profileTitle.textContent = `Profil : ${profileName}`;
        }

        // Fonction pour exporter en CSV
        function export_en_CSV(profileName) {
            if (!profiles[profileName]) {
                alert(`Le profil "${profileName}" n'existe pas !`);
                return;
            }

            // Récupérer les données du profil
            const profileData = profiles[profileName];
            const columnHeaders = Object.keys(profileData); // Les colonnes (les clés)
            const numRows = profileData[columnHeaders[0]].length; // Nombre de lignes basé sur le premier tableau

            if (!profileData || numRows === 0) {
                alert("Données indisponibles pour ce profil !");
                return;
            }

            // Construire le contenu CSV
            let csvContent = "";
            // Ajouter les en-têtes
            csvContent += columnHeaders.map(header => header).join(",") + "\n";
            // Ajouter les données
            for (let i = 0; i < numRows; i++) {
                csvContent += columnHeaders.map(header => profileData[header][i]).join(",") + "\n";
            }

            // Créer un fichier Blob pour le téléchargement
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const filename = `${profileName}.csv`; // Utilise le nom du profil

            // Créer un lien pour télécharger le fichier
            const link = document.createElement("a");
            if (link.download !== undefined) { // Vérification de téléchargement pris en charge
                const url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", filename);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                alert("Votre navigateur ne supporte pas l'exportation CSV.");
            }
        }

        // Fonction pour supprimer un profil
        function delete_profil(profileName) {
            // Vérification si le profil existe
            if (!profiles[profileName]) {
                alert(`Le profil "${profileName}" n'existe pas.`);
                return;
            }

            // Confirmation avant suppression
            if (!confirm(`Voulez-vous vraiment supprimer le profil "${profileName}" ?`)) {
                return;
            }

            // Supprimer le profil de la variable profiles
            delete profiles[profileName];

            // Mettre à jour dans le stockage local
            localStorage.setItem('profiles', JSON.stringify(profiles));

            // Rafraîchir la liste des profils affichée
            afficherListeProfiles();

        }