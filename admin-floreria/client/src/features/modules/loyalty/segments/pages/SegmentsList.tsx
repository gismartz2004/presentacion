import { useSegments } from "../../hooks/useLoyaltyData";
import { Link } from "react-router-dom";
import { IconUsers, IconPlus, IconEye, IconTarget } from "@tabler/icons-react";

export default function SegmentsList() {
  const { segments, loading, error } = useSegments();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-lg text-gray-600">Cargando segmentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
        <p className="text-red-800 font-medium">Error al cargar segmentos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Segmentos</h1>
        <Link
          to="/app/loyalty/segments/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Crear Segmento
        </Link>
      </div>
      {/* Segments Grid */}
      {segments && segments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border border-gray-200 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        segment.isActive ? "bg-green-100" : "bg-gray-100"
                      }`}
                    >
                      <IconTarget
                        className={`w-6 h-6 ${
                          segment.isActive ? "text-green-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {segment.name}
                      </h3>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      segment.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {segment.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                  {segment.description || "Sin descripción"}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <IconTarget className="w-4 h-4" />
                      <span>{segment._count?.campaigns || 0} campañas</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-3 flex items-center justify-end gap-2 border-t border-gray-200">
                <Link
                  to={`/app/loyalty/segments/${segment.id}`}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  <IconEye className="w-4 h-4" />
                  Ver
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <IconUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay segmentos creados
          </h3>
          <p className="text-gray-600 mb-6">
            Crea tu primer segmento para organizar tus clientes
          </p>
          <Link
            to="/app/loyalty/segments/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <IconPlus className="w-5 h-5" />
            Crear Primer Segmento
          </Link>
        </div>
      )}
    </div>
  );
}
