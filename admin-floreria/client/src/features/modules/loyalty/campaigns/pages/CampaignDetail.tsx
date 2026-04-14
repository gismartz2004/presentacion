import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  IconMail,
  IconUsers,
  IconCalendar,
  IconSend,
  IconClock,
  IconEdit,
  IconTrash,
  IconFileText,
  IconChevronLeft,
} from "@tabler/icons-react";
import { loyaltyApiHelpers } from "../../services/loyalty-api.service";

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadCampaign();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const data = await loyaltyApiHelpers.getCampaign(id!);
      setCampaign(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Error al cargar la campaña");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "¿Estás seguro de eliminar esta campaña? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      await loyaltyApiHelpers.deleteCampaign(id!);
      navigate("/app/loyalty/campaigns");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      alert(`Error al eliminar: ${message}`);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando campaña...</div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || "Campaña no encontrada"}
        </div>
        <button
          onClick={() => navigate("/app/loyalty/campaigns")}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Volver a campañas
        </button>
      </div>
    );
  }

  const statusColors = {
    DRAFT: "bg-gray-100 text-gray-800",
    SCHEDULED: "bg-blue-100 text-blue-800",
    SENT: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/app/loyalty/campaigns")}
            className="text-gray-600 hover:text-gray-900"
          >
            <IconChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
            <p className="text-gray-600 mt-1">Detalles de la campaña</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {campaign.status === "DRAFT" && (
            <>
              <Link
                to={`/app/loyalty/campaigns/${id}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <IconEdit className="w-4 h-4" />
                Editar
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
              >
                <IconTrash className="w-4 h-4" />
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Estado</p>
              <p className="text-2xl font-bold mt-2">{campaign.status}</p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <IconMail className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Emails Enviados</p>
              <p className="text-2xl font-bold mt-2">
                {campaign._count?.emailLogs || 0}
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <IconSend className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Segmento</p>
              <p className="text-2xl font-bold mt-2 truncate">
                {campaign.segment?.name || "N/A"}
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <IconUsers className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <IconFileText className="w-6 h-6 text-purple-600" />
            Información de la Campaña
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Nombre</label>
              <p className="text-gray-900 mt-1">{campaign.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Estado</label>
              <div className="mt-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[campaign.status as keyof typeof statusColors] ||
                    "bg-gray-100 text-gray-800"
                  }`}
                >
                  {campaign.status}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Segmento de Clientes
              </label>
              <p className="text-gray-900 mt-1">
                {campaign.segment?.name || "N/A"}
              </p>
              {campaign.segment?.description && (
                <p className="text-sm text-gray-600 mt-1">
                  {campaign.segment.description}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Plantilla de Email
              </label>
              <p className="text-gray-900 mt-1">
                {campaign.template?.name || "N/A"}
              </p>
              {campaign.template?.type && (
                <p className="text-sm text-gray-600 mt-1">
                  Tipo: {campaign.template.type}
                </p>
              )}
            </div>

            {campaign.scheduledAt && (
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <IconClock className="w-4 h-4" />
                  Programado Para
                </label>
                <p className="text-gray-900 mt-1">
                  {new Date(campaign.scheduledAt).toLocaleString("es-ES", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Metadata and Dates */}
        <div className="space-y-6">
          {/* Metadata */}
          {campaign.metadata && Object.keys(campaign.metadata).length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Variables Personalizadas
              </h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 overflow-x-auto">
                  {JSON.stringify(campaign.metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <IconCalendar className="w-6 h-6 text-purple-600" />
              Fechas
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Creada
                </label>
                <p className="text-gray-900 mt-1">
                  {new Date(campaign.createdAt).toLocaleString("es-ES", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Última Actualización
                </label>
                <p className="text-gray-900 mt-1">
                  {new Date(campaign.updatedAt).toLocaleString("es-ES", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Logs */}
      {campaign.emailLogs && campaign.emailLogs.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <IconMail className="w-6 h-6 text-purple-600" />
            Historial de Envíos ({campaign.emailLogs.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Error
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaign.emailLogs.map((log: any) => (
                  <tr key={log.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {log.recipientEmail}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          log.status === "SENT"
                            ? "bg-green-100 text-green-800"
                            : log.status === "FAILED"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(log.sentAt || log.createdAt).toLocaleString(
                        "es-ES",
                        {
                          dateStyle: "short",
                          timeStyle: "short",
                        }
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600">
                      {log.error || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
