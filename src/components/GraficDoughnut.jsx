import { useMemo } from 'react';
import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

export const GraficDoughnut = ({ totalPendientes, totalRegisteredVotes }) => {
    const data = {
        labels: ['Votos Registrados', 'Votos Pendientes'],
        datasets: [
            {
                data: [totalRegisteredVotes, totalPendientes],
                backgroundColor: ['#e18100', 'rgb(122, 120, 120)'],
                borderColor: ['#e18100', 'rgb(122, 120, 120)'],
                borderWidth: 1,
                label: 'Votos',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Registro de Votos',
                font: {
                    size: 16,
                    weight: 'bold',
                },
            },
            legend: {
                position: 'bottom',
            },
        },
    };

    useMemo(() => {
        if (totalPendientes || totalRegisteredVotes) {
            data.datasets[0].data = [totalRegisteredVotes, totalPendientes];
        }
    }, [totalRegisteredVotes, totalPendientes]);

    return (
        <div className='mt-6 bg-white rounded-lg shadow-md p-6'>
            <Doughnut data={data} options={options} />
            
            {/* Estadísticas adicionales (opcional) */}
            <div className='flex flex-col gap-3 px-3 py-4 border-t mt-4'>
                <div className='flex items-center justify-between'>
                    <span className='flex items-center gap-2'>
                        <span className='w-3 h-3 rounded-full bg-[#e18100]'></span>
                        <span className='text-sm text-gray-700 font-medium'>
                            Votos Registrados
                        </span>
                    </span>
                    <span className='text-lg font-bold text-gray-900'>
                        {totalRegisteredVotes}
                    </span>
                </div>
                <div className='flex items-center justify-between'>
                    <span className='flex items-center gap-2'>
                        <span className='w-3 h-3 rounded-full bg-[#7A7878]'></span>
                        <span className='text-sm text-gray-700 font-medium'>
                            Votos Pendientes
                        </span>
                    </span>
                    <span className='text-lg font-bold text-gray-900'>
                        {totalPendientes}
                    </span>
                </div>
            </div>
        </div>
    );
};