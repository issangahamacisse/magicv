import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    
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
      default:
        return new Response(JSON.stringify({ error: 'Invalid action type' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    console.log(`Processing AI rewrite request: action=${action}, text length=${text.length}`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
      }),
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
