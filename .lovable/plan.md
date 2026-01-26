
## Plan : Afficher la vraie photo de profil + Import CV par IA

### Partie 1 : Afficher la vraie photo dans les templates Bold, Creative et Artistic

**Probleme actuel :**
- **BoldTemplate** (lignes 45-59) : Affiche l'initiale du nom dans un cercle
- **CreativeTemplate** (lignes 45-59) : Affiche l'initiale dans un cercle
- **ArtisticTemplate** (lignes 46-55) : Affiche une icone Palette au lieu d'une photo

**Solution :**
Modifier chaque template pour verifier si `personalInfo.photoUrl` existe et afficher l'image, sinon garder le fallback actuel (initiale ou icone).

**Fichiers a modifier :**
| Fichier | Modification |
|---------|-------------|
| `src/components/preview/BoldTemplate.tsx` | Ajouter condition photoUrl avec `<img>` arrondie |
| `src/components/preview/CreativeTemplate.tsx` | Ajouter condition photoUrl avec `<img>` arrondie |
| `src/components/preview/ArtisticTemplate.tsx` | Ajouter condition photoUrl avec `<img>` stylisee |

**Code type :**
```tsx
{personalInfo.photoUrl ? (
  <img 
    src={personalInfo.photoUrl} 
    alt="Photo de profil"
    className="w-full h-full object-cover rounded-full"
  />
) : (
  <span className="font-bold">{personalInfo.fullName?.charAt(0) || 'N'}</span>
)}
```

---

### Partie 2 : Import de CV (PDF/DOCX) avec analyse IA

Cette fonctionnalite permet a l'utilisateur d'importer un CV existant et de le convertir automatiquement en donnees structurees.

**Architecture :**
```
Utilisateur upload PDF/DOCX
        |
        v
Frontend (CVImportModal)
        |
        v
Edge Function (parse-cv)
        |
        v
1. Extraction texte (pdf-parse / mammoth)
2. Analyse IA (Lovable AI - gemini-2.5-flash)
3. Extraction structuree (tool calling)
        |
        v
Retour JSON -> CVData
        |
        v
Modal de verification + Appliquer au CV
```

**Fichiers a creer :**

| Fichier | Description |
|---------|-------------|
| `supabase/functions/parse-cv/index.ts` | Edge function pour parser PDF/DOCX et analyser avec l'IA |
| `src/components/editor/CVImportModal.tsx` | Modal d'upload et preview des donnees extraites |
| `src/hooks/useCVImport.ts` | Hook pour gerer l'import et l'appel a l'edge function |

**Fichiers a modifier :**

| Fichier | Modification |
|---------|-------------|
| `src/components/editor/EditorPanel.tsx` | Ajouter bouton "Importer un CV" |
| `src/context/CVContext.tsx` | Ajouter fonction `importCVData(data: Partial<CVData>)` |
| `supabase/config.toml` | Ajouter la nouvelle edge function |

---

### Details techniques

**1. Edge Function `parse-cv`**

```typescript
// Prompts IA avec tool calling pour extraction structuree
const tools = [{
  type: "function",
  function: {
    name: "extract_cv_data",
    description: "Extraire les informations structurees d'un CV",
    parameters: {
      type: "object",
      properties: {
        personalInfo: {
          type: "object",
          properties: {
            fullName: { type: "string" },
            jobTitle: { type: "string" },
            email: { type: "string" },
            phone: { type: "string" },
            location: { type: "string" },
            summary: { type: "string" }
          }
        },
        experience: {
          type: "array",
          items: {
            type: "object",
            properties: {
              company: { type: "string" },
              position: { type: "string" },
              startDate: { type: "string" },
              endDate: { type: "string" },
              description: { type: "string" }
            }
          }
        },
        education: {
          type: "array",
          items: {...}
        },
        skills: {
          type: "array",
          items: { type: "object", properties: { name: { type: "string" }, level: { type: "string" } } }
        },
        languages: {
          type: "array",
          items: {...}
        }
      }
    }
  }
}];
```

**2. CVImportModal**

- Zone de drop/upload pour fichiers PDF et DOCX
- Indicateur de progression pendant l'analyse
- Affichage des donnees extraites en preview
- Boutons "Modifier" pour ajuster avant import
- Bouton "Appliquer" pour fusionner avec le CV actuel

**3. Flux utilisateur**

1. Clic sur "Importer un CV" dans l'editeur
2. Drag & drop ou selection d'un fichier PDF/DOCX
3. Upload vers l'edge function
4. Affichage d'un loader "Analyse en cours..."
5. Preview des donnees extraites avec possibilite de corriger
6. Validation -> les donnees sont injectees dans le formulaire CV

---

### Gestion des formats

**PDF :**
- Utilisation de `pdf-parse` pour extraire le texte brut
- L'IA analyse ensuite le texte pour identifier les sections

**DOCX :**
- Utilisation de `mammoth` pour convertir en texte
- Meme traitement IA ensuite

**Limitations :**
- Les CV tres graphiques (images, colonnes complexes) peuvent etre moins bien interpretes
- Message d'avertissement a l'utilisateur si l'extraction semble incomplete

---

### Resume des modifications

| Action | Fichier |
|--------|---------|
| Modifier | `src/components/preview/BoldTemplate.tsx` |
| Modifier | `src/components/preview/CreativeTemplate.tsx` |
| Modifier | `src/components/preview/ArtisticTemplate.tsx` |
| Creer | `supabase/functions/parse-cv/index.ts` |
| Creer | `src/components/editor/CVImportModal.tsx` |
| Creer | `src/hooks/useCVImport.ts` |
| Modifier | `src/components/editor/EditorPanel.tsx` |
| Modifier | `src/context/CVContext.tsx` |
| Modifier | `supabase/config.toml` |

**Estimation :** 3 fichiers modifies pour les photos + 3 nouveaux fichiers + 3 modifications pour l'import CV
