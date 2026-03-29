import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import useIndexLogic from './IndexLogic';
import BlurLoader from '../CommonComp/BlurLoader';
import './Home.css';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const Home: React.FC = () => {
    const { 
        monthlySales, 
        monthlyRevenue, 
        tableData, 
        recentState, 
        setRecentState, 
        isSalesLoading, 
        isRevenueLoading, 
        isTableLoading 
    } = useIndexLogic();

    return (
        <div className="dashboard-container">
            <div className='row'>
                <div className='col-md-6'>
                    <h2>Sales Overview</h2>
                    <BlurLoader isLoading={isSalesLoading} minHeight="300px" loadingText="Fetching Sales...">
                        <Bar data={monthlySales} />
                    </BlurLoader>
                </div>
                <div className='col-md-6'>
                    <h2>Revenue Overview</h2>
                    <BlurLoader isLoading={isRevenueLoading} minHeight="300px" loadingText="Fetching Revenue...">
                        <Line data={monthlyRevenue} />
                    </BlurLoader>
                </div>
            </div>

            <div className='row mt-5'>
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
                    
                    <div className="table-responsive">
                        <BlurLoader isLoading={isTableLoading} minHeight="200px" loadingText="Fetching Transactions...">
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
                        </BlurLoader>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;