import { useCampaigns } from '../../hooks/useLoyaltyData';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { IconPlus, IconMail, IconTrash } from '@tabler/icons-react';
import { campaignsApi, loyaltyApiHelpers } from '../../services/loyalty-api.service';

export default function CampaignsList() {
  const { campaigns, loading, error, refetch } = useCampaigns();
  const [sending, setSending] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleSendCampaign = async (id: string) => {
    if (!confirm('¿Estás seguro de enviar esta campaña? Esta acción no se puede deshacer.')) {
      return;
    }

    setSending(id);
    try {
      await campaignsApi.send(id);
      alert('Campaña enviada exitosamente');
      refetch();
    } catch (err: any) {
      alert(`Error al enviar campaña: ${err.response?.data?.message || err.message}`);
    } finally {
      setSending(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta campaña? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeleting(id);
    try {
      await loyaltyApiHelpers.deleteCampaign(id);
      alert('Campaña eliminada exitosamente');
      refetch();
    } catch (err: any) {
      alert(`Error al eliminar: ${err.response?.data?.message || err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="text-center py-8">Cargando campañas...</div>;
  if (error) return <div className="text-red-600 py-8">Error al cargar campañas</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <IconMail className="w-8 h-8 text-purple-600" />
            Campañas de Email
          </h1>
          <p className="text-gray-600 mt-1">Gestiona tus campañas de marketing por email</p>
        </div>
        <Link
          to="/app/loyalty/campaigns/new"
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors shadow-lg"
        >
          <IconPlus className="w-5 h-5" />
          Crear Campaña
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Segmento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plantilla</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enviados</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {campaigns.map((campaign: any) => (
              <tr key={campaign.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{campaign.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{campaign.segment?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{campaign.template?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    campaign.status === 'SENT'
                      ? 'bg-green-100 text-green-800'
                      : campaign.status === 'DRAFT'
                      ? 'bg-gray-100 text-gray-800'
                      : campaign.status === 'FAILED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{campaign._count?.emailLogs || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-3">
                    <Link to={`/app/loyalty/campaigns/${campaign.id}`} className="text-blue-600 hover:text-blue-900 font-medium">
                      Ver
                    </Link>
                    {campaign.status === 'DRAFT' && (
                      <>
                        <Link to={`/app/loyalty/campaigns/${campaign.id}/edit`} className="text-green-600 hover:text-green-900 font-medium">
                          Editar
                        </Link>
                        <button
                          onClick={() => handleSendCampaign(campaign.id)}
                          disabled={sending === campaign.id}
                          className="text-purple-600 hover:text-purple-900 disabled:text-gray-400 font-medium"
                        >
                          {sending === campaign.id ? 'Enviando...' : 'Enviar'}
                        </button>
                        <button
                          onClick={() => handleDelete(campaign.id)}
                          disabled={deleting === campaign.id}
                          className="text-red-600 hover:text-red-900 disabled:text-gray-400"
                          title="Eliminar"
                        >
                          <IconTrash className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
