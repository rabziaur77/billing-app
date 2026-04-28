import React, { useCallback, useEffect } from "react";
import { API_SERVICE } from "../../Service/API/API_Service";

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

interface TableData {
    customerName: string;
    totalAmount: number;
    date: string;
}

interface MonthlySaleItem {
    month: number;
    totalSales?: number;
}

interface MonthlyRevenueItem {
    month: number;
    totalRevenue?: number;
}

interface TransactionItem {
    customer: string;
    amount: number;
    date: string;
}

const useIndexLogic = () => {
    const [isSalesLoading, setIsSalesLoading] = React.useState(true);
    const [isRevenueLoading, setIsRevenueLoading] = React.useState(true);
    const [isTableLoading, setIsTableLoading] = React.useState(true);
    
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

    const fetchMonthlySales = async () => {
        setIsSalesLoading(true);
        try {
            const response = await API_SERVICE.get('invoice-api/SaleInvoice/MonthlySaleRecord');
            const salesData = Array(12).fill(0);
            response.data.response.forEach((item: MonthlySaleItem) => {
                const monthIndex = item.month - 1;
                salesData[monthIndex] = item.totalSales || 0;
            });
            setMonthlySales(prev => ({
                ...prev,
                datasets: [{ ...prev.datasets[0], data: salesData }],
            }));
        } catch (error) {
            console.error("Error fetching monthly sales:", error);
        } finally {
            setIsSalesLoading(false);
        }
    };

    const fetchMonthlyRevenue = async () => {
        setIsRevenueLoading(true);
        try {
            const response = await API_SERVICE.get('invoice-api/SaleInvoice/MonthlyRevenueRecord');
            const revenueData = Array(12).fill(0);
            response.data.response.forEach((item: MonthlyRevenueItem) => {
                const monthIndex = item.month - 1;
                revenueData[monthIndex] = item.totalRevenue || 0;
            });
            setMonthlyRevenue(prev => ({
                ...prev,
                datasets: [{ ...prev.datasets[0], data: revenueData }],
            }));
        } catch (error) {
            console.error("Error fetching monthly revenue:", error);
        } finally {
            setIsRevenueLoading(false);
        }
    };

    const fetchTableData = useCallback(async () => {
        setIsTableLoading(true);
        try {
            const response = await API_SERVICE.get(`invoice-api/SaleInvoice/RecentTransaction?transactionType=${recentState}`);
            const recentData = response.data.response.map((item: TransactionItem) => ({
                customerName: item.customer,
                totalAmount: item.amount,
                date: item.date,
            }));
            setTableData(recentData);
        } catch (error) {
            console.error("Error fetching recent transactions:", error);
        } finally {
            setIsTableLoading(false);
        }
    }, [recentState]);

    // Initial data load
    useEffect(() => {
        fetchMonthlySales();
        fetchMonthlyRevenue();
        // table data is also fetched by the second useEffect on mount due to recentState dependency
    }, []);

    // Handle recentState changes
    useEffect(() => {
        void fetchTableData();
    }, [fetchTableData]);

    return {
        monthlySales,
        monthlyRevenue,
        tableData,
        recentState,
        setRecentState,
        isSalesLoading,
        isRevenueLoading,
        isTableLoading,
    };
};

export default useIndexLogic;
