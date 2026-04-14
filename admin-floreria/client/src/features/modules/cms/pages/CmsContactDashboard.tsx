import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Label } from "@/shared/components/ui/label";
import { MessageCircle, Globe } from "lucide-react";
import ContactHeroEditor from "../components/ContactHeroEditor";
import ContactInfoEditor from "../components/ContactInfoEditor";
import ContactMapEditor from "../components/ContactMapEditor";
import ContactFaqEditor from "../components/ContactFaqEditor";

export default function CmsContactDashboard() {
  const [lang, setLang] = useState("en");

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">CMS - Contact Page</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Gestiona el contenido de la página de Contacto
          </p>
        </div>
      </div>

      {/* Selector de Idioma */}
      <div className="bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-3 mb-3">
          <Globe className="w-5 h-5 text-muted-foreground" />
          <Label className="text-sm font-medium">Idioma</Label>
        </div>
        <Tabs value={lang} onValueChange={setLang} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="es">🇪🇸 Español</TabsTrigger>
            <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Secciones Editables */}
      <div className="space-y-6">
        <ContactHeroEditor lang={lang} />
        <ContactInfoEditor lang={lang} />
        <ContactMapEditor lang={lang} />
        <ContactFaqEditor lang={lang} />
      </div>
    </div>
  );
}
