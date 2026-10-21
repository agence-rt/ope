# AGOA OPE

Application Windows (Electron) de consultation et de création des opérations de l'agence, sur la base Ragic (bases OPERATIONS et BASE DE DONNÉES).

## Version 0.1 (test)
- Recherche d'immeuble → opérations → fiche avec avancement des phases
- Création d'immeuble, d'opération et de proposition d'honoraires
- Mode démo sans clé API ; connexion Ragic via le bouton en haut à droite (non testée)

## Développement
    npm install
    npm start

## Publier une version (mise à jour automatique)
1. Changer `version` dans `package.json`
2. `git tag v0.1.1 && git push --tags`
3. GitHub Actions construit l'installateur et crée la release ; l'application installée se met à jour seule au démarrage.

À faire : icône `build/icon.ico` (carré rouge agence + « OPE » en gras, selon la charte AGOA).
