import { useEffect, useState, useMemo } from "react";
import { API_SERVICE } from "../../../Service/API/API_Service";
import type { Role } from "../MasterModels/RoleModel";
import { useAuth } from "../../../Service/ContextService/AuthContext";

interface MenuAssignment {
    menuID: number;
    menuName: string;
    isChecked: boolean;
    category: string;
}

const usePermissionLogics = () => {
    const { userInfo } = useAuth();
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRoleID, setSelectedRoleID] = useState<number>(0);
    const [menuAssignments, setMenuAssignments] = useState<MenuAssignment[]>([]);
    const [popupVisible, setPopupVisible] = useState<boolean>(false);
    const [popupMessage, setPopupMessage] = useState<string>("");

    const filteredRoles = useMemo(() => {
        return roles.filter((r: Role) => r.roleName !== userInfo.role);
    }, [roles, userInfo.role]);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [rolesRes, myPermsRes] = await Promise.all([
                API_SERVICE.get("auth-api/Roles/getRoles"),
                API_SERVICE.get("auth-api/Menus/my-menus"),
            ]);

            if (rolesRes.status === 200) {
                const fetchedRoles: Role[] = (rolesRes.data.response || []).map((r: any) => ({
                    roleID: r.id || r.roleID || r.roleId || r.RoleId,
                    roleName: r.roleName || r.RoleName,
                }));
                setRoles(fetchedRoles);
            }

            if (myPermsRes.status === 200) {
                // The backend might return it directly or wrapped in a response field
                const raw = myPermsRes.data.response || myPermsRes.data || [];
                const mapped: MenuAssignment[] = (Array.isArray(raw) ? raw : []).map((p: any) => {
                    const label = (p.label || p.menuName || p.MenuName || "").toLowerCase();
                    let cat = p.category || p.Category || p.group || p.Group || "General";
                    
                    // Fallback heuristics if category is not provided
                    if (cat === "General") {
                        if (label.includes("management") || label.includes("master") || label.includes("user") || label.includes("role") || label.includes("permission") || label.includes("product") || label.includes("category") || label.includes("tax")) {
                            cat = "Master Data";
                        } else if (label.includes("invoice") || label.includes("history")) {
                            cat = "Transactions";
                        }
                    }

                    return {
                        menuID: p.id || p.menuID || p.MenuID || p.menuId || p.displayOrder,
                        menuName: p.label || p.menuName || p.MenuName || `Menu ${p.displayOrder}`,
                        category: cat,
                        isChecked: false,
                    };
                });
                setMenuAssignments(mapped);
            }
        } catch (error) {
            console.error("Error loading initial data:", error);
        }
    };

    const handleRoleChange = async (roleID: number) => {
        setSelectedRoleID(roleID);
        // Reset check boxes when role is changed
        let updatedAssignments = menuAssignments.map(m => ({ ...m, isChecked: false }));

        if (roleID > 0) {
            try {
                const res = await API_SERVICE.get(`auth-api/Roles/getRoleMenus/${roleID}`);
                if (res.status === 200) {
                    const assignedMenuIDs: number[] = res.data.response || [];
                    updatedAssignments = updatedAssignments.map(m => ({
                        ...m,
                        isChecked: assignedMenuIDs.includes(m.menuID)
                    }));
                }
            } catch (error) {
                console.error("Error fetching role menus:", error);
            }
        }
        
        setMenuAssignments(updatedAssignments);
    };

    const toggleMenuAssignment = (menuID: number) => {
        setMenuAssignments((prev) =>
            prev.map((m) =>
                m.menuID === menuID ? { ...m, isChecked: !m.isChecked } : m
            )
        );
    };

    const saveRoleMenus = async () => {
        if (!selectedRoleID) {
            setPopupMessage("Please select a role first.");
            setPopupVisible(true);
            return;
        }

        const selectedMenuIDs = menuAssignments
            .filter(m => m.isChecked)
            .map(m => m.menuID);

        if (selectedMenuIDs.length === 0) {
            setPopupMessage("Please select at least one menu.");
            setPopupVisible(true);
            return;
        }

        try {
            const res = await API_SERVICE.post("auth-api/Roles/syncRoleMenus", {
                RoleId: selectedRoleID,
                MenuIds: selectedMenuIDs
            });

            if (res.status === 200) {
                setPopupMessage("Menus updated for role successfully!");
            } else {
                setPopupMessage("Failed to update menus.");
            }
        } catch (error: any) {
            console.error("Error saving assignments:", error);
            setPopupMessage(error.response?.data?.message || "Error saving assignments.");
        } finally {
            setPopupVisible(true);
        }
    };

    const closePopup = () => {
        setPopupVisible(false);
        setPopupMessage("");
    };

    return {
        roles: filteredRoles,
        selectedRoleID,
        handleRoleChange,
        menuAssignments,
        toggleMenuAssignment,
        saveRoleMenus,
        popupVisible,
        popupMessage,
        closePopup,
    };
};

export default usePermissionLogics;
