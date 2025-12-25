import React, { useState } from 'react';
import { CVProvider } from '@/context/CVContext';
import Header from '@/components/layout/Header';
import EditorPanel from '@/components/editor/EditorPanel';
import CVPreview from '@/components/preview/CVPreview';
import { Helmet } from 'react-helmet-async';

const Index: React.FC = () => {
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  return (
    <CVProvider>
      <Helmet>
        <title>CV Builder - Créez votre CV professionnel en ligne</title>
        <meta 
          name="description" 
          content="Créez un CV professionnel en quelques minutes avec notre éditeur intuitif. Modèles modernes, assistance IA et export PDF gratuit." 
        />
      </Helmet>

      <div className="h-screen flex flex-col overflow-hidden">
        <Header 
          onToggleMobilePreview={() => setShowMobilePreview(!showMobilePreview)}
          showMobilePreview={showMobilePreview}
        />

        <main className="flex-1 flex overflow-hidden">
          {/* Editor Panel - Hidden on mobile when preview is shown */}
          <div className={`
            w-full lg:w-[40%] xl:w-[35%] border-r border-border overflow-hidden
            ${showMobilePreview ? 'hidden lg:block' : 'block'}
          `}>
            <EditorPanel />
          </div>

          {/* Preview Panel - Hidden on mobile when editing */}
          <div className={`
            flex-1 overflow-hidden
            ${showMobilePreview ? 'block' : 'hidden lg:block'}
          `}>
            <CVPreview />
          </div>
        </main>
      </div>
    </CVProvider>
  );
};

export default Index;
