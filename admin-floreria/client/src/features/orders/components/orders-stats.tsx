import { Package, Calendar as CalendarIcon, DollarSign } from "lucide-react";
import { memo, useMemo } from "react";

// Tipado mínimo de Order
interface OrderItem { price: number; quantity: number; }
interface Order { id: string; status: string; totalAmount: number; orderItems: OrderItem[]; }

interface OrdersStatsProps {
  orders: Order[];
}

const boxBase = "rounded-lg p-4 border flex items-center gap-3";
const gradient = (from: string, to: string, border: string) =>
  `bg-gradient-to-r ${from} ${to} border ${border}`;

export const OrdersStats = memo(({ orders }: OrdersStatsProps) => {
  const stats = useMemo(() => {
    return orders.reduce(
      (acc, o) => {
        acc.total += 1;
        acc[o.status.toLowerCase() as keyof typeof acc] = (acc[o.status.toLowerCase() as keyof typeof acc] || 0) + 1;
        acc.totalRevenue += o.totalAmount || 0;
        return acc;
      },
      {
        total: 0,
        pending: 0,
        confirmed: 0,
        preparing: 0,
        ready: 0,
        delivered: 0,
        cancelled: 0,
        totalRevenue: 0,
      }
    );
  }, [orders]);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Resumen de Pedidos</h2>
      <div
        className="grid w-full gap-4 sm:gap-5 lg:gap-6 grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]"
      >
        <StatBox title="Total" value={stats.total} icon={<Package className="size-4 md:size-5 text-white" />} className={gradient("from-blue-50","to-blue-100","border-blue-200")} iconBg="bg-blue-600" />
        <StatBox title="Pendientes" value={stats.pending} icon={<CalendarIcon className="size-4 md:size-5 text-white" />} className={gradient("from-yellow-50","to-yellow-100","border-yellow-200")} iconBg="bg-yellow-500" />
        <StatBox title="Confirmados" value={stats.confirmed} icon={<CalendarIcon className="size-4 md:size-5 text-white" />} className={gradient("from-sky-50","to-sky-100","border-sky-200")} iconBg="bg-sky-500" />
        <StatBox title="Preparando" value={stats.preparing} icon={<CalendarIcon className="size-4 md:size-5 text-white" />} className={gradient("from-orange-50","to-orange-100","border-orange-200")} iconBg="bg-orange-500" />
        <StatBox title="Listos" value={stats.ready} icon={<CalendarIcon className="size-4 md:size-5 text-white" />} className={gradient("from-emerald-50","to-emerald-100","border-emerald-200")} iconBg="bg-emerald-500" />
        <StatBox title="Entregados" value={stats.delivered} icon={<CalendarIcon className="size-4 md:size-5 text-white" />} className={gradient("from-green-50","to-green-100","border-green-200")} iconBg="bg-green-600" />
        <StatBox title="Cancelados" value={stats.cancelled} icon={<CalendarIcon className="size-4 md:size-5 text-white" />} className={gradient("from-red-50","to-red-100","border-red-200")} iconBg="bg-red-600" />
        <StatBox title="Ingresos" value={`$${stats.totalRevenue.toFixed(2)}`} icon={<DollarSign className="size-4 md:size-5 text-white" />} className={gradient("from-green-50","to-green-100","border-green-200")} iconBg="bg-green-600" />
      </div>
    </div>
  );
});

interface StatBoxProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  className?: string;
  iconBg: string;
}

function StatBox({ title, value, icon, className = "", iconBg }: StatBoxProps) {
  return (
    <div className={`${className} ${boxBase} min-w-0`}> 
      <div className={`p-2 rounded-lg ${iconBg} flex-shrink-0`}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-sm md:text-[0.95rem] font-medium text-gray-700 truncate">{title}</p>
        <p className="text-xl md:text-2xl font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}
