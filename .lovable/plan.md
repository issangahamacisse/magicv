

# Plan d'implémentation : Système de filigrane et accès admin

## Contexte

Le système doit fonctionner ainsi :
- **CV créés manuellement** : Téléchargement gratuit avec filigrane "Créé sur MagicCV"
- **CV importés via IA** : Paiement obligatoire de 1000F (aucune option gratuite)
- **Premium** : Téléchargement sans filigrane pour les abonnés ou ceux ayant payé

## Clarification importante sur le mot de passe admin

Le portail admin utilise l'authentification standard (email + mot de passe). Le système ne stocke pas de mot de passe en clair - il faudra réinitialiser le mot de passe du compte `admin@cissedesign.com` via le flux "Mot de passe oublié" pour définir **66783831** comme nouveau mot de passe.

---

## Phase 1 : Modification de la base de données

### 1.1 Ajouter une colonne pour tracker l'import IA

Ajouter une colonne `used_ai_import` à la table `resumes` :

```text
+-------------------+
|     resumes       |
+-------------------+
| ...               |
| used_ai_import    | boolean DEFAULT false
+-------------------+
```

### 1.2 Mettre à jour la fonction `can_download_resume`

Modifier la logique pour prendre en compte le flag `used_ai_import` :
- Si `used_ai_import = true` → Paiement obligatoire
- Si `used_ai_import = false` → Téléchargement gratuit avec filigrane possible

---

## Phase 2 : Mise à jour du backend (Edge Function)

### 2.1 Fonction `parse-cv`

Après un import IA réussi, marquer le CV avec `used_ai_import = true` dans la base de données.

---

## Phase 3 : Mise à jour du frontend

### 3.1 Hook `useDownloadPermission`

Modifier la logique pour :
1. Vérifier si le CV a utilisé l'import IA
2. Si oui → Forcer le paiement (pas d'option gratuite)
3. Si non → Permettre le téléchargement gratuit avec filigrane

### 3.2 Composant `CVPreview`

Adapter le menu de téléchargement :
- Masquer l'option "Gratuit (avec filigrane)" si le CV a utilisé l'import IA
- Afficher un message explicatif

### 3.3 Modal d'import

Clarifier le message d'avertissement pour indiquer que le téléchargement gratuit sera désactivé après l'import.

---

## Phase 4 : Réinitialisation du mot de passe admin

Envoyer un email de réinitialisation au compte admin pour définir le nouveau mot de passe **66783831**.

---

## Résumé technique

| Composant | Modification |
|-----------|--------------|
| **Base de données** | + colonne `used_ai_import` sur `resumes` |
| **Fonction SQL** | Mise à jour de `can_download_resume` |
| **Edge Function** | `parse-cv` marque le CV après import |
| **useDownloadPermission** | Vérifie le flag AI import |
| **CVPreview** | Adapte le menu selon le statut du CV |
| **CVImportModal** | Avertissement clair avant import |

