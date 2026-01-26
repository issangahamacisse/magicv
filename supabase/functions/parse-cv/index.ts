import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const extractCVTool = {
  type: "function",
  function: {
    name: "extract_cv_data",
    description: "Extraire les informations structurées d'un CV au format JSON",
    parameters: {
      type: "object",
      properties: {
        personalInfo: {
          type: "object",
          description: "Informations personnelles du candidat",
          properties: {
            fullName: { type: "string", description: "Nom complet" },
            jobTitle: { type: "string", description: "Titre du poste / métier" },
            email: { type: "string", description: "Adresse email" },
            phone: { type: "string", description: "Numéro de téléphone" },
            location: { type: "string", description: "Ville, pays ou adresse" },
            website: { type: "string", description: "Site web personnel" },
            linkedin: { type: "string", description: "Profil LinkedIn" },
            summary: { type: "string", description: "Résumé professionnel ou accroche" }
          },
          required: ["fullName"]
        },
        experience: {
          type: "array",
          description: "Liste des expériences professionnelles",
          items: {
            type: "object",
            properties: {
              company: { type: "string", description: "Nom de l'entreprise" },
              position: { type: "string", description: "Intitulé du poste" },
              location: { type: "string", description: "Lieu de travail" },
              startDate: { type: "string", description: "Date de début (format YYYY-MM)" },
              endDate: { type: "string", description: "Date de fin (format YYYY-MM ou vide si actuel)" },
              current: { type: "boolean", description: "Poste actuel" },
              description: { type: "string", description: "Description des missions et réalisations" }
            },
            required: ["company", "position"]
          }
        },
        education: {
          type: "array",
          description: "Liste des formations",
          items: {
            type: "object",
            properties: {
              institution: { type: "string", description: "Nom de l'établissement" },
              degree: { type: "string", description: "Diplôme obtenu" },
              field: { type: "string", description: "Domaine d'études" },
              startDate: { type: "string", description: "Date de début" },
              endDate: { type: "string", description: "Date de fin" },
              description: { type: "string", description: "Description supplémentaire" }
            },
            required: ["institution", "degree"]
          }
        },
        skills: {
          type: "array",
          description: "Liste des compétences",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Nom de la compétence" },
              level: { 
                type: "string", 
                enum: ["beginner", "intermediate", "advanced", "expert"],
                description: "Niveau de maîtrise"
              }
            },
            required: ["name", "level"]
          }
        },
        languages: {
          type: "array",
          description: "Liste des langues parlées",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Nom de la langue" },
              level: { 
                type: "string", 
                enum: ["basic", "conversational", "professional", "fluent", "native"],
                description: "Niveau de maîtrise"
              }
            },
            required: ["name", "level"]
          }
        },
        projects: {
          type: "array",
          description: "Liste des projets personnels ou professionnels",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Nom du projet" },
              description: { type: "string", description: "Description du projet" },
              url: { type: "string", description: "URL du projet" },
              technologies: { 
                type: "array", 
                items: { type: "string" },
                description: "Technologies utilisées"
              }
            },
            required: ["name"]
          }
        },
        certifications: {
          type: "array",
          description: "Liste des certifications",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Nom de la certification" },
              issuer: { type: "string", description: "Organisme émetteur" },
              date: { type: "string", description: "Date d'obtention" },
              url: { type: "string", description: "URL de vérification" }
            },
            required: ["name", "issuer"]
          }
        }
      },
      required: ["personalInfo"]
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cvText, fileType } = await req.json();
    
    if (!cvText || cvText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Aucun texte de CV fourni" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Parsing CV (${fileType}), text length: ${cvText.length}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `Tu es un expert en analyse de CV. Tu dois extraire toutes les informations d'un CV et les structurer de manière précise.

Instructions:
- Extrais TOUTES les informations disponibles dans le CV
- Pour les dates, utilise le format YYYY-MM (ex: 2023-06)
- Si une date n'est pas précise, estime au mieux (ex: "2020" devient "2020-01")
- Pour les compétences, évalue le niveau en fonction du contexte (années d'expérience, projets mentionnés)
- Pour les langues, déduis le niveau à partir des mentions (natif, courant, intermédiaire, etc.)
- Si une information n'est pas présente, ne l'invente pas
- Traduis les niveaux en anglais (beginner, intermediate, advanced, expert pour les skills)
- Traduis les niveaux de langue en anglais (basic, conversational, professional, fluent, native)`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Voici le texte extrait d'un CV. Analyse-le et extrais toutes les informations structurées:\n\n${cvText}` }
        ],
        tools: [extractCVTool],
        tool_choice: { type: "function", function: { name: "extract_cv_data" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes atteinte, réessayez plus tard" }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits épuisés, veuillez recharger votre compte" }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erreur lors de l'analyse du CV");
    }

    const result = await response.json();
    console.log("AI response received");

    // Extract the tool call result
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "extract_cv_data") {
      throw new Error("L'IA n'a pas pu extraire les données du CV");
    }

    const extractedData = JSON.parse(toolCall.function.arguments);
    console.log("Extracted data:", JSON.stringify(extractedData, null, 2).substring(0, 500));

    // Generate unique IDs for arrays
    const generateId = () => Math.random().toString(36).substring(2, 11);

    // Add IDs to all array items
    const cvData = {
      personalInfo: extractedData.personalInfo || {},
      experience: (extractedData.experience || []).map((exp: Record<string, unknown>) => ({
        id: generateId(),
        ...exp,
        current: exp.current || false,
      })),
      education: (extractedData.education || []).map((edu: Record<string, unknown>) => ({
        id: generateId(),
        ...edu,
      })),
      skills: (extractedData.skills || []).map((skill: Record<string, unknown>) => ({
        id: generateId(),
        ...skill,
      })),
      languages: (extractedData.languages || []).map((lang: Record<string, unknown>) => ({
        id: generateId(),
        ...lang,
      })),
      projects: (extractedData.projects || []).map((proj: Record<string, unknown>) => ({
        id: generateId(),
        ...proj,
        technologies: proj.technologies || [],
      })),
      certifications: (extractedData.certifications || []).map((cert: Record<string, unknown>) => ({
        id: generateId(),
        ...cert,
      })),
    };

    return new Response(
      JSON.stringify({ success: true, data: cvData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Parse CV error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erreur inconnue" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
