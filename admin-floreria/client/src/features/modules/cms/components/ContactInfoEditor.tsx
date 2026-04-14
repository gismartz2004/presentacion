import { useState, useEffect, useCallback } from "react";
import { Loader2, MapPin, Phone, Clock, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { toast } from "sonner";
import { cmsContactService } from "../services/cms-contact-service";

interface ContactInfoEditorProps {
  lang: string;
}

export default function ContactInfoEditor({ lang }: ContactInfoEditorProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    location: {
      title: "",
      address: "",
      note: "",
    },
    phone: {
      title: "",
      numbers: "",
      note: "",
    },
    hours: {
      title: "",
      weekdays: "",
      weekends: "",
      note: "",
    },
    email: {
      title: "",
      emails: "",
      note: "",
    },
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cmsContactService.getContactInfo(lang);
      const data = response.data.data;
      
      if (data) {
        setFormData({
          location: data.location || { title: "", address: "", note: "" },
          phone: data.phone || { title: "", numbers: "", note: "" },
          hours: data.hours || { title: "", weekdays: "", weekends: "", note: "" },
          email: data.email || { title: "", emails: "", note: "" },
        });
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast.error("Error al cargar la información de contacto");
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
      await cmsContactService.updateContactInfo(lang, formData);
      toast.success("Información de contacto actualizada exitosamente");
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (section: keyof typeof formData, field: string, value: string) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value,
      },
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Información de Contacto</CardTitle>
          <CardDescription>
            Cargando datos de contacto...
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
        <CardTitle>Información de Contacto - Tarjetas</CardTitle>
        <CardDescription>
          Edita las 4 tarjetas de información de contacto (ubicación, teléfono, horarios, email).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="location" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="location">
              <MapPin className="h-4 w-4 mr-1" />
              Ubicación
            </TabsTrigger>
            <TabsTrigger value="phone">
              <Phone className="h-4 w-4 mr-1" />
              Teléfono
            </TabsTrigger>
            <TabsTrigger value="hours">
              <Clock className="h-4 w-4 mr-1" />
              Horarios
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-1" />
              Email
            </TabsTrigger>
          </TabsList>

          <TabsContent value="location" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location-title">Título</Label>
              <Input
                id="location-title"
                placeholder="Location"
                value={formData.location.title}
                onChange={(e) => updateSection("location", "title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location-address">Dirección</Label>
              <Textarea
                id="location-address"
                placeholder="Street Address&#10;City, State ZIP"
                value={formData.location.address}
                onChange={(e) => updateSection("location", "address", e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Usa saltos de línea para separar elementos de la dirección
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location-note">Nota</Label>
              <Input
                id="location-note"
                placeholder="Visit us"
                value={formData.location.note}
                onChange={(e) => updateSection("location", "note", e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="phone" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone-title">Título</Label>
              <Input
                id="phone-title"
                placeholder="Phone"
                value={formData.phone.title}
                onChange={(e) => updateSection("phone", "title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-numbers">Números de Teléfono</Label>
              <Textarea
                id="phone-numbers"
                placeholder="+1 234 567 890&#10;+1 098 765 432"
                value={formData.phone.numbers}
                onChange={(e) => updateSection("phone", "numbers", e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Cada número en una línea nueva
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-note">Nota</Label>
              <Input
                id="phone-note"
                placeholder="Call us"
                value={formData.phone.note}
                onChange={(e) => updateSection("phone", "note", e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="hours" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hours-title">Título</Label>
              <Input
                id="hours-title"
                placeholder="Hours"
                value={formData.hours.title}
                onChange={(e) => updateSection("hours", "title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours-weekdays">Horario Entre Semana</Label>
              <Input
                id="hours-weekdays"
                placeholder="Mon-Fri: 9AM-6PM"
                value={formData.hours.weekdays}
                onChange={(e) => updateSection("hours", "weekdays", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours-weekends">Horario Fin de Semana</Label>
              <Input
                id="hours-weekends"
                placeholder="Sat-Sun: 10AM-4PM"
                value={formData.hours.weekends}
                onChange={(e) => updateSection("hours", "weekends", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hours-note">Nota</Label>
              <Input
                id="hours-note"
                placeholder="Open daily"
                value={formData.hours.note}
                onChange={(e) => updateSection("hours", "note", e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-title">Título</Label>
              <Input
                id="email-title"
                placeholder="Email"
                value={formData.email.title}
                onChange={(e) => updateSection("email", "title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-emails">Direcciones de Email</Label>
              <Textarea
                id="email-emails"
                placeholder="contact@example.com&#10;support@example.com"
                value={formData.email.emails}
                onChange={(e) => updateSection("email", "emails", e.target.value)}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Cada email en una línea nueva
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-note">Nota</Label>
              <Input
                id="email-note"
                placeholder="Email us"
                value={formData.email.note}
                onChange={(e) => updateSection("email", "note", e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

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
