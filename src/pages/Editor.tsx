import React, { useState, useRef } from 'react';
import Header from '@/components/layout/Header';
import EditorTabs from '@/components/editor/EditorTabs';
import CVPreview from '@/components/preview/CVPreview';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Eye, Edit3 } from 'lucide-react';

const Editor: React.FC = () => {
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const cvPreviewRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Helmet>
        <title>Éditeur de CV - CV Builder</title>
        <meta 
          name="description" 
          content="Créez votre CV professionnel avec notre éditeur intuitif. Modèles modernes et export PDF." 
        />
      </Helmet>

      <div className="h-screen flex flex-col overflow-hidden">
        <Header 
          onToggleMobilePreview={() => setShowMobilePreview(!showMobilePreview)}
          showMobilePreview={showMobilePreview}
        />

        <main className="flex-1 flex overflow-hidden relative">
          {/* Editor Panel - Hidden on mobile when preview is shown */}
          <div className={`
            w-full lg:w-[40%] xl:w-[35%] border-r border-border overflow-hidden
            ${showMobilePreview ? 'hidden lg:block' : 'block'}
          `}>
            <EditorTabs />
          </div>

          {/* Preview Panel - Hidden on mobile when editing */}
          <div className={`
            flex-1 overflow-hidden
            ${showMobilePreview ? 'block' : 'hidden lg:block'}
          `}>
            <CVPreview ref={cvPreviewRef} />
          </div>

          {/* Mobile Floating Button */}
          <div className="lg:hidden fixed bottom-6 right-6 z-50">
            <Button
              size="lg"
              onClick={() => setShowMobilePreview(!showMobilePreview)}
              className="rounded-full h-14 w-14 shadow-lg"
            >
              {showMobilePreview ? (
                <Edit3 className="h-6 w-6" />
              ) : (
                <Eye className="h-6 w-6" />
              )}
            </Button>
          </div>
        </main>
      </div>
    </>
  );
};

export default Editor;
