# AGOA OPE

Application Windows (Electron) de consultation et de création des opérations de l'agence, sur la base Ragic (OPERATIONS et BASE DE DONNÉES).
Installée et mise à jour par l'[AGOA Launcher](https://github.com/agence-rt/agoa) dans `C:\AGOA\ope`.

## Version 0.1 (test)
- Recherche d'immeuble → opérations → fiche avec avancement des phases
- Création d'immeuble, d'opération et de proposition d'honoraires
- Clé Ragic reprise du bouton CONNEXIONS du launcher ; sans clé : mode démo (rien n'est envoyé à Ragic)

## Développement
    npm install
    npm start

## Publier une version
Augmenter `version` dans `package.json` et pousser sur `main` : GitHub Actions construit
`AGOA-OPE-Setup-x.y.z.exe` et crée la Release `vx.y.z`. Le launcher la propose ensuite à l'installation / mise à jour.
