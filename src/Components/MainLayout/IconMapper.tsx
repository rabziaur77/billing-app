import React from 'react';
import {
    FaTachometerAlt,
    FaFileInvoiceDollar,
    FaHistory,
    FaTags,
    FaBoxOpen,
    FaListUl,
    FaPercentage,
    FaQuestion,
    FaUserShield,
    FaUserCog,
} from "react-icons/fa";

export const IconMapper = (iconName: string): React.ReactNode => {
    switch (iconName) {
        case 'FaTachometerAlt':
            return <FaTachometerAlt />;
        case 'FaFileInvoiceDollar':
            return <FaFileInvoiceDollar />;
        case 'FaHistory':
            return <FaHistory />;
        case 'FaTags':
            return <FaTags />;
        case 'FaBoxOpen':
            return <FaBoxOpen />;
        case 'FaListUl':
            return <FaListUl />;
        case 'FaPercentage':
            return <FaPercentage />;
        case 'FaUserCog':
            return <FaUserCog />;
        case 'FaUserShield':
            return <FaUserShield />;
        default:
            return <FaQuestion />; // Fallback icon
    }
};
