import React, { useEffect } from "react";
import { API_SERVICE } from "../../Service/API/API_Service";

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface TableData {
    customerName: string;
    totalAmount: number;
    date: string;
}

const useIndexLogic = () => {
    const [tableData, setTableData] = React.useState<TableData[]>([]);
    const [recentState, setRecentState] = React.useState("this week");
    const [monthlySales, setMonthlySales] = React.useState({
        labels: months,
        datasets: [
            {
                label: 'Monthly Sales',
                data: Array(12).fill(0),
                backgroundColor: 'rgba(0, 155, 155, 0.6)',
            },
        ],
    });
    const [monthlyRevenue, setMonthlyRevenue] = React.useState({
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

     // Monthly sales data
    useEffect(() => {
        const fetchData = async () => {
           
            API_SERVICE.get('invoice-api/SaleInvoice/MonthlySaleRecord')
                .then(response => {
                    const salesData = Array(12).fill(0);

                    response.data.response.forEach((item: any) => {
                        const monthIndex = item.month - 1;
                        salesData[monthIndex] = item.totalSales || 0;
                    });

                    setMonthlySales(prev => ({
                        ...prev,
                        datasets: [{ ...prev.datasets[0], data: salesData, },],
                    }));
                });
        };

        fetchData();
    }, []);

    // Monthly revenue data
    useEffect(() => {
        const fetchData = async () => {
            API_SERVICE.get('invoice-api/SaleInvoice/MonthlyRevenueRecord')
                .then(response => {
                    const revenueData = Array(12).fill(0);

                    response.data.response.forEach((item: any) => {
                        const monthIndex = item.month - 1;
                        revenueData[monthIndex] = item.totalRevenue || 0;
                    });

                    setMonthlyRevenue(prev => ({
                        ...prev,
                        datasets: [{ ...prev.datasets[0], data: revenueData, },],
                    }));
                });
        };

        fetchData();
    }, []);

    // Recent data
    useEffect(() => {
        const fetchData = async () => {
            try {
                API_SERVICE.get('invoice-api/SaleInvoice/RecentTransaction?transactionType=' + recentState)
                .then(response => {
                    console.log("Recent Transactions:", response.data.response);

                    const recentData = response.data.response.map((item: any) => ({
                        customerName: item.customer,
                        totalAmount: item.amount,
                        date: item.date,
                    }));
                    setTableData(recentData);
                });
            } catch (error) {
                console.error("Error fetching taxes:", error);
            }
        };

        fetchData();
    }, [recentState]);
    return {
        monthlySales,
        monthlyRevenue,
        tableData,
        recentState,
        setRecentState,
    };
};

export default useIndexLogic;
