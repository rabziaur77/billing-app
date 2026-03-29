import React, { useRef } from "react";
import Papa from "papaparse";

interface CsvUploadProps {
    onUpload: (data: any[], file: File) => void;
    columns: string[];
    fileName?: string;
    isLoading?: boolean;
    progress?: number;
}

const CsvUpload: React.FC<CsvUploadProps> = ({ onUpload, columns, fileName = "template.csv", isLoading, progress = 0 }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsedData = results.data as any[];
                
                // Validate columns
                if (parsedData.length > 0) {
                    const csvColumns = Object.keys(parsedData[0]);
                    const missingColumns = columns.filter(col => !csvColumns.includes(col));
                    
                    if (missingColumns.length > 0) {
                        alert(`Missing columns: ${missingColumns.join(", ")}`);
                        return;
                    }
                }

                onUpload(parsedData, file);
                // Reset file input
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            },
            error: (error) => {
                alert(`Error parsing CSV: ${error.message}`);
            }
        });
    };

    const downloadTemplate = () => {
        const csv = Papa.unparse([
            columns.reduce((acc, col) => ({ ...acc, [col]: "" }), {})
        ]);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="card border-primary mb-3 shadow-sm">
            <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="card-title text-primary mb-0">Bulk Upload via CSV</h5>
                    <button className="btn btn-sm btn-outline-secondary" onClick={downloadTemplate}>
                        <i className="bi bi-download me-1"></i>
                        Download Template
                    </button>
                </div>
                <p className="card-text small text-muted mb-3">
                    Upload a CSV file with the required columns. The system will process each record immediately.
                </p>
                <div className="input-group mb-3">
                    <input
                        type="file"
                        className="form-control"
                        accept=".csv"
                        onChange={handleFileUpload}
                        ref={fileInputRef}
                        disabled={isLoading}
                    />
                </div>
                {isLoading && (
                    <div className="mt-2">
                        <div className="progress" style={{ height: "20px" }}>
                            <div 
                                className="progress-bar progress-bar-striped progress-bar-animated" 
                                role="progressbar" 
                                style={{ width: `${progress}%` }}
                                aria-valuenow={progress} 
                                aria-valuemin={0} 
                                aria-valuemax={100}
                            >
                                {Math.round(progress)}%
                            </div>
                        </div>
                        <p className="text-center small mt-1 text-primary">Processing records, please wait...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CsvUpload;
