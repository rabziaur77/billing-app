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

const Home: React.FC = () => {
    const { monthlySales, monthlyRevenue, tableData, recentState, setRecentState } = useIndexLogic();
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
                    <div className='col-md-3 mb-3'>
                        <select className='form-select' onChange={(e) => setRecentState(e.target.value)} value={recentState}>
                            <option value="this week">This Week</option>
                            <option value="last week">Last Week</option>
                            <option value="this month">This Month</option>
                            <option value="last month">Last Month</option>
                            <option value="last 15 days">Last 15 Days</option>
                        </select>
                    </div>
                    <table className='table table-striped'>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.map((row, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{row.customerName}</td>
                                    <td>{row.totalAmount}</td>
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