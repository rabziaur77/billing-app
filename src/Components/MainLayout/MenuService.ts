import { API_SERVICE } from "../../Service/API/API_Service";

export interface MenuItemDTO {
  label: string;
  url: string;
  iconName: string;
  displayOrder: number;
}

/**
 * Fetches the menu items for the currently logged-in user.
 * The backend determines the menus based on the user's role/permissions from the auth token.
 */
export const fetchMyMenus = async (): Promise<MenuItemDTO[]> => {
  try {
    const response = await API_SERVICE.get<MenuItemDTO[]>("auth-api/Menus/my-menus");
    return response.data;
  } catch (error) {
    console.error("Error fetching menus:", error);
    throw error;
  }
};
