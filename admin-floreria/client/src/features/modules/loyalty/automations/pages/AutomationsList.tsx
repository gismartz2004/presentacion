import { useAutomations } from '../../hooks/useLoyaltyData';
import { Link } from 'react-router-dom';
import { IconPlus, IconRobot } from '@tabler/icons-react';
import { loyaltyApiHelpers } from '../../services/loyalty-api.service';

const frequencyLabels = {
  DAILY: 'Diaria',
  WEEKLY: 'Semanal',
  MONTHLY: 'Mensual',
};

const frequencyColors = {
  DAILY: 'bg-green-100 text-green-800',
  WEEKLY: 'bg-blue-100 text-blue-800',
  MONTHLY: 'bg-purple-100 text-purple-800',
};

export default function AutomationsList() {
  const { automations, loading, error, refetch } = useAutomations();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar la automatización "${name}"?`)) return;

    try {
      await loyaltyApiHelpers.deleteAutomation(id);
      refetch();
    } catch (error) {
      console.error('Error eliminando automatización:', error);
      alert('Error al eliminar la automatización');
    }
  };

  if (loading) return <div className="text-center py-8">Cargando automatizaciones...</div>;
  if (error) return <div className="text-red-600 py-8">Error al cargar automatizaciones</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automatizaciones</h1>
          <p className="text-gray-600 mt-2">Gestiona automatizaciones de email y cupones</p>
        </div>
        <Link
          to="/app/loyalty/automations/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 shadow-md"
        >
          <IconPlus className="w-5 h-5" />
          Crear Automatización
        </Link>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <IconRobot className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900">Ejecución Automática</p>
          <p className="text-blue-800 text-sm mt-1">
            Las automatizaciones ejecutan campañas según la frecuencia configurada (diaria, semanal o mensual).
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaña</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frecuencia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Última Ejecución</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enviados</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {automations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                  <IconRobot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No hay automatizaciones creadas</p>
                  <p className="text-sm mt-2">Crea tu primera automatización para empezar</p>
                </td>
              </tr>
            ) : (
              automations.map((automation) => (
                <tr key={automation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{automation.name}</div>
                    {automation.description && (
                      <div className="text-sm text-gray-500">{automation.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {automation.campaign?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      frequencyColors[automation.frequency as keyof typeof frequencyColors] || 'bg-gray-100 text-gray-800'
                    }`}>
                      {frequencyLabels[automation.frequency as keyof typeof frequencyLabels]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {automation.lastRunAt
                      ? new Date(automation.lastRunAt).toLocaleDateString('es-ES')
                      : 'Nunca'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">{automation._count?.emailLogs || 0}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      automation.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {automation.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                    <Link 
                      to={`/app/loyalty/automations/${automation.id}`} 
                      className="text-green-600 hover:text-green-900 font-medium"
                    >
                      Ver
                    </Link>
                    <Link 
                      to={`/app/loyalty/automations/${automation.id}/edit`} 
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(automation.id, automation.name)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
