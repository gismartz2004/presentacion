import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  couponsApi,
  loyaltyApiHelpers,
} from '../../services/loyalty-api.service';

export default function CouponForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    value: 0,
    minAmount: 0,
    maxUsesPerCustomer: 1,
    maxUsesTotal: undefined as number | undefined,
    validFrom: new Date().toISOString().split("T")[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    isActive: true,
    customerId: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");
  const [generatingCode, setGeneratingCode] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadCoupon();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const loadCoupon = async () => {
    try {
      setLoadingData(true);
      const data = await loyaltyApiHelpers.getCoupon(id!);

      // Mapear datos del backend al estado del formulario
      setFormData({
        code: data.code || "",
        type: data.type || "PERCENTAGE",
        value: data.value || 0,
        minAmount: data.minAmount || 0,
        maxUsesPerCustomer: data.maxUsesPerCustomer || 1,
        maxUsesTotal: data.maxUsesTotal,
        validFrom: data.validFrom
          ? new Date(data.validFrom).toISOString().split("T")[0]
          : "",
        validUntil: data.validUntil
          ? new Date(data.validUntil).toISOString().split("T")[0]
          : "",
        isActive: data.isActive ?? true,
        customerId: data.segmentId || "",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log("Error loading coupon:", message);
      setError("Error al cargar el cupón");
    } finally {
      setLoadingData(false);
    }
  };

  const handleGenerateCode = async () => {
    setGeneratingCode(true);
    try {
      const response = await couponsApi.generateCode("LOYALTY");
      setFormData({ ...formData, code: response.data.code });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log("Error generating code:", message);
      setError("Error al generar código");
    } finally {
      setGeneratingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        code: formData.code,
        type: formData.type,
        value: formData.value,
        minAmount: formData.minAmount || undefined,
        maxUsesPerCustomer: formData.maxUsesPerCustomer || undefined,
        maxUsesTotal: formData.maxUsesTotal || undefined,
        validFrom: new Date(formData.validFrom),
        validUntil: new Date(formData.validUntil),
        isActive: formData.isActive,
        customerId: formData.customerId || undefined,
      };

      if (isEdit) {
        await couponsApi.update(id!, payload);
      } else {
        await couponsApi.create(payload);
      }

      navigate("/app/coupons");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log("Error saving coupon:", message);
      setError("Error al guardar el cupón");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">
          {isEdit ? "Editar" : "Crear"} Cupón
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
            {loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}{" "}
            Cupón
          </button>
        </div>
      </div>

      {loadingData && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          Cargando datos del cupón...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form className="space-y-6">
        {/* Grid de 2 columnas en desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda: Información del cupón */}
          <div className="space-y-6">
            {/* Código y tipo */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">
                Código del Cupón
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 font-mono text-lg"
                    placeholder="LOYALTY2024"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    disabled={generatingCode}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 whitespace-nowrap"
                  >
                    {generatingCode ? "Generando..." : "Generar"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  El código que los clientes usarán en el checkout
                </p>
              </div>
            </div>

            {/* Valor del descuento */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">
                Valor del Descuento
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Descuento *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as "PERCENTAGE" | "FIXED",
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="PERCENTAGE">Porcentaje (%)</option>
                  <option value="FIXED">Valor Fijo ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-lg"
                  placeholder={formData.type === "PERCENTAGE" ? "10" : "5.00"}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.type === "PERCENTAGE"
                    ? "Porcentaje sin el símbolo %"
                    : "Valor en dólares"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto mínimo de compra ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.minAmount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minAmount: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="0 = sin mínimo"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Compra mínima para aplicar el cupón
                </p>
              </div>
            </div>
          </div>

          {/* Columna derecha: Restricciones y vigencia */}
          <div className="space-y-6">
            {/* Restricciones de uso */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">
                Restricciones de Uso
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usos máximos por cliente
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxUsesPerCustomer}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUsesPerCustomer: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Veces que cada cliente puede usar este cupón
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usos máximos totales
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxUsesTotal || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxUsesTotal: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Ilimitado"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Total de veces que se puede usar (todos los clientes)
                </p>
              </div>
            </div>

            {/* Vigencia */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">
                Período de Vigencia
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Válido desde *
                </label>
                <input
                  type="date"
                  required
                  value={formData.validFrom}
                  onChange={(e) =>
                    setFormData({ ...formData, validFrom: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Válido hasta *
                </label>
                <input
                  type="date"
                  required
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData({ ...formData, validUntil: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Cliente específico */}
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">
                Opciones Avanzadas
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de Cliente Específico (opcional)
                </label>
                <input
                  type="text"
                  value={formData.customerId}
                  onChange={(e) =>
                    setFormData({ ...formData, customerId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Dejar vacío para cupón general"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Si se especifica, solo ese cliente podrá usar el cupón
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
                  Cupón activo
                </label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
