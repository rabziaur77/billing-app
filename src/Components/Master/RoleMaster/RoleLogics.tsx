import React, { useEffect, useState } from "react";
import { API_SERVICE } from "../../../Service/API/API_Service";
import type { Role, RoleRequest } from "../MasterModels/RoleModel";

const useRoleLogics = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [roleName, setRoleName] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [popupVisible, setPopupVisible] = useState<boolean>(false);
    const [popupMessage, setPopupMessage] = useState<string>("");
    const [isBulkLoading, setIsBulkLoading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const response = await API_SERVICE.get('auth-api/Roles/getRoles');
            // Assuming the response structure based on other typical responses
            if (response.status === 200) {
                const mappedRoles: Role[] = (response.data.response || []).map((r: any) => ({
                    roleID: r.id || r.roleID || r.roleId || r.RoleId,
                    roleName: r.roleName || r.RoleName
                }));
                setRoles(mappedRoles);
            }
        } catch (error) {
            console.error("Error fetching roles:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const submitRoleForm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleName.trim()) return;

        const request: RoleRequest = { RoleName: roleName };
        try {
            const response = await API_SERVICE.post('auth-api/Roles/addNewRole', request);
            if (response.status === 200) {
                setPopupVisible(true);
                setPopupMessage("Role added successfully.");
                setRoleName("");
                fetchRoles();
            } else {
                setPopupVisible(true);
                setPopupMessage(response.data.message || "Failed to add role.");
            }
        } catch (error: any) {
            setPopupVisible(true);
            setPopupMessage(error.response?.data?.message || "Error adding role.");
        }
    };

    const onBulkUploadRoles = async (_data: any[], file: File) => {
        setIsBulkLoading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await API_SERVICE.post('auth-api/Roles/bulkUpload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress(percentCompleted);
                }
            });

            if (response.status === 200) {
                setPopupMessage(response.data.response || "Roles uploaded successfully.");
            } else {
                setPopupMessage("Failed to upload roles.");
            }
        } catch (error: any) {
            console.error("Error uploading roles:", error);
            setPopupMessage(error.response?.data?.response || "Error uploading roles.");
        } finally {
            setPopupVisible(true);
            setIsBulkLoading(false);
            setUploadProgress(0);
            fetchRoles();
        }
    };

    const closePopup = () => {
        setPopupVisible(false);
        setPopupMessage("");
    };

    return {
        roles,
        roleName,
        setRoleName,
        isLoading,
        submitRoleForm,
        popupVisible,
        popupMessage,
        closePopup,
        onBulkUploadRoles,
        isBulkLoading,
        uploadProgress
    };
};

export default useRoleLogics;
