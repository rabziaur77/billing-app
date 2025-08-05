import React, { useEffect } from "react";
import { API_SERVICE } from "../../Service/API/API_Service";

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const useIndexLogic = () => {
    const[monthlySales, setMonthlySales] = React.useState({
        labels: months,
        datasets: [
            {
                label: 'Monthly Sales',
                data: Array(12).fill(0),
                backgroundColor: 'rgba(0, 155, 155, 0.6)',
            },
        ],
    });
    const[monthlyRevenue, setMonthlyRevenue] = React.useState({
    labels: months,
    datasets: [
        {
            label: 'Monthly Revenue',
            data: Array(12).fill(0),
            borderColor: 'rgba(255,99,132,1)',
            backgroundColor: 'rgba(255,99,132,0.2)',
            fill: true,
            tension: 0.4,
        },
    ],
});

    useEffect(() => {
        const fetchData = async () => {
            // Monthly sales data
            API_SERVICE.get('invoice-api/SaleInvoice/MonthlySaleRecord')
            .then(response => {
                const salesData = Array(12).fill(0);

                response.data.response.forEach((item: any) => {
                    const monthIndex = item.month - 1;
                    salesData[monthIndex] = item.totalSales || 0;
                });

                setMonthlySales(prev=> ({
                    ...prev,
                    datasets: [{...prev.datasets[0],data: salesData,},],
                }));
            });

            // Monthly revenue data
            API_SERVICE.get('invoice-api/SaleInvoice/MonthlyRevenueRecord')
            .then(response => {
                const revenueData = Array(new Date().getMonth()).fill(0);

                response.data.response.forEach((item: any) => {
                    const monthIndex = item.month - 1;
                    revenueData[monthIndex] = item.totalRevenue || 0;
                });
                setMonthlyRevenue(prev => ({
                    ...prev,
                    datasets: [{ ...prev.datasets[0], data: revenueData }],
                }));
            });
        };

        fetchData();
    }, []);

    return {
        monthlySales,
        monthlyRevenue
    };
};

export default useIndexLogic;
