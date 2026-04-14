import { useTemplates } from '../../../loyalty/hooks/useLoyaltyData';
import { Link } from 'react-router-dom';
import { loyaltyApiHelpers } from '../../services/loyalty-api.service';
import { useState } from 'react';
import { IconPlus, IconFileText, IconTrash, IconEye } from '@tabler/icons-react';

export default function TemplatesList() {
  const { templates, loading, error, refetch } = useTemplates();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta plantilla? Las campañas que la usen no podrán enviarse.')) {
      return;
    }

    setDeleting(id);
    try {
      await loyaltyApiHelpers.deleteTemplate(id);
      alert('Plantilla eliminada exitosamente');
      refetch();
    } catch (err: any) {
      alert(`Error al eliminar: ${err.response?.data?.message || err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="text-center py-8">Cargando plantillas...</div>;
  if (error) return <div className="text-red-600 py-8">Error al cargar plantillas</div>;

  const templateTypeLabels: Record<string, string> = {
    BIRTHDAY: 'Cumpleaños',
    WINBACK: 'Reactivación',
    SEASONAL: 'Temporada',
    GENERIC: 'Genérico',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <IconFileText className="w-8 h-8 text-indigo-600" />
            Plantillas de Email
          </h1>
          <p className="text-gray-600 mt-1">Gestiona las plantillas para tus campañas</p>
        </div>
        <Link
          to="/app/loyalty/templates/new"
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
        >
          <IconPlus className="w-5 h-5" />
          Crear Plantilla
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asunto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variables</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {templates.map((template: any) => (
              <tr key={template.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{template.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                    {templateTypeLabels[template.type] || template.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{template.subject}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {template.variables?.length || 0} variables
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    template.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-3">
                    <Link 
                      to={`/app/loyalty/templates/${template.id}`} 
                      className="text-blue-600 hover:text-blue-900 font-medium flex items-center gap-1"
                    >
                      <IconEye className="w-4 h-4" />
                      Ver
                    </Link>
                    <Link 
                      to={`/app/loyalty/templates/${template.id}/edit`} 
                      className="text-green-600 hover:text-green-900 font-medium"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(template.id)}
                      disabled={deleting === template.id}
                      className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                      title="Eliminar"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {templates.length === 0 && (
          <div className="text-center py-12">
            <IconFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No hay plantillas creadas</p>
            <p className="text-gray-500 mt-2">Crea tu primera plantilla para comenzar</p>
          </div>
        )}
      </div>
    </div>
  );
}
