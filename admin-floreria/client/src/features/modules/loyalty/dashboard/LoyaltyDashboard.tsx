import { useLoyaltyStats } from "../../loyalty/hooks/useLoyaltyData";
import { Link } from "react-router-dom";
import {
  IconUsers,
  IconMail,
  IconCurrencyDollar,
  IconShoppingBag,
  IconGift,
  IconSend,
  IconRocket,
  IconTrendingUp,
  IconFileText,
} from "@tabler/icons-react";

export default function LoyaltyDashboard() {
  const { stats, loading, error } = useLoyaltyStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-lg text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-red-800 font-medium">
              Error al cargar estadísticas
            </p>
            <p className="text-red-600 text-sm mt-1">
              Por favor, intenta recargar la página
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header con gradiente */}
      {/* <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex items-center gap-3 mb-3">
          <IconSparkles className="w-10 h-10" />
          <h1 className="text-4xl font-bold">Fidelización de Clientes</h1>
        </div>
        <p className="text-blue-100 text-lg">
          Gestiona tus clientes, crea campañas personalizadas y aumenta la lealtad de tu base de clientes
        </p>
      </div> */}

      {/* Estadísticas Principales - Cards Mejoradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-full p-3">
              <IconUsers className="w-8 h-8 text-blue-600" />
            </div>
            <IconTrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-sm text-gray-600 font-medium uppercase tracking-wide">
            Total Clientes
          </p>
          <p className="text-4xl font-bold text-gray-900 mt-2">
            {stats?.customers?.total || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Base de clientes registrados
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <IconMail className="w-8 h-8 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
              {stats?.customers?.total > 0
                ? Math.round(
                    (stats?.customers?.withMarketing /
                      stats?.customers?.total) *
                      100,
                  )
                : 0}
              %
            </span>
          </div>
          <p className="text-sm text-gray-600 font-medium uppercase tracking-wide">
            Con Marketing
          </p>
          <p className="text-4xl font-bold text-gray-900 mt-2">
            {stats?.customers?.withMarketing || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">Aceptan comunicaciones</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 rounded-full p-3">
              <IconCurrencyDollar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 font-medium uppercase tracking-wide">
            Gasto Promedio
          </p>
          <p className="text-4xl font-bold text-gray-900 mt-2">
            ${stats?.customers?.averageSpent?.toFixed(2) || "0.00"}
          </p>
          <p className="text-xs text-gray-500 mt-2">Por cliente activo</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-yellow-100 rounded-full p-3">
              <IconShoppingBag className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 font-medium uppercase tracking-wide">
            Con Compras
          </p>
          <p className="text-4xl font-bold text-gray-900 mt-2">
            {stats?.customers?.withPurchases || 0}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Clientes que han comprado
          </p>
        </div>
      </div>

      {/* Sección de Resumen con Cards Mejoradas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cupones Card */}
        <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl shadow-lg p-6 border border-orange-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-orange-500 rounded-lg p-2">
              <IconGift className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Cupones</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total creados</span>
              <span className="text-2xl font-bold text-gray-900">
                {stats?.coupons?.total || 0}
              </span>
            </div>
            <div className="h-px bg-orange-200"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Activos</span>
              <span className="text-lg font-semibold text-green-600">
                {stats?.coupons?.active || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Expirados</span>
              <span className="text-lg font-semibold text-red-600">
                {stats?.coupons?.expired || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total de usos</span>
              <span className="text-lg font-semibold text-blue-600">
                {stats?.coupons?.totalUsages || 0}
              </span>
            </div>
          </div>
          <Link
            to="/app/loyalty/coupons"
            className="mt-6 block text-center bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Gestionar Cupones
          </Link>
        </div>

        {/* Campañas Card */}
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-blue-500 rounded-lg p-2">
              <IconSend className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Campañas</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total campañas</span>
              <span className="text-2xl font-bold text-gray-900">
                {stats?.campaigns?.total || 0}
              </span>
            </div>
            <div className="h-px bg-blue-200"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Borradores</span>
              <span className="text-lg font-semibold text-gray-500">
                {stats?.campaigns?.draft || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Enviadas</span>
              <span className="text-lg font-semibold text-green-600">
                {stats?.campaigns?.sent || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Emails enviados</span>
              <span className="text-lg font-semibold text-purple-600">
                {stats?.campaigns?.totalEmailsSent || 0}
              </span>
            </div>
          </div>
          <Link
            to="/app/loyalty/campaigns"
            className="mt-6 block text-center bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Ver Campañas
          </Link>
        </div>

        {/* Automatizaciones Card */}
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-6 border border-purple-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="bg-purple-500 rounded-lg p-2">
              <IconRocket className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Automatizaciones
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Configuradas</span>
              <span className="text-2xl font-bold text-gray-900">
                {stats?.automations?.total || 0}
              </span>
            </div>
            <div className="h-px bg-purple-200"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Activas</span>
              <span className="text-lg font-semibold text-green-600">
                {stats?.automations?.active || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Emails enviados</span>
              <span className="text-lg font-semibold text-purple-600">
                {stats?.automations?.totalEmailsSent || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Última ejecución</span>
              <span className="text-xs text-gray-500">
                {stats?.automations?.lastRun
                  ? new Date(stats.automations.lastRun).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>
          </div>
          <Link
            to="/app/loyalty/automations"
            className="mt-6 block text-center bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 transition-colors font-medium"
          >
            Configurar Automatizaciones
          </Link>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            to="/app/loyalty/segments"
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-all group"
          >
            <div className="bg-blue-500 rounded-lg p-3 group-hover:scale-110 transition-transform">
              <IconUsers className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Segmentos</p>
              <p className="text-sm text-gray-600">Crear grupos</p>
            </div>
          </Link>

          <Link
            to="/app/loyalty/coupons/new"
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg hover:shadow-md transition-all group"
          >
            <div className="bg-orange-500 rounded-lg p-3 group-hover:scale-110 transition-transform">
              <IconGift className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Nuevo Cupón</p>
              <p className="text-sm text-gray-600">Crear descuento</p>
            </div>
          </Link>

          <Link
            to="/app/loyalty/templates/new"
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg hover:shadow-md transition-all group"
          >
            <div className="bg-indigo-500 rounded-lg p-3 group-hover:scale-110 transition-transform">
              <IconFileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Nueva Plantilla</p>
              <p className="text-sm text-gray-600">Crear email</p>
            </div>
          </Link>

          <Link
            to="/app/loyalty/campaigns/new"
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-all group"
          >
            <div className="bg-purple-500 rounded-lg p-3 group-hover:scale-110 transition-transform">
              <IconSend className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Nueva Campaña</p>
              <p className="text-sm text-gray-600">Enviar emails</p>
            </div>
          </Link>

          <Link
            to="/app/loyalty/automations"
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg hover:shadow-md transition-all group"
          >
            <div className="bg-green-500 rounded-lg p-3 group-hover:scale-110 transition-transform">
              <IconRocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Automatizar</p>
              <p className="text-sm text-gray-600">Configurar flujos</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
