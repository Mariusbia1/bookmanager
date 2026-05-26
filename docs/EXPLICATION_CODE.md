# Guide complet du code - Bookmark Manager

Ce document explique **pas a pas** le code de l'application pour que tu puisses la comprendre, la modifier, puis la refaire toi-meme.

---

## 1) Vue d'ensemble de l'architecture

L'application suit une architecture React classique :

- **UI (composants)** : `src/components/`
- **Pages (routes)** : `src/pages/`
- **Etat global** : `src/context/BookmarksContext.tsx`
- **Donnees initiales** : `src/data/bookmarks.js`
- **Helpers utilitaires** : `src/utils/`
- **Types TypeScript** : `src/types/bookmark.ts`
- **Point d'entree / routing** : `src/App.tsx` et `src/main.tsx`

Idee cle : toutes les actions metier (ajouter, modifier, archiver, trier, etc.) sont centralisees dans le Context. Les composants affichent simplement les donnees et declenchent ces actions.

---

## 2) Flux global des donnees

1. Au demarrage, `BookmarksProvider` charge les donnees :
   - soit depuis `localStorage`,
   - soit depuis `seedBookmarks` + IDs issus de l'API `jsonplaceholder`.
2. Le provider expose l'etat et les fonctions via `useBookmarks()`.
3. Les pages (`HomePage`, `ArchivedPage`, `DetailPage`) lisent des listes deja filtrees/tries depuis le contexte.
4. Quand une action est faite (ex: archiver), le contexte met a jour l'etat React.
5. Un `useEffect` persiste automatiquement dans `localStorage`.

---

## 3) Les types (base de securite TypeScript)

Fichier : `src/types/bookmark.ts`

- `Bookmark` definit la structure complete d'un favori :
  - `id`, `title`, `url`, `domain`, `description`
  - `tags`, `favicon`
  - `views`, `lastVisited`, `addedAt`
  - `pinned`, `archived`
- `SortOption` limite les tris possibles (`added-desc`, `visited-desc`, `views-desc`).
- `UserProfile` contient le nom + avatar.

Pourquoi c'est important : ces types evitent les erreurs de forme de donnees dans toute l'app.

---

## 4) Donnees initiales

Fichier : `src/data/bookmarks.js`

- Contient `seedBookmarks` (9 favoris inspirés des maquettes).
- Les objets n'ont pas d'`id` fixe dans ce fichier.
- L'`id` est genere au premier chargement dans le contexte avec :
  - les IDs users de `jsonplaceholder` si dispo,
  - sinon un fallback local.
- Les favicons utilisent l'URL Google S2 (`google.com/s2/favicons`).

---

## 5) Le coeur de l'app : `BookmarksContext`

Fichier : `src/context/BookmarksContext.tsx`

### 5.1 Etats principaux

- `bookmarks` : tableau de tous les favoris.
- `searchQuery` : texte de recherche.
- `selectedTags` : tags coches.
- `sortBy` : mode de tri.
- `theme` : clair/sombre.
- `sidebarOpen` : ouvert/ferme sur mobile.
- `bookmarkModalOpen` + `bookmarkDraft` : modal ajouter/modifier.
- `toastMessage` : message temporaire (copie URL, erreur, etc.).

### 5.2 Chargement initial

Le `useEffect` de bootstrap :

- lit `localStorage`,
- appelle `https://jsonplaceholder.typicode.com/users`,
- construit les favoris de depart si besoin,
- initialise `userProfile` (avatar via `pravatar`),
- gere un fallback propre si l'API echoue.

### 5.3 Persistance

Un autre `useEffect` enregistre `bookmarks` + `theme` dans `localStorage` des que l'etat change (apres init).

### 5.4 Fonctions metier exposees

- `addBookmark(...)`
- `updateBookmark(id, patch)`
- `archiveBookmark(id)` / `unarchiveBookmark(id)`
- `togglePinned(id)`
- `visitBookmark(id)` : incremente les vues + met `lastVisited`, puis ouvre l'URL.
- `copyUrl(id)` : copie via `navigator.clipboard` et affiche un toast.
- `toggleTag(tag)` / `resetTagFilters()`
- `openAddBookmarkModal()` / `openEditBookmarkModal(bookmark)` / `closeBookmarkModal()`

### 5.5 Listes derivees (useMemo)

- `filteredHome` : non archives + recherche + tags + tri.
- `filteredArchived` : archives + recherche + tags + tri.
- `tagStats` : compte des tags pour la sidebar.

Ces calculs sont memoises pour eviter des recalculs inutiles a chaque render.

---

## 6) Utilitaires

### `src/utils/domain.ts`

- `hostnameFromUrl(url)` : normalise/extrait le domaine.
- `faviconForDomain(domain)` : construit l'URL de favicon.

### `src/utils/dates.ts`

- `formatShort(iso)` : ex. `23 sept.` ou `Jamais`.
- `formatLong(iso)` : ex. `23 septembre 2025`.

### `src/utils/filterBookmarks.ts`

- `matchesTagFilters(bookmark, selectedTags)` :
  - retourne `true` si aucun tag selectionne,
  - sinon vrai si au moins un tag correspond.

---

## 7) Routing et structure ecran

Fichier : `src/App.tsx`

- `BookmarksProvider` enveloppe toute l'app.
- `BrowserRouter` gere les routes.
- `GlobalBookmarkModal` est place globalement (ouverture depuis n'importe quelle page).
- Routes :
  - `/` -> `HomePage`
  - `/archived` -> `ArchivedPage`
  - `/bookmark/:id` -> `DetailPage`
  - `*` -> redirection vers `/`

---

## 8) Le layout principal

Fichier : `src/components/AppLayout.tsx`

- Affiche `Sidebar` (fixe desktop, off-canvas mobile).
- Affiche `AppHeader` (recherche, theme, add, avatar).
- Affiche un loader tant que `loading` est vrai.
- Affiche `Outlet` pour injecter la page courante.
- Affiche un toast en bas a droite si `toastMessage` existe.

---

## 9) Header

Fichier : `src/components/AppHeader.tsx`

Fonctions UI :

- Bouton hamburger (mobile) -> ouvre la sidebar.
- Barre de recherche connectee a `searchQuery`.
- Toggle theme (soleil/lune) -> `toggleTheme()`.
- Bouton ajouter (version desktop + version mobile).
- Avatar utilisateur depuis `userProfile`.

Accessibilite :

- labels (`aria-label`, `sr-only`) et styles `focus-visible`.

---

## 10) Sidebar

Fichier : `src/components/Sidebar.tsx`

- Logo + navigation (`NavLink`) :
  - Accueil
  - Archives
- Section Tags avec checkboxes + compteurs.
- Bouton "Reinitialiser".
- En mobile :
  - la sidebar glisse depuis la gauche,
  - overlay sombre cliquable pour fermer.
- `useEffect` ferme la sidebar apres changement de route.

---

## 11) Cartes de favoris

Fichier : `src/components/BookmarkCard.tsx`

Chaque carte contient :

- favicon, titre, domaine,
- description,
- badges de tags,
- footer (vues, derniere visite, date ajout, pin),
- menu actions (dropdown DaisyUI) :
  - Modifier,
  - Archiver/Restaurer,
  - Copier URL,
  - Visiter.

Le titre est un lien vers la page detail : `/bookmark/:id`.

---

## 12) Modal d'ajout/modification

Fichier : `src/components/BookmarkFormModal.tsx`

Comportement :

- Meme modal pour creation et edition.
- Champs : titre, URL, description, tags.
- `normalizeUrl()` ajoute `https://` si necessaire.
- `parseTags()` transforme une chaine CSV en tableau.
- En mode edition -> `updateBookmark`.
- En mode creation -> `addBookmark`.

Point important d'architecture :

- Le composant interne `BookmarkFormInner` recoit une `key` dynamique.
- Cette `key` force un remount propre quand on passe de "add" a "edit" (ou inversement), ce qui simplifie la synchronisation des champs.

---

## 13) Modal global

Fichier : `src/components/GlobalBookmarkModal.tsx`

Tres simple : il lit `bookmarkModalOpen`, `bookmarkDraft`, `closeBookmarkModal` depuis le contexte et monte `BookmarkFormModal`.

Objectif : pouvoir ouvrir le modal depuis header, card ou page detail sans duplication.

---

## 14) Tri

Fichier : `src/components/SortMenu.tsx`

- Dropdown avec 3 options :
  - Recemment ajoutes
  - Recemment visites
  - Les plus visites
- Met a jour `sortBy` dans le contexte.
- Le vrai tri est effectue centralement par `sortList(...)` dans le provider.

---

## 15) Pages

### `src/pages/HomePage.tsx`

- Affiche titre + `SortMenu`.
- Affiche `filteredHome`.
- Grille responsive :
  - 1 colonne mobile
  - 2 colonnes tablette
  - 3 colonnes desktop large

### `src/pages/ArchivedPage.tsx`

- Meme logique mais avec `filteredArchived`.

### `src/pages/DetailPage.tsx`

- Lit `id` via `useParams`.
- Recupere le favori via `getBookmarkById`.
- Si introuvable -> redirection `/`.
- Affiche toutes les infos detaillees.
- Boutons d'actions : visiter, copier URL, modifier, archiver/restaurer, pin.

---

## 16) Styles, Tailwind et DaisyUI

### `src/index.css`

- `@import "tailwindcss";`
- `@plugin "daisyui";`
- Variables de theme personnalisees (`@theme`) selon ta palette.
- Utility `custom-scrollbar`.

### `postcss.config.js`

- Active le plugin `@tailwindcss/postcss` (necessaire avec la config actuelle Vite/Tailwind).

### `vite.config.ts`

- Plugin React uniquement (tailwind passe par PostCSS ici).

---

## 17) Accessibilite et UX

L'app integre deja plusieurs bonnes pratiques :

- `aria-label` sur boutons icones,
- labels associes aux champs,
- styles `focus-visible`,
- feedback utilisateur via toast,
- loader de chargement,
- fallbacks en cas d'erreur reseau.

---

## 18) Comment lire le code efficacement (methode apprentissage)

Je te conseille cet ordre concret :

1. `src/types/bookmark.ts` (modele de donnees)
2. `src/data/bookmarks.js` (exemples reels)
3. `src/context/BookmarksContext.tsx` (logique metier)
4. `src/App.tsx` + `src/components/AppLayout.tsx` (structure)
5. `src/components/*` (UI)
6. `src/pages/*` (assemblage final)

Technique :

- Lis une fonction du contexte.
- Repere ou elle est appelee dans les composants.
- Clique dans l'app, observe l'effet.
- Reviens au code pour faire le lien mental.

---

## 19) Mini glossaire React utilise ici

- **Context API** : partage d'etat global sans prop drilling.
- **useMemo** : memoise un calcul derive.
- **useCallback** : memoise une fonction pour stabiliser les references.
- **useEffect** : synchronisation avec systemes externes (API, localStorage, DOM).
- **Controlled inputs** : valeur liee a un state React (`value` + `onChange`).

---

## 20) Exercices pratiques pour progresser

1. Ajouter une action **Supprimer** (soft delete).
2. Ajouter un filtre par **domaine**.
3. Ajouter validation URL plus stricte (message erreur visuel).
4. Ajouter "desarchiver tous".
5. Ajouter tests unitaires sur :
   - `matchesTagFilters`
   - `hostnameFromUrl`
   - `sortList` (a extraire dans un util pour le tester plus facilement).

---

Si tu veux, je peux maintenant te faire un **deuxieme fichier ultra pedagogique**, ligne par ligne, uniquement sur `BookmarksContext.tsx` (le fichier le plus important), avec schemas mentaux et pseudo-code.
