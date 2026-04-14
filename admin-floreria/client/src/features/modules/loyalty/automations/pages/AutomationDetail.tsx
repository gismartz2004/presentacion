import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loyaltyApiHelpers } from "../../services/loyalty-api.service";
import {
  IconChevronLeft,
  IconRobot,
  IconCalendar,
  IconClock,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconSend,
  IconTemplate,
  IconUsers,
  IconTicket,
} from "@tabler/icons-react";

type FrequencyType = "DAILY" | "WEEKLY" | "MONTHLY";

interface Template {
  id: string;
  name: string;
  type?: string;
}

interface Segment {
  id: string;
  name: string;
  description?: string;
}

interface Campaign {
  id: string;
  name: string;
  subject: string;
  couponId?: string;
  segment?: Segment;
  template?: Template;
}

interface Automation {
  id: string;
  name: string;
  description?: string;
  frequency: FrequencyType;
  isActive: boolean;
  lastRunAt?: string;
  campaignId: string;
  campaign?: Campaign;
  _count?: {
    emailLogs: number;
  };
}

const frequencyLabels: Record<FrequencyType, string> = {
  DAILY: "Diaria (8:00 AM)",
  WEEKLY: "Semanal (Lunes 8:00 AM)",
  MONTHLY: "Mensual (Día 1, 8:00 AM)",
};

export default function AutomationDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [automation, setAutomation] = useState<Automation | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAutomation = async () => {
    try {
      setLoading(true);
      const data = await loyaltyApiHelpers.getAutomation(id!);
      setAutomation(data);
    } catch (error) {
      console.error("Error cargando automatización:", error);
      alert("Error al cargar la automatización");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadAutomation();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar esta automatización?")) return;

    try {
      await loyaltyApiHelpers.deleteAutomation(id!);
      navigate("/loyalty/automations");
    } catch (error) {
      console.error("Error eliminando automatización:", error);
      alert("Error al eliminar la automatización");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!automation) {
    return <div className="text-center py-8">Automatización no encontrada</div>;
  }

  const campaign = automation.campaign!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/loyalty/automations")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <IconChevronLeft className="w-5 h-5" />
          Volver a Automatizaciones
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {automation.name}
            </h1>
            {automation.description && (
              <p className="text-gray-600 mt-2">{automation.description}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/loyalty/automations/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <IconEdit className="w-4 h-4" />
              Editar
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <IconTrash className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {automation.isActive ? (
                  <span className="flex items-center gap-2 text-green-600">
                    <IconCheck className="w-6 h-6" />
                    Activa
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-red-600">
                    <IconX className="w-6 h-6" />
                    Inactiva
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Frecuencia</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {frequencyLabels[automation.frequency]}
              </p>
            </div>
            <IconClock className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Última Ejecución</p>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {automation.lastRunAt
                  ? new Date(automation.lastRunAt).toLocaleString("es-ES")
                  : "Nunca"}
              </p>
            </div>
            <IconCalendar className="w-10 h-10 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Emails Enviados</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {automation._count?.emailLogs || 0}
              </p>
            </div>
            <IconSend className="w-10 h-10 text-green-600" />
          </div>
        </div>
      </div>

      {/* Campaña Asociada */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <IconCalendar className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Campaña Asociada
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Campaign Info */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <IconRobot className="w-5 h-5 text-green-700" />
              <h3 className="font-semibold text-green-900">Campaña</h3>
            </div>
            <p className="text-lg font-bold text-green-800">{campaign.name}</p>
            <p className="text-sm text-green-700 mt-1">
              Asunto: {campaign.subject}
            </p>
          </div>

          {/* Segment Info */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <IconUsers className="w-5 h-5 text-blue-700" />
              <h3 className="font-semibold text-blue-900">Segmento</h3>
            </div>
            <p className="text-lg font-bold text-blue-800">
              {campaign.segment?.name || "Sin segmento"}
            </p>
            {campaign.segment?.description && (
              <p className="text-sm text-blue-700 mt-1">
                {campaign.segment.description}
              </p>
            )}
          </div>

          {/* Template Info */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <IconTemplate className="w-5 h-5 text-purple-700" />
              <h3 className="font-semibold text-purple-900">Plantilla</h3>
            </div>
            <p className="text-lg font-bold text-purple-800">
              {campaign.template?.name || "Sin plantilla"}
            </p>
            {campaign.template?.type && (
              <p className="text-sm text-purple-700 mt-1">
                Tipo: {campaign.template.type}
              </p>
            )}
          </div>
        </div>

        {/* Coupon Info (if exists) */}
        {campaign.couponId && (
          <div className="mt-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <IconTicket className="w-5 h-5 text-yellow-700" />
              <h3 className="font-semibold text-yellow-900">
                Cupón Asociado (Opcional)
              </h3>
            </div>
            <p className="text-sm text-yellow-800">
              La campaña incluye un cupón configurado que se enviará a los
              clientes elegibles
            </p>
          </div>
        )}
      </div>

      {/* Execution Flow */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <IconRobot className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Flujo de Ejecución
          </h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <p className="font-semibold text-gray-900">Trigger de Tiempo</p>
              <p className="text-sm text-gray-600">
                El worker ejecuta según la frecuencia:{" "}
                {frequencyLabels[automation.frequency]}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Buscar Clientes Elegibles
              </p>
              <p className="text-sm text-gray-600">
                Ejecuta el segmento "{campaign.segment?.name}" para encontrar
                los clientes que cumplen las condiciones
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <p className="font-semibold text-gray-900">
                Preparar Emails con Plantilla
              </p>
              <p className="text-sm text-gray-600">
                Renderiza la plantilla "{campaign.template?.name}" para cada
                cliente
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <p className="font-semibold text-gray-900">Enviar Emails</p>
              <p className="text-sm text-gray-600">
                Envía los emails a todos los clientes elegibles
                {campaign.couponId && " con cupón incluido"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
