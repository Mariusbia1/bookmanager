# Cours guide : comprendre `BookmarksContext.tsx` pas a pas

Ce document est fait pour apprendre. On decoupe le fichier en blocs logiques, puis on explique :

1. ce que fait le bloc,
2. pourquoi il existe,
3. comment React l'execute en vrai.

---

## 0) Mission du fichier

`src/context/BookmarksContext.tsx` est le **cerveau** de l'application.

Il centralise :

- l'etat global (favoris, recherche, filtres, theme, modal),
- les actions metier (ajouter, modifier, archiver, etc.),
- la persistance `localStorage`,
- les donnees derivees (listes filtrees/tries).

Tous les composants UI viennent piocher ici via `useBookmarks()`.

---

## 1) Imports : ce qu'on utilise

Tu vois des imports React :

- `createContext` : creer un contexte global.
- `useState` : stocker l'etat.
- `useEffect` : synchroniser avec API/DOM/localStorage.
- `useMemo` : calculer efficacement des valeurs derivees.
- `useCallback` : stabiliser les fonctions.
- `useRef` : garder une reference mutable (sans re-render).

Puis des imports projet :

- `seedBookmarks` (donnees initiales),
- types (`Bookmark`, `SortOption`, `UserProfile`),
- utils (`hostnameFromUrl`, `faviconForDomain`, `matchesTagFilters`).

---

## 2) Constantes et types internes

### `STORAGE_KEY`

```ts
const STORAGE_KEY = 'bookmark-manager-v1'
```

Cle unique pour lire/ecrire dans `localStorage`.

### `PersistedPayload`

Type de ce qu'on sauvegarde :

- `bookmarks`
- `theme`

### `JsonUser`

Type des objets retournes par l'API `jsonplaceholder`.

---

## 3) Fonctions utilitaires locales

### `loadPersisted()`

Pseudo-code :

```txt
essayer lire localStorage
si vide => null
sinon parser JSON et retourner
si erreur JSON => null
```

Pourquoi : eviter de casser l'app si la valeur stockee est invalide.

### `savePersisted(payload)`

Sauvegarde directe dans `localStorage`.

### `bookmarkFromSeed(seed, userId, index)`

Construit un bookmark complet en ajoutant un `id`.

---

## 4) Tri centralise : `sortList(list, sortBy)`

3 modes :

- `added-desc` : plus recents ajoutes d'abord.
- `visited-desc` : plus recemment visites d'abord (les `null` tombent en bas).
- `views-desc` : plus vus d'abord.

Important :

- On clone d'abord (`const next = [...list]`) pour ne pas muter l'array original.

---

## 5) Type du contexte : contrat global

`type BookmarksContextValue = { ... }`

C'est la "fiche technique" de ce que le contexte expose :

- etats (`bookmarks`, `searchQuery`, etc.),
- setters (`setSearchQuery`, `setSortBy`, etc.),
- actions metier (`addBookmark`, `archiveBookmark`, ...),
- listes derivees (`filteredHome`, `filteredArchived`, `tagStats`).

Quand tu lis ce type, tu comprends deja quasi toute l'app.

---

## 6) Creation du contexte

```ts
const BookmarksContext = createContext<BookmarksContextValue | null>(null)
```

Au depart, valeur `null`.  
Ensuite `BookmarksProvider` va fournir la vraie valeur.

---

## 7) Etats React (useState)

Dans `BookmarksProvider`, chaque `useState` correspond a une partie de l'application :

- `bookmarks` : source de verite des favoris.
- `loading` / `initialized` : gestion du bootstrap initial.
- `searchQuery` : recherche en direct.
- `selectedTags` : tags coches.
- `sortBy` : tri courant.
- `theme` : clair/sombre.
- `sidebarOpen` : sidebar mobile.
- `userProfile` : avatar + nom.
- `toastMessage` : feedback utilisateur.
- `bookmarkModalOpen` + `bookmarkDraft` : modal d'ajout/edition.

---

## 8) Le `useRef` `bookmarksRef`

Tu as :

```ts
const bookmarksRef = useRef(bookmarks)
useEffect(() => {
  bookmarksRef.current = bookmarks
})
```

Pourquoi ?

- certaines fonctions async (comme `copyUrl`) ont besoin de la **valeur la plus recente** des bookmarks,
- sans forcer de dependances lourdes dans `useCallback`.

Donc : `ref` = pointeur toujours a jour.

---

## 9) Bootstrap initial (useEffect le plus important)

Bloc :

- lit localStorage,
- tente les appels API (`users` + `user/1`),
- choisit entre persisted ou seed,
- assigne profil utilisateur,
- gere fallback si l'API echoue.

### Cycle d'execution concret

1. composant monte,
2. `bootstrap()` se lance,
3. pendant ce temps `loading=true` -> UI affiche spinner,
4. donnees chargees -> `setBookmarks(...)`,
5. `setLoading(false)`, `setInitialized(true)`,
6. UI passe sur les pages normales.

### `cancelled` : protection anti fuite

Si composant unmount avant la fin de la requete, on evite les `setState` tardifs.

---

## 10) Effet theme

```ts
root.classList.toggle('dark', theme === 'dark')
root.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light')
```

Double compatibilite :

- classe `dark` pour Tailwind,
- attribut `data-theme` pour DaisyUI.

---

## 11) Effet de persistance

Condition :

- ne sauvegarde que si `initialized` et non `loading`.

Pourquoi :

- eviter d'ecraser `localStorage` trop tot avec un etat vide avant bootstrap.

---

## 12) Actions UI simples

### `toggleTheme()`

Inverse light/dark.

### `toggleTag(tag)`

Logique "add/remove" dans un tableau.

### `resetTagFilters()`

Vide `selectedTags`.

### Gestion modal

- `openAddBookmarkModal()` : draft = null.
- `openEditBookmarkModal(bookmark)` : draft = bookmark.
- `closeBookmarkModal()` : ferme et reset.

---

## 13) CRUD favoris

### `getBookmarkById(id)`

Recherche simple dans `bookmarks`.

### `addBookmark(input)`

1. normalise domaine,
2. cree id (`bm-${Date.now()}`),
3. complete les champs par defaut (views, archived, favicon),
4. ajoute au debut de liste (`[bookmark, ...prev]`).

### `updateBookmark(id, patch)`

Map sur la liste :

- si ID matche -> fusionne les champs.
- si URL change -> recalcule domaine + favicon.

### `archiveBookmark` / `unarchiveBookmark`

Basculent `archived`.

### `togglePinned`

Inverse `pinned`.

---

## 14) Actions "avec effets de bord"

### `visitBookmark(id)`

Pattern interessant :

1. met a jour l'etat (`views + 1`, `lastVisited = now`),
2. puis ouvre la page (`window.open`) dans une microtask.

Pourquoi microtask ?

- separer proprement la mise a jour d'etat de l'ouverture de fenetre.

### `copyUrl(id)`

1. trouve le bookmark dans `bookmarksRef.current`,
2. tente `navigator.clipboard.writeText`,
3. affiche toast succes/erreur,
4. retire toast apres 2.5s.

---

## 15) Donnees derivees (useMemo)

### `tagStats`

Compteur global de tags + tri alphabetique FR.

### `filteredHome`

Pipeline :

1. garder non archives,
2. appliquer recherche titre,
3. appliquer filtre tags,
4. appliquer tri.

### `filteredArchived`

Meme pipeline mais avec `archived === true`.

---

## 16) Assemblage final de la valeur contexte

`const value = useMemo(() => ({ ... }), [deps])`

Pourquoi `useMemo` ici :

- evite de recreer l'objet `value` inutilement,
- limite les rerenders descendants.

Puis :

```tsx
<BookmarksContext.Provider value={value}>{children}</BookmarksContext.Provider>
```

---

## 17) Hook d'acces : `useBookmarks()`

```ts
export function useBookmarks() {
  const ctx = useContext(BookmarksContext)
  if (!ctx) throw new Error(...)
  return ctx
}
```

Avantages :

- API simple pour tous les composants,
- erreur claire si utilise hors provider.

---

## 18) Scenario complet : "Je clique sur Archiver"

1. `BookmarkCard` appelle `archiveBookmark(id)`.
2. `setBookmarks` met `archived: true` sur ce favori.
3. React rerender.
4. `filteredHome` le retire automatiquement.
5. `filteredArchived` l'inclut automatiquement.
6. Effet persistance sauvegarde dans `localStorage`.

Tu vois : une seule action metier, tout le reste suit grace aux derivees.

---

## 19) Scenario complet : "Je tape dans la recherche"

1. Input header -> `setSearchQuery("rea")`.
2. `filteredHome`/`filteredArchived` recalcules.
3. Les pages affichent seulement les titres qui matchent.
4. Aucun appel API, tout est local et instantane.

---

## 20) Pourquoi cette architecture est solide

- **Source unique de verite** : `bookmarks`.
- **Actions centralisees** : moins de bugs de logique.
- **UI declarative** : les pages affichent juste les derivees.
- **Persistance automatique** : pas de duplication de code.
- **Scalable** : facile d'ajouter favoris partages, suppression, etc.

---

## 21) Comment t'entrainer dessus (important)

Exercices progressifs :

1. Ajouter action `deleteBookmark`.
2. Ajouter filtre "uniquement epingles".
3. Ajouter tri "ordre alphabetique".
4. Ajouter `updatedAt` lors des edits.
5. Ajouter undo simple (historique local).

Regle d'or :

- implemente d'abord dans le Context,
- ensuite branche les boutons UI.

---

## 22) Resume mental en une phrase

`BookmarksContext.tsx` transforme des evenements UI (clics/saisie) en transitions d'etat coherentes, puis laisse React recalculer automatiquement les listes affichees.

