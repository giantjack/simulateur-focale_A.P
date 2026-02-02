# Simulateur Focale

## Description

Simulateur interactif d'**équivalence focale et angle de champ** permettant aux photographes de comprendre comment la taille du capteur et la longueur focale affectent le champ de vision et les équivalences plein format.

## Stack Technique

- **Framework** : React 18 + TypeScript
- **UI** : Chakra UI 2.8
- **Build** : Vite 5
- **Animations** : Framer Motion

## Structure du Projet

```
src/
├── App.tsx      # Composant principal (toute la logique)
├── main.tsx     # Point d'entrée React
└── index.css    # Styles globaux
```

## Fonctionnalités

- 5 types de capteurs avec crop factor :
  - Full Frame (×1)
  - APS-C Canon (×1.6)
  - APS-C autres (×1.5)
  - Micro 4/3 (×2)
  - 1 pouce (×2.7)
- Focales : 7-600mm (échelle logarithmique)
- Visualisation du zoom sur une photo paysage
- Schéma SVG de l'angle de champ
- Tableau d'équivalences rapides cliquables
- Classification automatique du type d'objectif

## Commandes

```bash
npm install    # Installer les dépendances
npm run dev    # Lancer en développement
npm run build  # Build de production
```

## Formules Utilisées

- **Équivalent plein format** : `focale × cropFactor`
- **Angle de vue (diagonal)** : `2 × atan(diagonal / (2 × focale))`
- **Zoom scale** : relatif à focale de référence (18mm FF)

## Interface

- Layout 2 colonnes : Visualisations (flex:1) | Contrôles (45%)
- Photo avec zoom visuel basé sur la focale
- Slider focale (échelle logarithmique)
- Sélecteur de capteur
- Schéma SVG angle de vue avec calcul trigonométrique
- Badges informatifs (focale réelle, crop, équivalent FF, angle, type)

## Approche Source de Vérité

L'**équivalent FF est la source de vérité**, la focale réelle est dérivée. Cela évite les erreurs d'arrondi cumulées lors des conversions.

## Charte Graphique

- Couleur primaire : `#FB9936` (orange)
- Couleur secondaire : `#212E40` (bleu foncé)

## Notes de Développement

- Image exemple hébergée sur apprendre-la-photo.fr
- Zoom appliqué via `transform: scale()` avec transition smooth
- Zone grisée sur le slider pour les focales impossibles selon le capteur
- Référence focale fixe : 18mm (équivalent FF)
- Calculs trigonométriques pour l'angle de vue
