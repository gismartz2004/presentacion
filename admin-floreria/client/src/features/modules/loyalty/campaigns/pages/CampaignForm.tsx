import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  campaignsApi,
  segmentsApi,
  templatesApi,
  couponsApi,
} from "../../services/loyalty-api.service";

export default function CampaignForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: "",
    segmentId: "",
    templateId: "",
    couponId: "",
    startDate: "",
    endDate: "",
    isActive: false,
    showInBanner: false,
    bannerText: "",
    metadata: {} as any,
  });

  const [segments, setSegments] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
    if (isEdit && id) {
      loadCampaign();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const loadData = async () => {
    try {
      const [segmentsRes, templatesRes, couponsRes] = await Promise.all([
        segmentsApi.getAll(),
        templatesApi.getAll(),
        couponsApi.getAll().catch(() => ({ data: [] })), // No bloquear si falla
      ]);
      setSegments(segmentsRes.data);
      setTemplates(templatesRes.data);
      setCoupons(couponsRes.data.filter((c: any) => c.isActive));
    } catch (err) {
      setError("Error al cargar datos");
    }
  };

  const loadCampaign = async () => {
    try {
      setLoading(true);
      const response = await campaignsApi.getById(id!);
      const data = response.data;

      setFormData({
        name: data.name || "",
        segmentId: data.segmentId || "",
        templateId: data.templateId || "",
        couponId: data.couponId || "",
        startDate: data.startDate
          ? new Date(data.startDate).toISOString().slice(0, 16)
          : "",
        endDate: data.endDate
          ? new Date(data.endDate).toISOString().slice(0, 16)
          : "",
        isActive: data.isActive || false,
        showInBanner: data.showInBanner || false,
        bannerText: data.bannerText || "",
        metadata: data.metadata || {},
      });
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al cargar la campaña");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: formData.name,
        segmentId: formData.segmentId,
        templateId: formData.templateId,
        couponId: formData.couponId || undefined,
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : undefined,
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : undefined,
        isActive: formData.isActive,
        showInBanner: formData.showInBanner,
        bannerText: formData.bannerText || undefined,
        metadata:
          Object.keys(formData.metadata).length > 0
            ? formData.metadata
            : undefined,
      };

      if (isEdit) {
        await campaignsApi.update(id, payload);
      } else {
        await campaignsApi.create(payload);
      }

      navigate("/app/loyalty/campaigns");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error al guardar la campaña");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">
          {isEdit ? "Editar" : "Crear"} Campaña
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
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear"} Campaña
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {loading && (
        <div className="bg-purple-50 border border-purple-200 text-purple-700 px-4 py-3 rounded">
          Cargando datos de la campaña...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Grid de 2 columnas en desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda: Información básica */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">
              Información Básica
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Campaña *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Ej: Campaña Black Friday 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Segmento de Clientes *
              </label>
              <select
                required
                value={formData.segmentId}
                onChange={(e) =>
                  setFormData({ ...formData, segmentId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Seleccionar segmento...</option>
                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                La campaña se enviará a los clientes que cumplan las reglas de
                este segmento
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plantilla de Email *
              </label>
              <select
                required
                value={formData.templateId}
                onChange={(e) =>
                  setFormData({ ...formData, templateId: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Seleccionar plantilla...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.type})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Columna derecha: Cupón y variables */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">
              Cupón y Variables
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cupón Asociado (opcional)
              </label>
              <select
                value={formData.couponId}
                onChange={(e) => {
                  const selectedCouponId = e.target.value;
                  const selectedCoupon = coupons.find(
                    (c) => c.id === selectedCouponId,
                  );

                  if (selectedCoupon) {
                    // Traer fechas del cupón a la campaña
                    setFormData({
                      ...formData,
                      couponId: selectedCouponId,
                      startDate: new Date(selectedCoupon.validFrom)
                        .toISOString()
                        .slice(0, 16),
                      endDate: new Date(selectedCoupon.validUntil)
                        .toISOString()
                        .slice(0, 16),
                    });
                  } else {
                    setFormData({ ...formData, couponId: selectedCouponId });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Sin cupón</option>
                {coupons.map((coupon) => (
                  <option key={coupon.id} value={coupon.id}>
                    {coupon.code} -{" "}
                    {coupon.type === "PERCENTAGE"
                      ? `${coupon.value}%`
                      : `$${coupon.value}`}{" "}
                    ({new Date(coupon.validFrom).toLocaleDateString()} -{" "}
                    {new Date(coupon.validUntil).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Si seleccionas un cupón, las fechas de la campaña se
                sincronizarán automáticamente con las del cupón.
              </p>
            </div>

            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm text-purple-800 mb-2">
                <strong>💡 Variables Disponibles:</strong>
              </p>
              <ul className="text-xs text-purple-700 space-y-1">
                <li>
                  •{" "}
                  <code className="bg-white px-1 rounded">
                    {"{{customerName}}"}
                  </code>{" "}
                  - Nombre del cliente
                </li>
                <li>
                  •{" "}
                  <code className="bg-white px-1 rounded">
                    {"{{customerEmail}}"}
                  </code>{" "}
                  - Email del cliente
                </li>
                {formData.couponId && (
                  <>
                    <li>
                      •{" "}
                      <code className="bg-white px-1 rounded">
                        {"{{couponCode}}"}
                      </code>{" "}
                      - Código único del cupón
                    </li>
                    <li>
                      •{" "}
                      <code className="bg-white px-1 rounded">
                        {"{{discountValue}}"}
                      </code>{" "}
                      - Valor del descuento
                    </li>
                    <li>
                      •{" "}
                      <code className="bg-white px-1 rounded">
                        {"{{expiryDate}}"}
                      </code>{" "}
                      - Fecha de vencimiento
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="border-t pt-4">
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-purple-600">
                  Variables Personalizadas Avanzadas (opcional)
                </summary>
                <div className="mt-3">
                  <textarea
                    value={JSON.stringify(formData.metadata, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setFormData({ ...formData, metadata: parsed });
                      } catch {
                        // Ignorar errores de parseo mientras se escribe
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-purple-500"
                    rows={6}
                    placeholder='{"promoName": "Black Friday"}'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JSON con variables adicionales que se reemplazan en la
                    plantilla como <code>{"{{variableName}}"}</code>. Solo para
                    casos especiales.
                  </p>
                </div>
              </details>
            </div>

            {/* Sección Banner Web */}
            <div className="border-t pt-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Banner Web
              </h3>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="showInBanner"
                  checked={formData.showInBanner}
                  onChange={(e) =>
                    setFormData({ ...formData, showInBanner: e.target.checked })
                  }
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label
                  htmlFor="showInBanner"
                  className="text-sm font-medium text-gray-700"
                >
                  Mostrar en Banner Superior de la Web
                </label>
              </div>

              {formData.showInBanner && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Texto del Banner
                  </label>
                  <input
                    type="text"
                    value={formData.bannerText}
                    onChange={(e) =>
                      setFormData({ ...formData, bannerText: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Ej: ¡OFERTA BLACK FRIDAY! 40% de descuento en todos los productos"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Este texto aparecerá en el banner amarillo superior. Si se
                    deja vacío, se mostrará el nombre de la campaña.
                  </p>
                  <div className="mt-2 p-2 bg-yellow-400 text-black text-center rounded text-xs font-semibold">
                    Vista previa:{" "}
                    {formData.bannerText || formData.name || "Tu mensaje aquí"}
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  💡 <strong>Nota:</strong> Solo las campañas con estado
                  "ACTIVE" y este checkbox marcado aparecerán en el banner. Si
                  hay varias campañas activas, se rotarán automáticamente cada 5
                  segundos.
                </p>
              </div>
            </div>

            {/* Sección Vigencia y Estado */}
            <div className="border-t pt-4 space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Vigencia y Estado
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Inicio
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha Fin
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-700"
                >
                  <span className="font-semibold">Campaña Activa</span>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Solo las campañas activas y dentro de su período de vigencia
                    se mostrarán en la web
                  </p>
                </label>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  ⚠️ <strong>Importante:</strong> Al guardar esta campaña, las
                  fechas se sincronizarán automáticamente con el cupón asociado
                  (si lo hay). Ambos tendrán las mismas fechas de inicio y fin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
