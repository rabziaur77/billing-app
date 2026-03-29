import React, { useEffect, useState } from "react";
import { API_SERVICE } from "../../../Service/API/API_Service";
import type { Role } from "../MasterModels/RoleModel";
import type { User, AddNewUserRequest } from "../MasterModels/UserModel";

const useUserLogics = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [userForm, setUserForm] = useState<AddNewUserRequest>({
        Email: "",
        PasswordHash: "",
        RoleID: 0
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [popupVisible, setPopupVisible] = useState<boolean>(false);
    const [popupMessage, setPopupMessage] = useState<string>("");
    const [isBulkLoading, setIsBulkLoading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                API_SERVICE.get('auth-api/users/User-List'),
                API_SERVICE.get('auth-api/Roles/getRoles')
            ]);

            if (usersRes.status === 200 && rolesRes.status === 200) {
                const fetchedRoles: Role[] = (rolesRes.data.response || []).map((r: any) => ({
                    roleID: r.id || r.roleID || r.roleId || r.RoleId,
                    roleName: r.roleName || r.RoleName
                }));
                setRoles(fetchedRoles);

                // Mapping PashcalCase/camelCase and ensuring roleName is bound
                const rawUsers = usersRes.data.response || [];
                const mappedUsers: User[] = rawUsers.map((u: any) => {
                    const rId = u.roleID || u.roleId || u.RoleId;
                    const role = fetchedRoles.find(r => r.roleID === rId);
                    return {
                        userID: u.userID || u.userId || u.id,
                        email: u.email || u.Email,
                        roleID: rId,
                        roleName: u.role || u.roleName || u.RoleName || role?.roleName
                    };
                });
                setUsers(mappedUsers);
            }
        } catch (error) {
            console.error("Error fetching initial data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const submitUserForm = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userForm.Email || !userForm.PasswordHash || userForm.RoleID === 0) {
            setPopupVisible(true);
            setPopupMessage("Please fill all required fields.");
            return;
        }

        try {
            const response = await API_SERVICE.post('auth-api/Users/addUser', userForm);
            if (response.status === 201) {
                setPopupVisible(true);
                setPopupMessage("User added successfully.");
                setUserForm({
                    Email: "",
                    PasswordHash: "",
                    RoleID: 0
                });
                fetchInitialData(); // Refresh list
            } else {
                setPopupVisible(true);
                setPopupMessage(response.data.message || "Failed to add user.");
            }
        } catch (error: any) {
            setPopupVisible(true);
            setPopupMessage(error.response?.data?.message || "Error adding user.");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserForm(prev => ({
            ...prev,
            [name]: name === "RoleID" ? parseInt(value) : value
        }));
    };

    const onBulkUploadUsers = async (_data: any[], file: File) => {
        setIsBulkLoading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await API_SERVICE.post('auth-api/Users/bulkUpload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress(percentCompleted);
                }
            });

            if (response.status === 200) {
                setPopupMessage(response.data.response || "Users uploaded successfully.");
            } else {
                setPopupMessage("Failed to upload users.");
            }
        } catch (error: any) {
            console.error("Error uploading users:", error);
            setPopupMessage(error.response?.data?.response || "Error uploading users.");
        } finally {
            setPopupVisible(true);
            setIsBulkLoading(false);
            setUploadProgress(0);
            fetchInitialData();
        }
    };

    const closePopup = () => {
        setPopupVisible(false);
        setPopupMessage("");
    };

    return {
        users,
        roles,
        userForm,
        isLoading,
        submitUserForm,
        handleInputChange,
        popupVisible,
        popupMessage,
        closePopup,
        onBulkUploadUsers,
        isBulkLoading,
        uploadProgress
    };
};

export default useUserLogics;
