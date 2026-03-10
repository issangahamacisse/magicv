

## Plan : Signature déplaçable + Date de mise à jour (optionnelles)

### Modifications des types (`src/types/cv.ts`)

- Ajouter à `PersonalInfo` : `signatureUrl?: string`
- Ajouter à `CVTheme` :
  - `showLastUpdated?: boolean`
  - `showSignature?: boolean`
  - `signatureColor?: string` (couleur du trait, défaut `#000000`)
  - `signaturePosition?: { x: number; y: number }` (position relative en % dans le footer, pour le drag)

### Nouveau composant : `SignaturePad.tsx`

- Canvas HTML5 pour dessiner une signature (souris + tactile)
- Sélecteur de couleur pour changer la couleur du trait
- Boutons Effacer / Valider
- Sauvegarde en data URL dans `personalInfo.signatureUrl`

### Éditeur — Formulaire personnel (`PersonalInfoForm.tsx`)

- Ajouter le `SignaturePad` en bas du formulaire d'infos personnelles

### Éditeur — Options thème (`ThemeSelector.tsx`)

- Toggle "Afficher la date de mise à jour"
- Toggle "Afficher la signature"
- Sélecteur de couleur pour la signature (visible si toggle signature activé)

### Composant footer CV (`TemplateSections.tsx`)

- Nouveau composant `CVFooter` :
  - Date "Mis à jour le …" (si `showLastUpdated`)
  - Image signature draggable (si `showSignature` + `signatureUrl` existe)
  - La signature est repositionnable par drag & drop dans la zone footer, position stockée dans `signaturePosition`

### Intégration dans les 10 templates

- Ajouter `<CVFooter />` en bas de chaque template, juste avant la fermeture du conteneur principal (utilisant le pattern `mt-auto` déjà en place)

### Contexte (`CVContext.tsx`)

- S'assurer que les nouveaux champs sont inclus dans la sauvegarde/chargement

