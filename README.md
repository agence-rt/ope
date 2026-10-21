# AGOA OPE

Application Windows (Electron) de consultation et de création des opérations de l'agence, sur la base Ragic (OPERATIONS et BASE DE DONNÉES).
Installée et mise à jour par l'[AGOA Launcher](https://github.com/agence-rt/agoa) dans `C:\AGOA\ope`.

## Version 0.2 (connecté à Ragic)
- Recherche d'immeuble → opérations → fiche avec avancement des phases
- Création d'immeuble, d'opération et modification des honoraires
- Lecture et création dans Ragic (feuilles OPERATIONS et Immeubles du compte agoa) ; clé reprise du bouton CONNEXIONS du launcher, ou saisie à la main

## Développement
    npm install
    npm start

## Publier une version
Augmenter `version` dans `package.json` et pousser sur `main` : GitHub Actions construit
`AGOA-OPE-Setup-x.y.z.exe` et crée la Release `vx.y.z`. Le launcher la propose ensuite à l'installation / mise à jour.
