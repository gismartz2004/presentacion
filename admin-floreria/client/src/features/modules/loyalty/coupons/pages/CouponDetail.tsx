import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  IconArrowLeft, IconEdit, IconTrash, IconGift, IconPercentage,
  IconCurrencyDollar, IconUsers, IconCalendar, IconTag,
  IconAlertCircle, IconTrendingUp
} from '@tabler/icons-react';
import { loyaltyApiHelpers } from '../../services/loyalty-api.service';

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  minAmount?: number;
  maxUsesTotal?: number;
  maxUsesPerCustomer?: number;
  usesTotal: number;
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  segmentId?: string;
  createdAt: string;
  updatedAt: string;
  segment?: {
    id: string;
    name: string;
  };
  usages?: Array<{
    id: string;
    usedAt: string;
    orderId: string;
    orderTotal?: number;
    discountAmount?: number;
    customer?: {
      email: string;
    };
  }>;
}

export default function CouponDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadCoupon();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCoupon = async () => {
    try {
      setLoading(true);
      const data = await loyaltyApiHelpers.getCoupon(id!);
      setCoupon(data);
    } catch (err: unknown) {
      setError((err as Error).message || 'Error al cargar el cupón');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar este cupón? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      setDeleting(true);
      await loyaltyApiHelpers.deleteCoupon(id!);
      navigate('/app/coupons');
    } catch (err: unknown) {
      alert((err as Error).message || 'Error al eliminar el cupón');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleActive = async () => {
    if (!coupon) return;

    try {
      const updated = await loyaltyApiHelpers.updateCoupon(id!, {
        isActive: !coupon.isActive,
      });
      setCoupon(updated);
    } catch (err: unknown) {
      alert((err as Error).message || 'Error al actualizar el cupón');
    }
  };

  const isExpired = () => {
    if (!coupon) return false;
    return new Date(coupon.validUntil) < new Date();
  };

  const isMaxUsesReached = () => {
    if (!coupon || !coupon.maxUsesTotal) return false;
    return coupon.usesTotal >= coupon.maxUsesTotal;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-600 border-r-transparent mb-4"></div>
          <p className="text-lg text-gray-600">Cargando cupón...</p>
        </div>
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <IconAlertCircle className="w-6 h-6 text-red-600" />
            <p className="text-red-800 font-medium">{error || 'Cupón no encontrado'}</p>
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
            to="/app/coupons"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <IconArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <IconGift className="w-8 h-8 text-orange-600" />
              <h1 className="text-3xl font-bold text-gray-900">{coupon.code}</h1>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                coupon.isActive && !isExpired() && !isMaxUsesReached()
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {coupon.isActive && !isExpired() && !isMaxUsesReached() ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <p className="text-gray-600 mt-1">
              {coupon.type === 'PERCENTAGE' ? `${coupon.value}% de descuento` : `$${coupon.value} de descuento`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleActive}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              coupon.isActive
                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {coupon.isActive ? 'Desactivar' : 'Activar'}
          </button>
          <Link
            to={`/app/coupons/${id}/edit`}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
          >
            <IconEdit className="w-5 h-5" />
            Editar
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
          >
            <IconTrash className="w-5 h-5" />
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-purple-100 rounded-lg">
              {coupon.type === 'PERCENTAGE' ? (
                <IconPercentage className="w-6 h-6 text-purple-600" />
              ) : (
                <IconCurrencyDollar className="w-6 h-6 text-green-600" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Valor del descuento</p>
              <p className="text-2xl font-bold text-gray-900">
                {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `$${coupon.value}`}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-blue-100 rounded-lg">
              <IconTrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Usos totales</p>
              <p className="text-2xl font-bold text-gray-900">
                {coupon.usesTotal} {coupon.maxUsesTotal && `/ ${coupon.maxUsesTotal}`}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-green-100 rounded-lg">
              <IconUsers className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Usos por cliente</p>
              <p className="text-2xl font-bold text-gray-900">
                {coupon.maxUsesPerCustomer || '∞'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <IconTag className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Monto mínimo</p>
              <p className="text-2xl font-bold text-gray-900">
                {coupon.minAmount ? `$${coupon.minAmount}` : 'Sin mínimo'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coupon Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <IconCalendar className="w-6 h-6 text-blue-600" />
            Periodo de Validez
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Válido desde:</span>
              <span className="font-semibold text-gray-900">
                {new Date(coupon.validFrom).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Válido hasta:</span>
              <span className="font-semibold text-gray-900">
                {new Date(coupon.validUntil).toLocaleString()}
              </span>
            </div>
            {isExpired() && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <p className="text-red-800 text-sm font-medium">⚠️ Este cupón ha expirado</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <IconTag className="w-6 h-6 text-purple-600" />
            Restricciones
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Monto mínimo de compra:</span>
              <span className="font-semibold text-gray-900">
                {coupon.minAmount ? `$${coupon.minAmount}` : 'Sin mínimo'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Máx. usos totales:</span>
              <span className="font-semibold text-gray-900">
                {coupon.maxUsesTotal || 'Ilimitado'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Máx. usos por cliente:</span>
              <span className="font-semibold text-gray-900">
                {coupon.maxUsesPerCustomer || 'Ilimitado'}
              </span>
            </div>
            {coupon.segment && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-600">Segmento:</span>
                <Link
                  to={`/app/loyalty/segments/${coupon.segment.id}`}
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  {coupon.segment.name} →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Usage History */}
      {coupon.usages && coupon.usages.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <IconTrendingUp className="w-6 h-6 text-green-600" />
            Historial de Uso
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cliente</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID Orden</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Total Orden</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Descuento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coupon.usages.map((usage) => (
                  <tr key={usage.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(usage.usedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{usage.customer?.email || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 font-mono">{usage.orderId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">${usage.orderTotal?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      -${usage.discountAmount?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Información del Sistema</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">ID:</span>
            <span className="ml-2 font-mono text-gray-900">{coupon.id}</span>
          </div>
          <div>
            <span className="text-gray-600">Creado:</span>
            <span className="ml-2 font-medium text-gray-900">
              {new Date(coupon.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
