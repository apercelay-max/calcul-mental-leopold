# Calcul mental Léopold

Application d'entraînement au calcul mental pour Léopold (5ème), basée sur les
techniques du guide *"Le Calcul Mental en Classe de 5ème : Techniques et
Stratégies pour Progresser"*.

## Comment jouer

Ouvre `index.html` dans un navigateur (ou via le lien GitHub Pages une fois
publié). Chaque série compte 10 questions, avec score et chronomètre.

## Contenu (10 niveaux, du plus facile au plus difficile)

1. Tables de multiplication (jusqu'à 12) et compléments à 10/100/1000
2. Multiplier et diviser par 10, 100, 1000
3. Addition et soustraction astucieuses (regroupement, compensation)
4. Multiplier par 4, 5, 0,5 et 0,1
5. Diviser par 4 et par 5
6. Multiplication à deux chiffres (distributivité)
7. Nombres relatifs (addition, soustraction)
8. Pourcentages (50 %, 25 %, 10 %, 20 %)
9. Fractions (simplification, fraction d'une quantité)
10. Révision générale (mélange de tout)

## Progression

Un niveau se débloque quand les 3 dernières séries jouées à ce niveau ont une
moyenne de réussite ≥ 80 %, avec un maximum d'**un niveau débloqué par jour**.
Ce verrou est volontaire : il force une pratique régulière étalée sur
plusieurs semaines plutôt qu'un blitz en une seule session, conformément aux
conseils du guide (5 à 10 minutes par jour valent mieux qu'une heure le
week-end).

La progression est sauvegardée dans le navigateur (`localStorage`) — elle est
donc propre à chaque appareil/navigateur utilisé.

## Stack technique

HTML/CSS/JavaScript statique, sans dépendance ni build. Fichiers :

- `index.html` — structure des 3 écrans (accueil, série, résultats)
- `css/style.css` — mise en page
- `js/curriculum.js` — les 10 niveaux et leurs générateurs de questions
- `js/storage.js` — sauvegarde de la progression et logique de déblocage
- `js/app.js` — logique d'interface

## Déploiement (GitHub Pages)

Une fois la branche fusionnée sur `main` : Settings → Pages → Source =
"Deploy from a branch", branche `main`, dossier `/ (root)`. L'app sera alors
accessible via `https://apercelay-max.github.io/calcul-mental-leopold/`.
