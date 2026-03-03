'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DollarSign, ShoppingBag, TrendingUp, Award, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface FinanceiroData {
  metrics: {
    totalSales: number;
    totalOrders: number;
    averageTicket: number;
    bestSeller: string;
  };
  salesByDay: Array<{ date: string; value: number }>;
  categoryData: Array<{ name: string; value: number }>;
  topServices: Array<{ name: string; quantity: number }>;
}

const COLORS = ['#D4AF37', '#F7C59F', '#FF9B6A', '#FFB088', '#FFCBB0'];

export default function FinanceiroTab() {
  const [data, setData] = useState<FinanceiroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'1' | '7' | '30'>('7');

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/financeiro?period=${period}`);
      if (!response.ok) throw new Error('Erro ao buscar dados');
      const result = await response.json();
      setData(result);
    } catch (error) {
      toast.error('Erro ao carregar dados financeiros');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-gray-400 py-12">
        <p>Não foi possível carregar os dados financeiros.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Dashboard Financeira</h2>
        
        {/* Filtros de PerÃ­odo */}
        <div className="flex gap-2">
          {[
            { value: '1', label: 'Hoje' },
            { value: '7', label: 'Últimos 7 dias' },
            { value: '30', label: 'Últimos 30 dias' },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setPeriod(btn.value as '1' | '7' | '30')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                period === btn.value
                  ? 'bg-primary text-white'
                  : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm">Receita Total</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(data.metrics.totalSales)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-emerald-100 text-sm">Número de agendamentos</p>
              <p className="text-2xl font-bold text-white">{data.metrics.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-blue-100 text-sm">Ticket Médio</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(data.metrics.averageTicket)}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-purple-100 text-sm">Mais Vendido</p>
              <p className="text-lg font-bold text-white truncate max-w-[160px]" title={data.metrics.bestSeller}>
                {data.metrics.bestSeller}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* GrÃ¡ficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GrÃ¡fico de Linha - Receita por Dia */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Receita por Dia</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #FF6B35',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: number) => [formatCurrency(value), 'Receita']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#FF6B35"
                  strokeWidth={3}
                  dot={{ fill: '#D4AF37', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#D4AF37' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* GrÃ¡fico de Sparkles - Receita por Categoria */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Receita por Categoria</h3>
          <div className="h-72">
            {data.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={{ stroke: '#666' }}
                  >
                    {data.categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #FF6B35',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [formatCurrency(value), 'Receita']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Sem dados de categorias
              </div>
            )}
          </div>
        </div>

        {/* GrÃ¡fico de Barras - Top 5 serviços */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Top 5 serviços Mais Vendidos</h3>
          <div className="h-72">
            {data.topServices.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topServices} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis type="number" stroke="#888" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#888" fontSize={12} width={150} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #FF6B35',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`${value} unidades`, 'Quantidade']}
                  />
                  <Bar dataKey="quantity" fill="#FF6B35" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Sem dados de serviços
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resumo */}
      {data.metrics.totalOrders === 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 text-center">
          <p className="text-gray-400">
            ðŸ“Š Nenhum pedido confirmado encontrado no perÃ­odo selecionado.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Os dados financeiros sÃ£o baseados em agendamentos com status diferente de &quot;Pendente&quot;.
          </p>
        </div>
      )}
    </div>
  );
}


