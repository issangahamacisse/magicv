import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, action } = await req.json();
    
    if (!text || !action) {
      return new Response(JSON.stringify({ error: 'Missing text or action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get authorization header to check user quota
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    let isPremium = false;

    if (authHeader?.startsWith('Bearer ')) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      });

      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        userId = user.id;
        
        // Check if user can use AI
        const { data: canUseResult } = await supabase.rpc('can_use_ai', { p_user_id: userId });
        
        if (canUseResult && !canUseResult.allowed) {
          return new Response(JSON.stringify({ 
            error: canUseResult.reason || "Quota IA épuisé. Achetez des crédits pour continuer.",
            requiresPayment: true 
          }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Check premium status for smart-fill
        if (action === 'smart-fill') {
          const { data: profile } = await supabase
            .from('profiles')
            .select('is_subscribed, subscription_expires_at, credits_ai')
            .eq('user_id', userId)
            .single();
          
          const isSubscribed = profile?.is_subscribed && 
            (!profile?.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date());
          const hasCredits = (profile?.credits_ai || 0) > 0;
          
          if (!isSubscribed && !hasCredits) {
            return new Response(JSON.stringify({ 
              error: "Cette fonctionnalité est réservée aux utilisateurs premium. Abonnez-vous ou achetez des crédits.",
              requiresPayment: true 
            }), {
              status: 402,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          isPremium = true;
        }
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    let useToolCalling = false;
    
    switch (action) {
      case 'summary':
        systemPrompt = `Tu es un expert en rédaction de CV professionnels. Reformule ce résumé professionnel pour le rendre plus impactant, professionnel et concis. 
        - Corrige les fautes d'orthographe et de grammaire
        - Utilise un ton professionnel mais engageant
        - Mets en avant les compétences clés et les réalisations
        - Garde une longueur similaire (2-4 phrases)
        - Réponds UNIQUEMENT avec le texte reformulé, sans explication ni commentaire.`;
        break;
      case 'bullets':
        systemPrompt = `Tu es un expert en rédaction de CV professionnels. Transforme cette description d'expérience en 3-5 bullet points percutants pour un CV.
        - Commence chaque point par un verbe d'action fort (ex: Développé, Géré, Optimisé, Dirigé)
        - Quantifie les résultats quand possible (%, chiffres, délais)
        - Mets en avant les réalisations concrètes et l'impact
        - Corrige les fautes d'orthographe
        - Réponds UNIQUEMENT avec les bullet points, un par ligne, commençant par "• "`;
        break;
      case 'education':
        systemPrompt = `Tu es un expert en rédaction de CV professionnels. Améliore cette description de formation pour un CV.
        - Mets en avant les réalisations académiques
        - Mentionne les compétences acquises
        - Reste concis (1-2 phrases ou 2-3 bullet points)
        - Corrige les fautes d'orthographe
        - Réponds UNIQUEMENT avec le texte reformulé, sans explication.`;
        break;
      case 'spellcheck':
        systemPrompt = `Tu es un correcteur orthographique et grammatical expert. Corrige UNIQUEMENT les fautes d'orthographe et de grammaire dans le texte suivant.
        - NE MODIFIE PAS le sens, le style ou la structure du texte
        - NE REFORMULE PAS les phrases
        - Garde exactement le même ton et le même niveau de formalité
        - Si le texte est déjà correct, renvoie-le tel quel
        - Réponds UNIQUEMENT avec le texte corrigé, sans explication ni commentaire.`;
        break;
      case 'smart-fill':
        systemPrompt = `Tu es un expert en rédaction de CV professionnels. L'utilisateur va te fournir du texte brut contenant des informations sur son parcours professionnel. 
        Analyse ce texte et extrais les informations structurées pour remplir un CV complet.
        - Corrige toutes les fautes d'orthographe et de grammaire
        - Reformule les descriptions pour les rendre professionnelles et percutantes
        - Utilise des verbes d'action forts pour les expériences
        - Génère un résumé professionnel concis si possible
        - Déduis les compétences à partir des expériences mentionnées
        - Identifie les langues mentionnées`;
        useToolCalling = true;
        break;
      default:
        return new Response(JSON.stringify({ error: 'Invalid action type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const requestBody: any = {
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
    };

    if (useToolCalling) {
      requestBody.tools = [
        {
          type: "function",
          function: {
            name: "fill_cv_data",
            description: "Remplit les données structurées d'un CV à partir du texte analysé",
            parameters: {
              type: "object",
              properties: {
                personalInfo: {
                  type: "object",
                  properties: {
                    fullName: { type: "string", description: "Nom complet" },
                    jobTitle: { type: "string", description: "Titre du poste / métier" },
                    email: { type: "string", description: "Adresse email" },
                    phone: { type: "string", description: "Numéro de téléphone" },
                    location: { type: "string", description: "Ville / Pays" },
                    summary: { type: "string", description: "Résumé professionnel (2-4 phrases percutantes)" },
                  },
                  required: ["fullName"],
                  additionalProperties: false
                },
                experience: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      company: { type: "string" },
                      position: { type: "string" },
                      location: { type: "string" },
                      startDate: { type: "string", description: "Format: YYYY-MM ou YYYY" },
                      endDate: { type: "string", description: "Format: YYYY-MM, YYYY ou vide si poste actuel" },
                      current: { type: "boolean" },
                      description: { type: "string", description: "Bullet points avec •, un par ligne" },
                    },
                    required: ["company", "position"],
                    additionalProperties: false
                  }
                },
                education: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      institution: { type: "string" },
                      degree: { type: "string" },
                      field: { type: "string" },
                      startDate: { type: "string" },
                      endDate: { type: "string" },
                      description: { type: "string" },
                    },
                    required: ["institution", "degree"],
                    additionalProperties: false
                  }
                },
                skills: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      level: { type: "string", enum: ["beginner", "intermediate", "advanced", "expert"] },
                    },
                    required: ["name", "level"],
                    additionalProperties: false
                  }
                },
                languages: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      level: { type: "string", enum: ["basic", "conversational", "professional", "fluent", "native"] },
                    },
                    required: ["name", "level"],
                    additionalProperties: false
                  }
                },
              },
              required: ["personalInfo"],
              additionalProperties: false
            }
          }
        }
      ];
      requestBody.tool_choice = { type: "function", function: { name: "fill_cv_data" } };
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Crédits IA épuisés. Veuillez recharger vos crédits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();

    // Consume AI usage after successful call
    if (userId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      
      await adminClient.rpc('consume_ai_usage', { p_user_id: userId });
      console.log(`AI usage consumed for user ${userId}`);
    }

    if (useToolCalling) {
      // Extract structured data from tool call
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) {
        throw new Error('No structured data returned from AI');
      }
      
      let cvData;
      try {
        cvData = JSON.parse(toolCall.function.arguments);
      } catch {
        throw new Error('Failed to parse AI structured response');
      }
      
      console.log(`AI smart-fill successful`);
      
      return new Response(JSON.stringify({ cvData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const rewrittenText = data.choices?.[0]?.message?.content?.trim();

    if (!rewrittenText) {
      throw new Error('No response from AI');
    }

    console.log(`AI rewrite successful: ${rewrittenText.length} characters`);

    return new Response(JSON.stringify({ rewrittenText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in ai-rewrite function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
