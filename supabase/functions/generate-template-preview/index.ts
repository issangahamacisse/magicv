import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const templatePrompts: Record<string, string> = {
  modern: `Generate a professional CV/resume preview image for a "Modern" template.
Design specifications:
- Clean white A4 paper layout with subtle shadow
- Header: Name "Marie Dupont" in vibrant purple (#7c3aed), job title "Product Designer" below in gray
- Contact row with purple icons: email, phone, LinkedIn, location
- Two-column layout: 70% main content, 30% sidebar
- Main: Experience section with 2 jobs, Education with 1 degree
- Sidebar: Skills with colored progress bars (purple theme), Languages with dots rating
- Clean sans-serif typography (like Inter or Helvetica)
- Subtle section dividers
Format: A4 ratio (210x297mm), professional corporate style with purple accents`,

  classic: `Generate a professional CV/resume preview image for a "Classic" template.
Design specifications:
- Traditional A4 layout with generous margins
- Name "Jean Martin" centered at top in elegant black serif font (like Times New Roman)
- Contact info on one line below name, separated by vertical bars
- Single column layout, very readable
- Sections: Summary, Experience (2 jobs), Education, Skills as simple bullet list
- Black text on white, no colors except maybe dark blue for name
- Clear horizontal lines separating sections
- Conservative, timeless design suitable for banking/law
Format: A4 ratio, traditional academic/legal style`,

  minimal: `Generate a professional CV/resume preview image for a "Minimal" template.
Design specifications:
- Ultra-clean A4 layout with lots of white space
- Name "Sophie Chen" in thin, light gray typography at top left
- Minimal contact info with just icons, no labels
- Very sparse layout, content breathing room
- Thin, subtle section titles in uppercase small caps
- Experience and Education with minimal details
- Skills as simple text tags, no bars or graphics
- Monochromatic gray palette (#374151, #6b7280, #9ca3af)
- Swiss/Scandinavian minimalist aesthetic
Format: A4 ratio, zen-like simplicity`,

  creative: `Generate a professional CV/resume preview image for a "Creative" template.
Design specifications:
- A4 layout with bold orange (#f97316) left sidebar (about 35% width)
- Sidebar: Circular profile photo placeholder, name "Alex Rivera", contact with icons
- Sidebar skills section with creative progress indicators
- Main area (white): Experience with timeline dots, Education, Projects
- Creative typography mixing weights
- Geometric decorative elements subtly placed
- Fun but still professional, suitable for design/marketing roles
Format: A4 ratio, creative agency style with orange accent`,

  bold: `Generate a professional CV/resume preview image for a "Bold" template.
Design specifications:
- A4 layout with large colored header block (deep blue #1e40af or purple)
- Header contains: Large bold name "Thomas Weber", job title, contact row with icons
- Profile photo circle in header corner
- Below header: clean white content area
- Two columns for Experience and Skills/Education
- Bold section titles with thick underlines
- Strong typographic hierarchy, impactful first impression
- Professional but confident, suitable for executives
Format: A4 ratio, bold corporate style`,

  elegant: `Generate a professional CV/resume preview image for an "Elegant" template.
Design specifications:
- Refined A4 layout with thin gold (#d4af37) or bronze accent lines
- Name "Isabella Rossi" in elegant serif font (like Playfair Display)
- Subtle decorative borders or frames around sections
- Two-column layout with balanced proportions
- Experience dates in italics, company names in small caps
- Skills section with elegant rating dots or stars
- Color palette: cream/off-white background, charcoal text, gold accents
- Sophisticated, luxury brand aesthetic
Format: A4 ratio, high-end fashion/luxury industry style`,

  tech: `Generate a professional CV/resume preview image for a "Tech" template.
Design specifications:
- A4 layout with dark theme (dark gray #1f2937 or #0f172a background)
- Name "David Kim" in bright green (#22c55e) or cyan, monospace font
- Terminal/code aesthetic with subtle grid lines
- Contact info styled like code comments or variables
- Skills as colored tags/badges (like GitHub labels)
- Experience formatted like git commits or changelog
- Subtle code symbols or brackets as decorations
- Tech stack icons for skills
Format: A4 ratio, developer portfolio/GitHub style`,

  executive: `Generate a professional CV/resume preview image for an "Executive" template.
Design specifications:
- Premium A4 layout with subtle gray sidebar
- Name "Dr. Michael Chen" prominently displayed with credentials
- Professional headshot placeholder in sidebar
- Two-column layout: sidebar for contact/skills, main for experience
- Navy blue (#1e3a5f) and charcoal color scheme
- Sections for: Executive Summary, Career Highlights, Experience, Board Positions
- Refined typography, subtle shadows for depth
- C-suite/board member professional aesthetic
Format: A4 ratio, Fortune 500 executive style`,

  compact: `Generate a professional CV/resume preview image for a "Compact" template.
Design specifications:
- Dense A4 layout maximizing information density
- Name "Emma Johnson" in medium-weight font, not too large
- Three-column layout for maximum space usage
- Smaller font sizes (10-11pt equivalent)
- Compact spacing between sections and items
- Skills in multi-column list, very space-efficient
- Experience with abbreviated descriptions
- Every inch of paper utilized professionally
- Great for early career with lots of content to fit
Format: A4 ratio, information-dense but readable`,

  artistic: `Generate a professional CV/resume preview image for an "Artistic" template.
Design specifications:
- Creative A4 layout with asymmetric design
- Name "Luna Martinez" in artistic display font with color gradient
- Geometric shapes (circles, triangles) as decorative elements
- Vibrant color palette (coral #f472b6, teal #14b8a6, purple #a855f7)
- Unconventional section layouts (angled, overlapping)
- Skills visualized as creative infographics
- Experience timeline with artistic nodes
- Portfolio/gallery section suggested
- Suitable for artists, designers, creative directors
Format: A4 ratio, art gallery/portfolio aesthetic`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateId } = await req.json();
    
    if (!templateId || !templatePrompts[templateId]) {
      return new Response(
        JSON.stringify({ error: 'Invalid template ID', validTemplates: Object.keys(templatePrompts) }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Generating preview for template: ${templateId}`);

    const prompt = templatePrompts[templateId];
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required, please add credits' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error('No image in response:', JSON.stringify(data));
      throw new Error('No image generated');
    }

    // Upload to Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract base64 data
    const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const fileName = `${templateId}.png`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('template-previews')
      .upload(fileName, imageBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('template-previews')
      .getPublicUrl(fileName);

    console.log(`Preview uploaded: ${publicUrlData.publicUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        templateId,
        url: publicUrlData.publicUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating preview:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
