import { useCoupons } from "../../hooks/useLoyaltyData";
import { Link } from "react-router-dom";
import {
  IconGift,
  IconPlus,
  IconEdit,
  IconEye,
  IconTag,
  IconPercentage,
  IconCurrencyDollar,
} from "@tabler/icons-react";

export default function CouponsList() {
  const { coupons, loading, error } = useCoupons();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent mb-4"></div>
          <p className="text-lg text-gray-600">Cargando cupones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
        <p className="text-red-800 font-medium">Error al cargar cupones</p>
      </div>
    );
  }

  const isActive = (coupon: any) => {
    return coupon.isActive && new Date(coupon.validUntil) > new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <IconGift className="w-10 h-10" />
            Cupones y Promociones
          </h1>
          <p className="text-gray-600 mt-1">
            Crea códigos de descuento para tus clientes
          </p>
        </div>
        <Link
          to="/app/coupons/new"
          className="flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-lg hover:bg-orange-50 transition-colors font-semibold shadow-lg"
        >
          <IconPlus className="w-5 h-5" />
          Crear Cupón
        </Link>
      </div>

      {/* Coupons Grid */}
      {coupons && coupons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon: any) => (
            <div
              key={coupon.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-dashed overflow-hidden group"
              style={{
                borderColor: isActive(coupon) ? "#10b981" : "#ef4444",
              }}
            >
              <div className="p-6">
                {/* Código del cupón destacado */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <IconTag className="w-5 h-5 text-orange-600" />
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        isActive(coupon)
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {isActive(coupon) ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  <p className="text-2xl font-mono font-bold text-orange-600 text-center tracking-wider">
                    {coupon.code}
                  </p>
                </div>

                {/* Valor del descuento */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  {coupon.type === "PERCENTAGE" ? (
                    <>
                      <IconPercentage className="w-6 h-6 text-purple-600" />
                      <span className="text-3xl font-bold text-purple-600">
                        {coupon.value}%
                      </span>
                      <span className="text-sm text-gray-600">
                        de descuento
                      </span>
                    </>
                  ) : (
                    <>
                      <IconCurrencyDollar className="w-6 h-6 text-green-600" />
                      <span className="text-3xl font-bold text-green-600">
                        ${coupon.value}
                      </span>
                      <span className="text-sm text-gray-600">
                        de descuento
                      </span>
                    </>
                  )}
                </div>

                {/* Estadísticas de uso */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Usos:</span>
                    <span className="font-semibold text-gray-900">
                      {coupon.usesTotal} / {coupon.maxUsesTotal || "∞"}
                    </span>
                  </div>
                </div>

                {/* Vigencia */}
                <div className="text-xs text-gray-500 mb-4">
                  <div className="flex items-center justify-between">
                    <span>Desde:</span>
                    <span className="font-medium">
                      {new Date(coupon.validFrom).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hasta:</span>
                    <span className="font-medium">
                      {new Date(coupon.validUntil).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-end gap-2 border-t border-gray-200">
                <Link
                  to={`/app/coupons/${coupon.id}`}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <IconEye className="w-4 h-4" />
                  Ver
                </Link>
                <Link
                  to={`/app/coupons/${coupon.id}/edit`}
                  className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  <IconEdit className="w-4 h-4" />
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <IconGift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay cupones creados
          </h3>
          <p className="text-gray-600 mb-6">
            Crea tu primer cupón para ofrecer descuentos a tus clientes
          </p>
          <Link
            to="/app/coupons/new"
            className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
          >
            <IconPlus className="w-5 h-5" />
            Crear Primer Cupón
          </Link>
        </div>
      )}
    </div>
  );
}
