// Sélectionner l'élément input
const file = document.getElementById('csvfile');

// Attacher un événement de changement
file.addEventListener("change", prend_fichier);
let rows = [];

// Fonction pour lire le fichier CSV
function prend_fichier(event) {
    const fichier = event.target.files[0]; // Récupérer le fichier sélectionné
    if (fichier) {
        const lire = new FileReader();
        lire.onload = function (e) {
            const content = e.target.result;
            affichage_colonnes(content); // Appeler affichage avec le contenu du fichier
        };
        lire.readAsText(fichier);
    } else {
        console.error("No files selected");
    }
}

function detectDelimiter(content) {
       const delimiters = [",", ";", "\t"]; // Liste des délimiteurs possibles
       let detected = ",";
       let maxCols = 0;

       delimiters.forEach(delim => {
           const numCols = content.split("\n")[0].split(delim).length;
           if (numCols > maxCols) {
               maxCols = numCols;
               detected = delim;
           }
       });
       return detected;
}

function normalizeLineEndings(content) {
    // Remplace d'abord \r\n (Windows) en \n, puis remplace tous les \r en \n
    console.log("Sucess repalce!");
    return content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function isCSVFormat(content) {
    const normalizedContent = normalizeLineEndings(content); // Normaliser le contenu
    const delimiter = detectDelimiter(normalizedContent);
    const lines = content.trim()
        .split("\n")
        .filter(line => line.trim() !== ""); // Retirer les lignes vides

    const nbColumns = lines[0].split(delimiter).length; // Compter le nombre de colonnes de la première ligne

    // Vérifier chaque ligne pour s'assurer qu'elles ont le même nombre de colonnes
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].split(delimiter).length !== nbColumns) {
            return false; // Retourner faux si une ligne a un nombre de colonnes différent
        }
    }

    return true; // Si toutes les lignes ont le même nombre de colonnes, c'est un CSV valide
}

// Fonction pour afficher le contenu sous forme de tableau
function affichage_colonnes(contenu) {
        if (!isCSVFormat(contenu)) {
            alert("This is not a valid CSV file!");
            return;
        }
        const normalizedContent = normalizeLineEndings(contenu); // Normaliser le contenu
        const delimiter = detectDelimiter(normalizedContent);
        const lines = normalizedContent.split("\n"); // Utiliser uniquement \n
       console.log(contenu);
       console.log(lines);
       if (lines.length === 0) return;
       rows = [];

       for (let i = 0; i < lines.length; i++) {
           let lignes_i = lines[i].split(delimiter); // Utiliser le bon délimiteur
           rows.push(lignes_i);
       }

    delete_delimiter();
    retirerLignesVides();

    let htmlContent = "";

    // Section pour afficher ou modifier le nom du profil
    htmlContent += `
        <div id="profileContainer" style="margin-bottom: 20px; text-align: center;">
            <h2 id="profileTitle" style="font-size: 22px; font-weight: bold; color: #007bff; margin-bottom: 10px;">
                Profile Name : <span id="displayProfileName" style="color: #FF4500;"></span>
            </h2>
            <input type="text" id="profileName" placeholder="Enter a profile name"
                style="padding: 10px; font-size: 16px; border: 1px solid #007bff; border-radius: 10px; width: 50%;"
                oninput="updateProfileDisplay(this)">
        </div>
    `;

    // Génération des cases à cocher pour sélectionner les colonnes
    htmlContent += `<fieldset><legend>List colonnes</legend>
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px;">`;

    for (let j = 0; j < rows[0].length; j++) {
        // Générer chaque colonne
        htmlContent += `
        <div>
            <input type="checkbox" class="colSelect" id="${j}" value="${j}">
            <label for="${j}">${rows[0][j]}</label>
        </div>`;
    }

    htmlContent += `</div></fieldset>`;

    // Ajouter les boutons
    htmlContent += `
        <button onclick="connect_to_profil()">Display profils</button>
        <button onclick="Similarity()">Similarity</button>
        <button onclick="Virtual_sort()">Virtual</button>
    `;

    document.getElementById("table").innerHTML = htmlContent;
}

// Fonction pour mettre à jour dynamiquement l'affichage du "Nom du profil"
function updateProfileDisplay(input) {
    const displayProfileName = document.getElementById("displayProfileName");
    displayProfileName.textContent = input.value.trim() || "(Aucun)";
}
function delete_delimiter() {
    if (rows.length === 0) {
        console.error("No data available for processing.");
        return;
    }

    // Parcourir chaque ligne de données
    for (let i = 0; i < rows.length; i++) {
        for (let j = 0; j < rows[i].length; j++) {
            // Supprimer les guillemets simples ou doubles autour de chaque cellule
            rows[i][j] = rows[i][j].trim().replace(/^['"]|['"]$/g, '');
        }
    }

    console.log("Delimiters successfully removed!");
    console.log(rows); // Affiche les données nettoyées
}
function retirerLignesVides() {
    if (rows.length === 0) {
        console.error("No data available for processing.");
        return;
    }

     rows = rows.filter(row => {
        // Vérifier si au moins une des colonnes dans une ligne n'est pas vide
        return row.some(value => value.trim() !== "");
    });

    console.log("Empty lines removed. Here is the updated data:");
    console.log(rows);
}

// Variables globales pour suivre les fenêtres ouvertes
let affichageWindow = null;
let similarityWindow = null;

// Fonction afficherTableau mise à jour
function connect_to_profil() {
    let selectedCols = Array.from(document.querySelectorAll('input.colSelect:checked')).map(input => parseInt(input.value));
    const profileNameInput = document.getElementById('profileName');
    const profileName = profileNameInput.value.trim();

    if (!profileName || selectedCols.length === 0) {
        alert("Please enter a profile name and select at least one column!");
        return;
    }

    // Récupérer les profils actuels depuis le stockage local
    let profiles = JSON.parse(localStorage.getItem('profiles') || "{}");

    if( profiles[profileName] ) {
        alert("Profile exists. Please choose another profile name!");
        return;
    }

    // Créer un objet pour stocker les colonnes sélectionnées et leurs valeurs
    let selectedData = {};

    // Parcourir les index des colonnes sélectionnées et les remplir avec leurs données
    selectedCols.forEach(colIndex => {
        selectedData[rows[0][colIndex]] = [];
        for (let i = 1; i < rows.length; i++) { // Ignorer la première ligne (en-têtes)
            if (rows[i] && rows[i][colIndex] !== undefined) {
                selectedData[rows[0][colIndex]].push(rows[i][colIndex]);
            }
        }
    });

    // Associer le profil au tableau des colonnes sélectionnées
    profiles[profileName] = selectedData;
    // Sauvegarder dans le stockage local
    localStorage.setItem('profiles', JSON.stringify(profiles));
    console.log(profiles);

    // Stocker les colonnes et les lignes dans localStorage
    localStorage.setItem('selectedColumns', JSON.stringify(selectedCols));
    localStorage.setItem('rows', JSON.stringify(rows));
    localStorage.setItem('profileName', document.getElementById('profileName').value);

    // Vérifier si la fenêtre `affichage.html` est déjà ouverte
    if (affichageWindow && !affichageWindow.closed) {
        // Si déjà ouverte, envoyer une commande à la fenêtre pour qu'elle mette à jour son contenu
        affichageWindow.postMessage({ action: 'updateTable' }, '*');
        affichageWindow.focus(); // Ramener au premier plan
    } else {
        // Sinon, ouvrir une nouvelle fenêtre et conserver la référence
        affichageWindow = window.open('affichage.html', '_blank');
    }

}

// Fonction Similarity mise à jour
function Similarity() {
    let selectedCols = Array.from(document.querySelectorAll('input.colSelect:checked')).map(input => parseInt(input.value));
    console.log(selectedCols);

    if (selectedCols.length === 0) {
        alert("Please select at least one column!");
        return;
    }

    // Stocker les colonnes et les lignes dans localStorage
    localStorage.setItem('selectedColumns', JSON.stringify(selectedCols));
    localStorage.setItem('rows', JSON.stringify(rows));

    //Vérification et gestion de la fenêtre `similarity.html`
    if (similarityWindow && !similarityWindow.closed) {
        // Si la fenêtre existe et est ouverte, envoyer une commande pour mettre à jour
        similarityWindow.postMessage({ action: 'updateTable' }, '*');
        similarityWindow.focus(); // Ramener au premier plan
    } else {
        // Sinon, ouvrir une nouvelle fenêtre et conserver la référence
        similarityWindow = window.open('similarity.html', '_blank');

        // Attendre que la fenêtre soit prête (au cas où le script n'est pas chargé immédiatement)
        similarityWindow.onload = () => {
            similarityWindow.postMessage({ action: 'updateTable' }, '*');
        };
    }

}

function Virtual_sort() {

    let selectedCols = Array.from(document.querySelectorAll('input.colSelect:checked')).map(input => parseInt(input.value));

    if (selectedCols.length === 0) {
        alert("Please select at least one column!");
        return;
    }

    // Stocker les colonnes et les lignes dans localStorage
    localStorage.setItem('selectedColumns', JSON.stringify(selectedCols));
    localStorage.setItem('rows', JSON.stringify(rows));
    //Vérification et gestion de la fenêtre `virtual.html`
    if (similarityWindow && !similarityWindow.closed) {
        // Si la fenêtre existe et est ouverte, envoyer une commande pour mettre à jour
        similarityWindow.postMessage({ action: 'updateTable' }, '*');
        similarityWindow.focus(); // Ramener au premier plan
    } else {
        // Sinon, ouvrir une nouvelle fenêtre et conserver la référence
        similarityWindow = window.open('virtual.html', '_blank');

        // Attendre que la fenêtre soit prête (au cas où le script n'est pas chargé immédiatement)
        similarityWindow.onload = () => {
            similarityWindow.postMessage({ action: 'updateTable' }, '*');
        };
    }
}


