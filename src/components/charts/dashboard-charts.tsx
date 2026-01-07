"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Legend,
} from "recharts";

interface DashboardChartsProps {
    jenjangData: { name: string; value: number }[];
    hafalanPerBulan: { bulan: string; selesai: number }[];
    pelanggaranTrend: { bulan: string; jumlah: number }[];
}

const COLORS = ["#10B981", "#3B82F6", "#F59E0B"]; // SMP=emerald, SMA=blue, Lainnya=amber

export function DashboardCharts({
    jenjangData,
    hafalanPerBulan,
    pelanggaranTrend,
}: DashboardChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pie Chart - Distribusi Santri */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg">Distribusi Santri</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={jenjangData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {jenjangData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Bar Chart - Hafalan per Bulan */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg">Hafalan Selesai per Bulan</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hafalanPerBulan}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="bulan" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="selesai" fill="#10B981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Line Chart - Tren Pelanggaran */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg">Tren Pelanggaran</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={pelanggaranTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="bulan" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="jumlah"
                                    stroke="#EF4444"
                                    strokeWidth={2}
                                    dot={{ fill: "#EF4444" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}