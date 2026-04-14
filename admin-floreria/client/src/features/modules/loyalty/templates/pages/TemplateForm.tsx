import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  templatesApi,
  loyaltyApiHelpers,
} from "../../services/loyalty-api.service";

const TEMPLATE_TYPES = [
  { value: "BIRTHDAY", label: "Cumpleaños" },
  { value: "WINBACK", label: "Reactivación" },
  { value: "SEASONAL", label: "Temporada" },
  { value: "GENERIC", label: "Genérico" },
];

const COMMON_VARIABLES = [
  {
    value: "customerName",
    label: "Nombre del cliente",
    example: "{{customerName}}",
    description: "Nombre del cliente que recibirá el email",
  },
  {
    value: "customerEmail",
    label: "Email del cliente",
    example: "{{customerEmail}}",
    description: "Dirección de email del cliente",
  },
  {
    value: "couponCode",
    label: "Código del cupón",
    example: "{{couponCode}}",
    description:
      "Código único del cupón (solo si la campaña tiene cupón asociado)",
  },
  {
    value: "discountValue",
    label: "Valor del descuento",
    example: "{{discountValue}}",
    description: "Porcentaje o monto del descuento del cupón",
  },
  {
    value: "expiryDate",
    label: "Fecha de expiración",
    example: "{{expiryDate}}",
    description: "Fecha hasta la cual es válido el cupón",
  },
];

export default function TemplateForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: "",
    type: "GENERIC" as "BIRTHDAY" | "WINBACK" | "SEASONAL" | "GENERIC",
    subject: "",
    htmlContent: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit && id) {
      loadTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const loadTemplate = async () => {
    try {
      setLoadingData(true);
      const data = await loyaltyApiHelpers.getTemplate(id!);

      setFormData({
        name: data.name || "",
        type: data.type || "GENERIC",
        subject: data.subject || "",
        htmlContent: data.htmlContent || "",
        isActive: data.isActive ?? true,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Error al cargar la plantilla");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        subject: formData.subject,
        htmlContent: formData.htmlContent,
        isActive: formData.isActive,
      };

      if (isEdit) {
        await templatesApi.update(id, payload);
      } else {
        await templatesApi.create(payload);
      }

      navigate("/app/loyalty/templates");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Error al guardar la plantilla");
    } finally {
      setLoading(false);
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById(
      "htmlContent",
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.htmlContent;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const newText = before + `{{${variable}}}` + after;

      setFormData({ ...formData, htmlContent: newText });

      // Restaurar el foco y la posición del cursor
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + variable.length + 4,
          start + variable.length + 4,
        );
      }, 0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">
          {isEdit ? "Editar" : "Crear"} Plantilla
        </h1>

        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}{" "}
            Plantilla
          </button>
        </div>
      </div>

      {loadingData && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-4 py-3 rounded">
          Cargando datos de la plantilla...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form className="space-y-6">
        {/* Grid de 2 columnas en desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda: Información básica */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">
              Información Básica
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Plantilla *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej: Plantilla de Bienvenida"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Plantilla *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as any })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                {TEMPLATE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                El tipo ayuda a organizar las plantillas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Asunto del Email *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej: ¡Feliz cumpleaños {{customerName}}!"
              />
              <p className="text-xs text-gray-500 mt-1">
                Puedes usar variables como {"{{customerName}}"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="rounded"
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700"
              >
                Plantilla activa
              </label>
            </div>
          </div>

          {/* Columna derecha: Variables disponibles */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">
              Variables Disponibles
            </h2>
            <p className="text-sm text-gray-600">
              Haz clic en "Insertar" para agregar la variable en el contenido
              HTML. Las variables se reemplazan automáticamente cuando se envía
              el email.
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {COMMON_VARIABLES.map((variable) => (
                <div
                  key={variable.value}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {variable.label}
                      </p>
                      <code className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded block mb-2">
                        {variable.example}
                      </code>
                      <p className="text-xs text-gray-500">
                        {variable.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => insertVariable(variable.value)}
                      className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex-shrink-0"
                    >
                      Insertar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-800">
                <strong>Tip:</strong> Las variables de cupón (código,
                descuento, fecha) solo se reemplazan cuando la campaña tiene un
                cupón asociado. El sistema las genera automáticamente.
              </p>
            </div>
          </div>
        </div>

        {/* Contenido HTML - Ancho completo */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">
            Contenido HTML del Email
          </h2>
          <p className="text-sm text-gray-600">
            Escribe el contenido HTML del email. Puedes usar las variables
            seleccionadas arriba.
          </p>

          <div>
            <textarea
              id="htmlContent"
              required
              value={formData.htmlContent}
              onChange={(e) =>
                setFormData({ ...formData, htmlContent: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-indigo-500"
              rows={16}
              placeholder={`<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: Arial, sans-serif; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Hola {{customerName}}</h1>
      <p>Tu contenido aquí...</p>
    </div>
  </body>
</html>`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Escribe HTML completo con estilos inline para mejor compatibilidad
              con clientes de email
            </p>
          </div>

          {/* Preview básico */}
          {formData.htmlContent && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Vista Previa:
              </h3>
              <div
                className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-96 overflow-auto"
                dangerouslySetInnerHTML={{ __html: formData.htmlContent }}
              />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
