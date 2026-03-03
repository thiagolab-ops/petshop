import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { Appointment } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as { role?: string })?.role !== 'admin') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7'; // dias

    // Calcular data inicial baseado no período
    const now = new Date();
    const startDate = new Date();

    if (period === '1') {
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate.setDate(now.getDate() - parseInt(period));
      startDate.setHours(0, 0, 0, 0);
    }

    // Buscar pedidos confirmados (excluindo Pendente)
    const appointments = await prisma.appointment.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        status: {
          not: 'Pendente',
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Métricas principais
    const totalSales = appointments.reduce((sum: number, appointment: Appointment) => sum + appointment.total, 0);
    const totalAppointments = appointments.length;
    const averageTicket = totalAppointments > 0 ? totalSales / totalAppointments : 0;

    // Contagem de produtos vendidos
    const serviceSales: Record<string, { name: string; quantity: number; category: string }> = {};
    const categorySales: Record<string, number> = {};

    appointments.forEach((appointment: Appointment) => {
      const items = appointment.items as Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
        category?: string;
        isHalf?: boolean;
        halfFlavors?: string[];
      }>;

      items.forEach((item) => {
        const itemName = item.isHalf && item.halfFlavors
          ? `${item.halfFlavors[0]} / ${item.halfFlavors[1]} (Meio a Meio)`
          : item.name;

        if (!serviceSales[itemName]) {
          serviceSales[itemName] = { name: itemName, quantity: 0, category: item.category || 'Outros' };
        }
        serviceSales[itemName].quantity += item.quantity;

        // Vendas por categoria
        const category = item.category || 'Outros';
        if (!categorySales[category]) {
          categorySales[category] = 0;
        }
        categorySales[category] += item.price * item.quantity;
      });
    });

    // Top 5 produtos mais vendidos
    const topServices = Object.values(serviceSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Produto mais vendido
    const bestSeller = topServices.length > 0 ? topServices[0].name : 'N/A';

    // Vendas por dia
    const salesByDay: Record<string, number> = {};
    const days = parseInt(period);

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(now.getDate() - (days - 1 - i));
      const dateKey = date.toISOString().split('T')[0];
      salesByDay[dateKey] = 0;
    }

    appointments.forEach((appointment: Appointment) => {
      const dateKey = appointment.createdAt.toISOString().split('T')[0];
      if (salesByDay[dateKey] !== undefined) {
        salesByDay[dateKey] += appointment.total;
      }
    });

    const salesByDayArray = Object.entries(salesByDay).map(([date, value]) => ({
      date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      value: Number(value.toFixed(2)),
    }));

    // Vendas por categoria formatadas
    const categoryData = Object.entries(categorySales).map(([name, value]) => ({
      name,
      value: Number(value.toFixed(2)),
    }));

    return NextResponse.json({
      metrics: {
        totalSales: Number(totalSales.toFixed(2)),
        totalOrders: totalAppointments,
        averageTicket: Number(averageTicket.toFixed(2)),
        bestSeller,
      },
      salesByDay: salesByDayArray,
      categoryData,
      topServices: topServices.map((p) => ({
        name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
        quantity: p.quantity,
      })),
    });
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
