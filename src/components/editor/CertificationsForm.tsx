import React from 'react';
import { useCV } from '@/context/CVContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, Award } from 'lucide-react';

const CertificationsForm: React.FC = () => {
  const { cvData, addCertification, updateCertification, removeCertification } = useCV();
  const { certifications } = cvData;

  return (
    <div className="space-y-4 animate-fade-in">
      {certifications.length === 0 ? (
        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-border">
          <Award className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            Aucune certification ajoutée
          </p>
          <Button onClick={addCertification} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une certification
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert, index) => (
            <Card key={cert.id} className="p-4 form-section">
              <div className="flex items-start gap-3">
                <div className="drag-handle pt-2">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Certification {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCertification(cert.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Nom de la certification</Label>
                    <Input
                      placeholder="AWS Solutions Architect"
                      value={cert.name}
                      onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Organisme</Label>
                      <Input
                        placeholder="Amazon Web Services"
                        value={cert.issuer}
                        onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Date d'obtention</Label>
                      <Input
                        type="month"
                        value={cert.date}
                        onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">URL du certificat (optionnel)</Label>
                    <Input
                      placeholder="https://verify.certification.com/..."
                      value={cert.url || ''}
                      onChange={(e) => updateCertification(cert.id, 'url', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <Button onClick={addCertification} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une certification
        </Button>
      )}
    </div>
  );
};

export default CertificationsForm;
