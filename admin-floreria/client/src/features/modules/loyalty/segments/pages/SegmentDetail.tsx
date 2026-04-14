import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  IconArrowLeft,
  IconEdit,
  IconTrash,
  IconTarget,
  IconUsers,
  IconMail,
  IconCalendar,
  IconActivity,
  IconAlertCircle,
} from "@tabler/icons-react";
import { loyaltyApiHelpers } from "../../services/loyalty-api.service";
import type { Segment, SegmentRules } from "../interfaces/segments-interface";

interface Customer {
  id: string;
  email: string;
  name: string;
  totalSpent?: number;
  purchaseCount?: number;
}

interface Evaluation {
  segment: {
    id: string;
    name: string;
    rules: Record<string, unknown>;
  };
  customersCount: number;
  customers: Customer[];
}

export default function SegmentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [segment, setSegment] = useState<Segment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);

  useEffect(() => {
    if (id) {
      loadSegment();
      evaluateSegment();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadSegment = async () => {
    try {
      setLoading(true);
      const data = await loyaltyApiHelpers.getSegment(id!);
      const segmentRules: SegmentRules = JSON.parse(data.rules as unknown as string);
      data.rules = segmentRules;
      setSegment(data);
    } catch (err: unknown) {
      setError((err as Error).message || "Error al cargar el segmento");
    } finally {
      setLoading(false);
    }
  };

  const evaluateSegment = async () => {
    try {
      setEvaluating(true);
      const data = await loyaltyApiHelpers.evaluateSegment(id!);
      setEvaluation(data);
    } catch (err) {
      console.error("Error evaluating segment:", err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de eliminar este segmento? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      await loyaltyApiHelpers.deleteSegment(id!);
      navigate("/app/loyalty/segments");
    } catch (err: unknown) {
      alert((err as Error).message || "Error al eliminar el segmento");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    if (!segment) return;

    try {
      const updated = await loyaltyApiHelpers.updateSegment(id!, {
        isActive: !segment.isActive,
      });
      setSegment(updated);
    } catch (err: unknown) {
      alert((err as Error).message || "Error al actualizar el segmento");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-lg text-gray-600">Cargando segmento...</p>
        </div>
      </div>
    );
  }

  if (error || !segment) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <IconAlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-red-800 font-medium">
              {error || "Segmento no encontrado"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/app/loyalty/segments"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IconArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <IconTarget className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                {segment.name}
              </h1>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  segment.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {segment.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              {segment.description || "Sin descripción"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleActive}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              segment.isActive
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-green-100 text-green-700 hover:bg-green-200"
            }`}
          >
            {segment.isActive ? "Desactivar" : "Activar"}
          </button>
          <Link
            to={`/app/loyalty/segments/${id}/edit`}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <IconEdit className="w-5 h-5" />
            Editar
          </Link>
          <button
            onClick={handleDelete}
            // disabled={deleting || (segment._count?.campaigns || 0) > 0} // TODO: Enable when backend check is implemented
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconTrash className="w-5 h-5" />
            {deleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 rounded-lg">
              <IconUsers className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Clientes en el segmento</p>
              <p className="text-2xl font-bold text-gray-900">
                {evaluating ? "..." : evaluation?.customersCount || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-100 rounded-lg">
              <IconMail className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Campañas asociadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {/* {segment._count?.campaigns || 0} */} 0
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 rounded-lg">
              <IconActivity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <p className="text-2xl font-bold text-gray-900">
                {segment.isActive ? "Activo" : "Inactivo"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Display */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <IconTarget className="w-6 h-6 text-blue-600" />
          Reglas de Segmentación
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {segment.rules?.lastPurchaseDays && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Días sin compra
              </h3>
              <p className="text-sm text-blue-700">
                {segment.rules.lastPurchaseDays.gte &&
                  `Mínimo: ${segment.rules.lastPurchaseDays.gte} días`}
                {segment.rules.lastPurchaseDays.lte &&
                  `Máximo: ${segment.rules.lastPurchaseDays.lte} días`}
                {segment.rules.lastPurchaseDays.gt &&
                  `Más de: ${segment.rules.lastPurchaseDays.gt} días`}
                {segment.rules.lastPurchaseDays.lt &&
                  `Menos de: ${segment.rules.lastPurchaseDays.lt} días`}
              </p>
            </div>
          )}

          {segment.rules?.totalSpent && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">Gasto total</h3>
              <p className="text-sm text-green-700">
                {segment.rules.totalSpent.gte &&
                  `Mínimo: $${segment.rules.totalSpent.gte}`}
                {segment.rules.totalSpent.lte &&
                  `Máximo: $${segment.rules.totalSpent.lte}`}
                {segment.rules.totalSpent.gt &&
                  `Más de: $${segment.rules.totalSpent.gt}`}
                {segment.rules.totalSpent.lt &&
                  `Menos de: $${segment.rules.totalSpent.lt}`}
              </p>
            </div>
          )}

          {segment.rules?.purchaseCount && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">
                Número de compras
              </h3>
              <p className="text-sm text-purple-700">
                {segment.rules.purchaseCount.gte &&
                  `Mínimo: ${segment.rules.purchaseCount.gte} compras`}
                {segment.rules.purchaseCount.lte &&
                  `Máximo: ${segment.rules.purchaseCount.lte} compras`}
                {segment.rules.purchaseCount.gt &&
                  `Más de: ${segment.rules.purchaseCount.gt} compras`}
                {segment.rules.purchaseCount.lt &&
                  `Menos de: ${segment.rules.purchaseCount.lt} compras`}
              </p>
            </div>
          )}

          {segment.rules?.city && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Ubicación</h3>
              <p className="text-sm text-yellow-700">
                {segment.rules.city.in &&
                  `Ciudades: ${segment.rules.city.in.join(", ")}`}
                {segment.rules.city.notIn &&
                  `Excluir: ${segment.rules.city.notIn.join(", ")}`}
                {segment.rules.city.equals &&
                  `Ciudad específica: ${segment.rules.city.equals}`}
              </p>
            </div>
          )}

          {segment.rules?.acceptsMarketing !== undefined && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h3 className="font-semibold text-indigo-900 mb-2">
                Preferencias de marketing
              </h3>
              <p className="text-sm text-indigo-700">
                {segment.rules.acceptsMarketing
                  ? "Acepta recibir marketing"
                  : "No acepta marketing"}
              </p>
            </div>
          )}

          {segment.rules?.birthday && (
            <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
              <h3 className="font-semibold text-pink-900 mb-2">Cumpleaños</h3>
              <p className="text-sm text-pink-700">
                {segment.rules.birthday.month &&
                  `Mes: ${segment.rules.birthday.month}`}
                {segment.rules.birthday.day &&
                  ` Día: ${segment.rules.birthday.day}`}
              </p>
            </div>
          )}

          {segment.rules?.tags?.in && segment.rules.tags.in.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-900 mb-2">Tags</h3>
              <p className="text-sm text-orange-700">
                {segment.rules.tags.in.join(", ")}
              </p>
            </div>
          )}

          {segment.rules?.isActiveCustomer !== undefined && (
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <h3 className="font-semibold text-teal-900 mb-2">
                Cliente activo
              </h3>
              <p className="text-sm text-teal-700">
                {segment.rules.isActiveCustomer
                  ? "Solo clientes activos"
                  : "Solo clientes inactivos"}
              </p>
            </div>
          )}

          {Object.keys(segment.rules).length === 0 && (
            <div className="col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">
                No hay reglas definidas para este segmento
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Customers in Segment */}
      {evaluation &&
        evaluation.customers &&
        evaluation.customers.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <IconUsers className="w-6 h-6 text-blue-600" />
              Clientes en este Segmento (Primeros 10)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Total Gastado
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Compras
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {evaluation.customers.slice(0, 10).map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {customer.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {customer.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        ${customer.totalSpent?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {customer.purchaseCount || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Associated Campaigns */}
      {segment.campaigns && segment.campaigns.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <IconMail className="w-6 h-6 text-purple-600" />
            Campañas Asociadas
          </h2>
          <div className="space-y-3">
            {segment.campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {campaign.name}
                  </h3>
                  <p className="text-sm text-gray-600">{campaign.subject}</p>
                </div>
                <Link
                  to={`/app/loyalty/campaigns/${campaign.id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  Ver detalles →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <IconCalendar className="w-6 h-6 text-gray-600" />
          Información
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Creado:</span>
            <span className="ml-2 font-medium text-gray-900">
              {new Date(segment.createdAt).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Última actualización:</span>
            <span className="ml-2 font-medium text-gray-900">
              {new Date(segment.updatedAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
