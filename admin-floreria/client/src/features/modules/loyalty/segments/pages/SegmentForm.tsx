import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { segmentsApi } from "../services/segment-service";
import { loyaltyApiHelpers } from "../../services/loyalty-api.service";

export default function SegmentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
    rules: {
      lastPurchaseDays: {
        gte: undefined as number | undefined,
        lte: undefined as number | undefined,
        gt: undefined as number | undefined,
        lt: undefined as number | undefined,
      },
      totalSpent: {
        gte: undefined as number | undefined,
        lte: undefined as number | undefined,
        gt: undefined as number | undefined,
        lt: undefined as number | undefined,
      },
      purchaseCount: {
        gte: undefined as number | undefined,
        lte: undefined as number | undefined,
        gt: undefined as number | undefined,
        lt: undefined as number | undefined,
      },
      city: {
        in: [] as string[],
        notIn: [] as string[],
        equals: undefined as string | undefined,
      },
      tags: { in: [] as string[] },
      isActiveCustomer: undefined as boolean | undefined,
      acceptsMarketing: undefined as boolean | undefined,
      birthday: {
        month: undefined as number | undefined,
        day: undefined as number | undefined,
      },
    },
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit && id) {
      loadSegment();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit]);

  const loadSegment = async () => {
    try {
      setLoadingData(true);
      const data = await loyaltyApiHelpers.getSegment(id!);

      data.rules = JSON.parse(data.rules);

      // Mapear datos del backend al estado del formulario
      setFormData({
        name: data.name || "",
        description: data.description || "",
        isActive: data.isActive ?? true,
        rules: {
          lastPurchaseDays: {
            gte: data.rules?.lastPurchaseDays?.gte,
            lte: data.rules?.lastPurchaseDays?.lte,
            gt: data.rules?.lastPurchaseDays?.gt,
            lt: data.rules?.lastPurchaseDays?.lt,
          },
          totalSpent: {
            gte: data.rules?.totalSpent?.gte,
            lte: data.rules?.totalSpent?.lte,
            gt: data.rules?.totalSpent?.gt,
            lt: data.rules?.totalSpent?.lt,
          },
          purchaseCount: {
            gte: data.rules?.purchaseCount?.gte,
            lte: data.rules?.purchaseCount?.lte,
            gt: data.rules?.purchaseCount?.gt,
            lt: data.rules?.purchaseCount?.lt,
          },
          city: {
            in: data.rules?.city?.in || [],
            notIn: data.rules?.city?.notIn || [],
            equals: data.rules?.city?.equals,
          },
          tags: { in: data.rules?.tags?.in || [] },
          isActiveCustomer: data.rules?.isActiveCustomer,
          acceptsMarketing: data.rules?.acceptsMarketing,
          birthday: {
            month: data.rules?.birthday?.month,
            day: data.rules?.birthday?.day,
          },
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Error al cargar el segmento");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // Limpiar reglas vacías
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cleanRules: Record<string, any> = {};

      // lastPurchaseDays
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lpd: any = {};
      if (formData.rules.lastPurchaseDays.gte)
        lpd.gte = formData.rules.lastPurchaseDays.gte;
      if (formData.rules.lastPurchaseDays.lte)
        lpd.lte = formData.rules.lastPurchaseDays.lte;
      if (formData.rules.lastPurchaseDays.gt)
        lpd.gt = formData.rules.lastPurchaseDays.gt;
      if (formData.rules.lastPurchaseDays.lt)
        lpd.lt = formData.rules.lastPurchaseDays.lt;
      if (Object.keys(lpd).length > 0) cleanRules.lastPurchaseDays = lpd;

      // totalSpent
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ts: any = {};
      if (formData.rules.totalSpent.gte) ts.gte = formData.rules.totalSpent.gte;
      if (formData.rules.totalSpent.lte) ts.lte = formData.rules.totalSpent.lte;
      if (formData.rules.totalSpent.gt) ts.gt = formData.rules.totalSpent.gt;
      if (formData.rules.totalSpent.lt) ts.lt = formData.rules.totalSpent.lt;
      if (Object.keys(ts).length > 0) cleanRules.totalSpent = ts;

      // purchaseCount
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pc: any = {};
      if (formData.rules.purchaseCount.gte)
        pc.gte = formData.rules.purchaseCount.gte;
      if (formData.rules.purchaseCount.lte)
        pc.lte = formData.rules.purchaseCount.lte;
      if (formData.rules.purchaseCount.gt)
        pc.gt = formData.rules.purchaseCount.gt;
      if (formData.rules.purchaseCount.lt)
        pc.lt = formData.rules.purchaseCount.lt;
      if (Object.keys(pc).length > 0) cleanRules.purchaseCount = pc;

      // city
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const city: any = {};
      if (formData.rules.city.in.length > 0) city.in = formData.rules.city.in;
      if (formData.rules.city.notIn.length > 0)
        city.notIn = formData.rules.city.notIn;
      if (formData.rules.city.equals) city.equals = formData.rules.city.equals;
      if (Object.keys(city).length > 0) cleanRules.city = city;

      // tags
      if (formData.rules.tags.in.length > 0) {
        cleanRules.tags = { in: formData.rules.tags.in };
      }

      // isActiveCustomer
      if (formData.rules.isActiveCustomer !== undefined) {
        cleanRules.isActiveCustomer = formData.rules.isActiveCustomer;
      }

      // acceptsMarketing
      if (formData.rules.acceptsMarketing !== undefined) {
        cleanRules.acceptsMarketing = formData.rules.acceptsMarketing;
      }

      // birthday
      if (formData.rules.birthday.month || formData.rules.birthday.day) {
        cleanRules.birthday = {};
        if (formData.rules.birthday.month)
          cleanRules.birthday.month = formData.rules.birthday.month;
        if (formData.rules.birthday.day)
          cleanRules.birthday.day = formData.rules.birthday.day;
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive,
        rules: cleanRules,
      };

      if (isEdit) {
        await segmentsApi.update(id, payload);
      } else {
        await segmentsApi.create(payload);
      }

      navigate(-1);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Error al guardar el segmento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">
          {isEdit ? "Editar" : "Crear"} Segmento
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
            Segmento
          </button>
        </div>
      </div>

      {loadingData && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          Cargando datos del segmento...
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
                Nombre del Segmento *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Clientes VIP"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Describe el segmento..."
              />
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
                Segmento activo
              </label>
            </div>
          </div>

          {/* Columna derecha: Reglas de comportamiento */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">
              Reglas de Comportamiento
            </h2>
            <p className="text-sm text-gray-600">
              Filtra clientes según su actividad de compra.
            </p>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Días sin compra
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  value={formData.rules.lastPurchaseDays.gte || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rules: {
                        ...formData.rules,
                        lastPurchaseDays: {
                          ...formData.rules.lastPurchaseDays,
                          gte: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        },
                      },
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Mínimo (≥)"
                />
                <input
                  type="number"
                  min="0"
                  value={formData.rules.lastPurchaseDays.lte || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rules: {
                        ...formData.rules,
                        lastPurchaseDays: {
                          ...formData.rules.lastPurchaseDays,
                          lte: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        },
                      },
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Máximo (≤)"
                />
                <input
                  type="number"
                  min="0"
                  value={formData.rules.lastPurchaseDays.gt || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rules: {
                        ...formData.rules,
                        lastPurchaseDays: {
                          ...formData.rules.lastPurchaseDays,
                          gt: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        },
                      },
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Mayor que (>)"
                />
                <input
                  type="number"
                  min="0"
                  value={formData.rules.lastPurchaseDays.lt || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rules: {
                        ...formData.rules,
                        lastPurchaseDays: {
                          ...formData.rules.lastPurchaseDays,
                          lt: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        },
                      },
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Menor que (<)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Gasto total ($)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.rules.totalSpent.gte || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rules: {
                        ...formData.rules,
                        totalSpent: {
                          ...formData.rules.totalSpent,
                          gte: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        },
                      },
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Mínimo (≥)"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.rules.totalSpent.lte || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rules: {
                        ...formData.rules,
                        totalSpent: {
                          ...formData.rules.totalSpent,
                          lte: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        },
                      },
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Máximo (≤)"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.rules.totalSpent.gt || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rules: {
                        ...formData.rules,
                        totalSpent: {
                          ...formData.rules.totalSpent,
                          gt: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        },
                      },
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Mayor que (>)"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.rules.totalSpent.lt || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rules: {
                        ...formData.rules,
                        totalSpent: {
                          ...formData.rules.totalSpent,
                          lt: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        },
                      },
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Menor que (<)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Número de compras
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="0"
                  value={formData.rules.purchaseCount.gte || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rules: {
                        ...formData.rules,
                        purchaseCount: {
                          ...formData.rules.purchaseCount,
                          gte: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        },
                      },
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Mínimo (≥)"
                />
                <input
                  type="number"
                  min="0"
                  value={formData.rules.purchaseCount.lte || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rules: {
                        ...formData.rules,
                        purchaseCount: {
                          ...formData.rules.purchaseCount,
                          lte: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        },
                      },
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Máximo (≤)"
                />
                <input
                  type="number"
                  min="0"
                  value={formData.rules.purchaseCount.gt || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rules: {
                        ...formData.rules,
                        purchaseCount: {
                          ...formData.rules.purchaseCount,
                          gt: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        },
                      },
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Mayor que (>)"
                />
                <input
                  type="number"
                  min="0"
                  value={formData.rules.purchaseCount.lt || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rules: {
                        ...formData.rules,
                        purchaseCount: {
                          ...formData.rules.purchaseCount,
                          lt: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        },
                      },
                    })
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Menor que (<)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reglas demográficas y preferencias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preferencias de marketing */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">
              Preferencias
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente activo
              </label>
              <select
                value={
                  formData.rules.isActiveCustomer === undefined
                    ? ""
                    : String(formData.rules.isActiveCustomer)
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rules: {
                      ...formData.rules,
                      isActiveCustomer:
                        e.target.value === ""
                          ? undefined
                          : e.target.value === "true",
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin filtro</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acepta marketing
              </label>
              <select
                value={
                  formData.rules.acceptsMarketing === undefined
                    ? ""
                    : String(formData.rules.acceptsMarketing)
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rules: {
                      ...formData.rules,
                      acceptsMarketing:
                        e.target.value === ""
                          ? undefined
                          : e.target.value === "true",
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin filtro</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (separadas por coma)
              </label>
              <input
                type="text"
                value={formData.rules.tags.in.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rules: {
                      ...formData.rules,
                      tags: {
                        in: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: vip, premium, nuevo"
              />
              <p className="text-xs text-gray-500 mt-1">
                Etiquetas para categorizar clientes
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mes de cumpleaños
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={formData.rules.birthday.month || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rules: {
                        ...formData.rules,
                        birthday: {
                          ...formData.rules.birthday,
                          month: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1-12"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Día de cumpleaños
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={formData.rules.birthday.day || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rules: {
                        ...formData.rules,
                        birthday: {
                          ...formData.rules.birthday,
                          day: e.target.value
                            ? Number(e.target.value)
                            : undefined,
                        },
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1-31"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Útil para campañas de cumpleaños
            </p>
          </div>

          {/* Ubicación geográfica */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">
              Ubicación Geográfica
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Incluir ciudades (separadas por coma)
              </label>
              <input
                type="text"
                value={formData.rules.city.in.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rules: {
                      ...formData.rules,
                      city: {
                        ...formData.rules.city,
                        in: e.target.value
                          .split(",")
                          .map((c) => c.trim())
                          .filter(Boolean),
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Quito, Guayaquil, Cuenca"
              />
              <p className="text-xs text-gray-500 mt-1">
                Los clientes deben estar en una de estas ciudades
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excluir ciudades (separadas por coma)
              </label>
              <input
                type="text"
                value={formData.rules.city.notIn.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rules: {
                      ...formData.rules,
                      city: {
                        ...formData.rules.city,
                        notIn: e.target.value
                          .split(",")
                          .map((c) => c.trim())
                          .filter(Boolean),
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Manta, Machala"
              />
              <p className="text-xs text-gray-500 mt-1">
                Excluir clientes de estas ciudades
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad específica
              </label>
              <input
                type="text"
                value={formData.rules.city.equals || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rules: {
                      ...formData.rules,
                      city: {
                        ...formData.rules.city,
                        equals: e.target.value || undefined,
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Quito"
              />
              <p className="text-xs text-gray-500 mt-1">
                Solo clientes de esta ciudad exacta
              </p>
            </div>
          </div>
        </div>

        {/* Botones */}
        {/* <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/app/loyalty/segments")}
              className="w-full sm:w-auto px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? "Guardando..." : isEdit ? "Actualizar" : "Crear"}{" "}
              Segmento
            </button>
          </div>
        </div> */}
      </form>
    </div>
  );
}
