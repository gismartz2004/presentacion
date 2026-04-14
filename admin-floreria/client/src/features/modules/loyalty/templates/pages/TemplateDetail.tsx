import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { loyaltyApiHelpers } from "../../services/loyalty-api.service";
import {
  IconFileText,
  IconEdit,
  IconTrash,
  IconChevronLeft,
  IconCode,
  IconMail,
  IconCalendar,
} from "@tabler/icons-react";

export default function TemplateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      const data = await loyaltyApiHelpers.getTemplate(id!);
      setTemplate(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Error al cargar la plantilla");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "¿Estás seguro de eliminar esta plantilla? Las campañas que la usen no podrán enviarse."
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      await loyaltyApiHelpers.deleteTemplate(id!);
      navigate("/app/loyalty/templates");
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
        <div className="text-gray-600">Cargando plantilla...</div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error || "Plantilla no encontrada"}
        </div>
        <button
          onClick={() => navigate("/app/loyalty/templates")}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Volver a plantillas
        </button>
      </div>
    );
  }

  const templateTypeLabels: Record<string, string> = {
    BIRTHDAY: 'Cumpleaños',
    WINBACK: 'Reactivación',
    SEASONAL: 'Temporada',
    GENERIC: 'Genérico',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/app/loyalty/templates")}
            className="text-gray-600 hover:text-gray-900"
          >
            <IconChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
            <p className="text-gray-600 mt-1">Detalles de la plantilla</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to={`/app/loyalty/templates/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm font-medium">Tipo</p>
              <p className="text-2xl font-bold mt-2">
                {templateTypeLabels[template.type] || template.type}
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <IconFileText className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Variables</p>
              <p className="text-2xl font-bold mt-2">
                {template.variables?.length || 0}
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <IconCode className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Estado</p>
              <p className="text-2xl font-bold mt-2">
                {template.isActive ? "Activa" : "Inactiva"}
              </p>
            </div>
            <div className="bg-white/20 rounded-full p-3">
              <IconMail className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Information */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <IconFileText className="w-6 h-6 text-indigo-600" />
            Información de la Plantilla
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Nombre</label>
              <p className="text-gray-900 mt-1">{template.name}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Tipo</label>
              <div className="mt-1">
                <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                  {templateTypeLabels[template.type] || template.type}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Asunto</label>
              <p className="text-gray-900 mt-1">{template.subject}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">Estado</label>
              <div className="mt-1">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    template.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {template.isActive ? "Activa" : "Inactiva"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Variables & Dates */}
        <div className="space-y-6">
          {/* Variables */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <IconCode className="w-6 h-6 text-indigo-600" />
              Variables Disponibles
            </h2>
            {template.variables && template.variables.length > 0 ? (
              <div className="space-y-2">
                {template.variables.map((variable: string) => (
                  <div
                    key={variable}
                    className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <code className="text-sm text-indigo-600">
                      {'{{' + variable + '}}'}
                    </code>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No hay variables definidas</p>
            )}
          </div>

          {/* Dates */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <IconCalendar className="w-6 h-6 text-indigo-600" />
              Fechas
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Creada</label>
                <p className="text-gray-900 mt-1">
                  {new Date(template.createdAt).toLocaleString("es-ES", {
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
                  {new Date(template.updatedAt).toLocaleString("es-ES", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HTML Content */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Contenido HTML
        </h2>
        
        {/* Code view */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Código:</h3>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-sm text-green-400 font-mono">
              {template.htmlContent}
            </pre>
          </div>
        </div>

        {/* Preview */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Vista Previa:</h3>
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 overflow-auto max-h-96">
            <div dangerouslySetInnerHTML={{ __html: template.htmlContent }} />
          </div>
        </div>
      </div>
    </div>
  );
}
