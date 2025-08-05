import React from 'react';
//import { Link } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';//Doughnut
import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import useIndexLogic from './IndexLogic';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

/*
const customerData = {
    labels: ['Returning', 'New', 'Guest'],
    datasets: [
        {
            label: 'Customer Types',
            data: [60, 30, 10],
            backgroundColor: [
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(255, 99, 132, 0.6)',
            ],
        },
    ],
};
*/
const tableData = [
    { id: 1, customer: 'John Doe', amount: 1200, date: '2025-01-10' },
    { id: 2, customer: 'Jane Smith', amount: 1900, date: '2025-02-15' },
    { id: 3, customer: 'Alice Brown', amount: 800, date: '2025-03-20' },
];

const Home: React.FC = () => {
    const { monthlySales, monthlyRevenue } = useIndexLogic();
    return (
        <>
        <div className='container'>
            <div className='row'>
                <div className='col-md-6'>
                    <h2>Sales Overview</h2>
                    <Bar data={monthlySales} />
                </div>
                <div className='col-md-6'>
                    <h2>Revenue Overview</h2>
                    <Line data={monthlyRevenue} />
                </div>
            </div>
        </div>
        <div className='container mt-5'>
            <div className='row'>
                <div className='col'>
                    <h2>Recent Transactions</h2>
                    <table border={1} cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map(row => (
                                <tr key={row.id}>
                                    <td>{row.id}</td>
                                    <td>{row.customer}</td>
                                    <td>{row.amount}</td>
                                    <td>{row.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* <div className='col-md-3'>
                    <h2>Customer Types</h2>
                    <Doughnut data={customerData} />
                </div> */}
            </div>
        </div>
        </>
    );
};

export default Home;