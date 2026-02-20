
# Plan complet — Rebranding MagiCV + Tableau de bord statistiques Admin

## Partie 1 — Rebranding "MagiCV" partout

### Fichiers à modifier

**`index.html`**
- `<title>Lovable App</title>` → `<title>MagiCV - Créez votre CV professionnel avec l'IA</title>`
- `og:title` et `og:description` mis à jour

**`src/pages/Landing.tsx`**
- Helmet title : `CV Builder - Créez...` → `MagiCV - Créez votre CV professionnel avec l'IA`
- Header logo : `ResumeBuilder` → `MagiCV`
- Footer : `© 2024 ResumeBuilder. Tous droits réservés.` → `© 2026 MagiCV — Issa N'gahama Cissé. Tous droits réservés.`

**`src/pages/Auth.tsx`**
- Helmet title : `Connexion - CV Builder` → `Connexion - MagiCV`
- Logo texte dans le formulaire : `CV Builder` → `MagiCV`

**`src/pages/Editor.tsx`**
- Helmet title : `Éditeur de CV - CV Builder` → `Éditeur de CV - MagiCV`

**`src/pages/Dashboard.tsx`**
- Helmet title : `Mon espace - CV Builder` → `Mon espace - MagiCV`
- Logo texte dans le header du dashboard : `CV Builder` → `MagiCV`

**`src/components/layout/Header.tsx`**
- Logo texte : `CV Builder` → `MagiCV`

**`src/components/auth/SignUpModal.tsx`**
- Titre de la modale : `Bienvenue sur CV Builder` → `Bienvenue sur MagiCV`

---

## Partie 2 — Tableau de bord Statistiques Admin

### Nouvel onglet "Tableau de bord" dans `src/pages/AdminPortal.tsx`

Placé en **premier** dans la barre d'onglets avec l'icône `BarChart3`.

### Section 1 — KPIs principaux (grille 2x2 ou 4 colonnes)

```text
+------------------+  +------------------+  +------------------+  +------------------+
|  💰 Revenu total |  |  👥 Utilisateurs  |  |  📄 CVs créés    |  |  ⏳ En attente   |
|  8 000 F CFA     |  |  3 inscrits       |  |  5 CVs           |  |  1 paiement      |
|  dont 1 abonné   |  |  1 abonné actif  |  |  ~1,67/utilisat. |  |  à traiter       |
+------------------+  +------------------+  +------------------+  +------------------+
```

### Section 2 — Revenus détaillés (2 cartes)

- **Abonnements** : 2 validés · 6 000 F CFA
- **Téléchargements** : 2 validés · 2 000 F CFA

### Section 3 — Évolution des inscriptions (30 derniers jours)

Graphique en barres (recharts `BarChart`) avec les inscriptions par jour sur 30 jours. Recharts est déjà installé dans le projet.

### Section 4 — Évolution des revenus (7 et 30 jours)

Graphique en ligne (recharts `LineChart`) montrant les revenus journaliers validés avec sélecteur de période (7j / 30j).

### Section 5 — Répartition des paiements

Barres de progression colorées montrant :
- En attente (orange)
- Validés (vert)
- Rejetés (rouge)
Avec pourcentages.

### Section 6 — Statistiques IA et coupons

- Crédits IA totaux restants dans les profils
- Nombre de coupons actifs
- Total d'utilisations de coupons

### Note sur les visites de la Landing page

Les visites de la landing page (sessions, pages vues par jour/7j/30j) **ne peuvent pas être trackées nativement** sans un système d'analytics dédié (Google Analytics, Plausible, Umami...). Cela nécessiterait soit :
- L'intégration d'un outil externe (Google Analytics) — ajout d'un script dans `index.html`
- Ou une table `page_views` custom avec un enregistrement à chaque visite de `/`

Pour ce plan, nous allons **créer une table `page_views`** simple pour tracker les visites de la landing page, avec un enregistrement anonyme à chaque chargement. Cela permettra d'afficher dans l'admin les visites du jour, des 7 derniers jours et des 30 derniers jours.

### Nouvelle table `page_views` (migration SQL)

```sql
CREATE TABLE public.page_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page text NOT NULL DEFAULT '/',
  visited_at timestamp with time zone DEFAULT now() NOT NULL,
  user_agent text,
  referrer text
);

-- RLS : insert public (anonyme), select admin seulement
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view page views"
  ON public.page_views FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
```

Un enregistrement anonyme sera déclenché dans `src/pages/Landing.tsx` à chaque montage du composant (un seul appel `useEffect`).

### Graphique visites — Admin Stats

```text
Visites Landing Page — Aujourd'hui / 7 jours / 30 jours
+-------+---+
| 20/02 | 3 | ████████████████
| 19/02 | 1 | ████
| 18/02 | 5 | ████████████████████████████
+-------+---+
```

---

## Résumé des fichiers impactés

| Fichier | Changement |
|---|---|
| `index.html` | Titre + meta OG |
| `src/pages/Landing.tsx` | Branding + footer + tracking page_views |
| `src/pages/Auth.tsx` | Branding |
| `src/pages/Editor.tsx` | Titre Helmet |
| `src/pages/Dashboard.tsx` | Branding |
| `src/components/layout/Header.tsx` | Branding |
| `src/components/auth/SignUpModal.tsx` | Branding |
| `src/pages/AdminPortal.tsx` | Nouvel onglet Statistiques complet |
| Migration SQL | Nouvelle table `page_views` |
