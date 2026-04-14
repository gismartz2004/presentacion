import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  automationsApi,
  loyaltyApiHelpers,
} from "../../services/loyalty-api.service";
import { useCampaigns } from "../../hooks/useLoyaltyData";
import { IconRobot, IconCalendar } from "@tabler/icons-react";

const frequencyOptions = [
  {
    value: "DAILY",
    label: "Diaria",
    description: "Se ejecuta todos los días a las 8:00 AM",
  },
  {
    value: "WEEKLY",
    label: "Semanal",
    description: "Se ejecuta cada lunes a las 8:00 AM",
  },
  {
    value: "MONTHLY",
    label: "Mensual",
    description: "Se ejecuta el primer día del mes a las 8:00 AM",
  },
];

export default function AutomationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { campaigns } = useCampaigns();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    campaignId: "",
    frequency: "DAILY",
    isActive: true,
  });

  useEffect(() => {
    if (id) {
      loadAutomation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadAutomation = async () => {
    try {
      setLoading(true);
      const data = await loyaltyApiHelpers.getAutomation(id!);
      setFormData({
        name: data.name,
        description: data.description || "",
        campaignId: data.campaignId,
        frequency: data.frequency,
        isActive: data.isActive,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cargar automatización";
      console.error('Error loading automation:', message);
      setError("Error al cargar automatización");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.campaignId) {
      setError("Por favor complete los campos obligatorios");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        campaignId: formData.campaignId,
        frequency: formData.frequency,
        isActive: formData.isActive,
      };

      if (id) {
        await loyaltyApiHelpers.updateAutomation(id, payload);
      } else {
        await automationsApi.create(payload);
      }

      navigate("/loyalty/automations");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al guardar automatización";
      console.error('Error saving automation:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {id ? "Editar Automatización" : "Nueva Automatización"}
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
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Guardando..." : id ? "Actualizar" : "Crear"}{" "}
            Automatización
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form className="space-y-6">
        {/* Información Básica */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Datos Principales */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <IconRobot className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Información Básica
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ej: Envío diario de cumpleaños"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Descripción opcional de la automatización"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frecuencia de Ejecución *
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  {frequencyOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {
                    frequencyOptions.find(
                      (opt) => opt.value === formData.frequency,
                    )?.description
                  }
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-gray-700"
                >
                  Automatización activa
                </label>
              </div>
            </div>
          </div>

          {/* Campaña a Ejecutar */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <IconCalendar className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Campaña a Ejecutar
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccionar Campaña *
                </label>
                <select
                  value={formData.campaignId}
                  onChange={(e) =>
                    setFormData({ ...formData, campaignId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccione una campaña</option>
                  {campaigns?.map((campaign: any) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  La campaña incluye el segmento, template y cupón configurados
                </p>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p className="text-sm text-blue-800">
                  <strong>Cómo funciona:</strong> El worker ejecutará esta
                  automatización según la frecuencia seleccionada. En cada
                  ejecución, buscará los clientes que cumplen el segmento de la
                  campaña y enviará el email configurado.
                </p>
              </div>

              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                <p className="text-sm text-green-800">
                  <strong>Flujo completo:</strong>
                  <br />
                  1. Segmento → Define quiénes reciben
                  <br />
                  2. Template → Define el contenido
                  <br />
                  3. Cupón (opcional) → Agrega descuento
                  <br />
                  4. Campaña → Combina todo
                  <br />
                  5. Automatización → Define cuándo se ejecuta
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
