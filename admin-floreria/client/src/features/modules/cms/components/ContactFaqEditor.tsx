import { useState, useEffect, useCallback } from "react";
import { Loader2, HelpCircle, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { toast } from "sonner";
import { cmsContactService, type FaqItem } from "../services/cms-contact-service";

interface ContactFaqEditorProps {
  lang: string;
}

export default function ContactFaqEditor({ lang }: ContactFaqEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    items: [] as FaqItem[],
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cmsContactService.getContactFaq(lang);
      const data = response.data.data;
      
      if (data) {
        setFormData({
          title: data.title || "",
          description: data.description || "",
          items: data.items || [],
        });
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar las preguntas frecuentes");
    } finally {
      setLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await cmsContactService.updateContactFaq(lang, formData);
      toast.success("Preguntas frecuentes actualizadas exitosamente");
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const addFaqItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { question: "", answer: "" }],
    });
  };

  const removeFaqItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const updateFaqItem = (index: number, field: keyof FaqItem, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Preguntas Frecuentes
          </CardTitle>
          <CardDescription>
            Cargando preguntas frecuentes...
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          Preguntas Frecuentes - FAQ
        </CardTitle>
        <CardDescription>
          Edita las preguntas y respuestas frecuentes de la página de contacto.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            placeholder="Frequently Asked Questions"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            placeholder="Find answers to common questions."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Preguntas y Respuestas</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFaqItem}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar Pregunta
            </Button>
          </div>

          {formData.items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay preguntas agregadas. Haz clic en "Agregar Pregunta" para comenzar.
            </div>
          ) : (
            <div className="space-y-6">
              {formData.items.map((item, index) => (
                <Card key={index} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Pregunta {index + 1}</CardTitle>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFaqItem(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor={`question-${index}`}>Pregunta</Label>
                      <Input
                        id={`question-${index}`}
                        placeholder="¿Cuál es tu pregunta?"
                        value={item.question}
                        onChange={(e) =>
                          updateFaqItem(index, "question", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`answer-${index}`}>Respuesta</Label>
                      <Textarea
                        id={`answer-${index}`}
                        placeholder="Respuesta detallada..."
                        value={item.answer}
                        onChange={(e) =>
                          updateFaqItem(index, "answer", e.target.value)
                        }
                        rows={4}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
