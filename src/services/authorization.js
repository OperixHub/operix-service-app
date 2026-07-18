import Axios from '@/services/axios';
import { API_CONFIG } from '@/services/api';
import { updateAuthorization } from '@/services/authSession';

export async function loadAuthorizationSnapshot() {
    const response = await Axios.get(API_CONFIG.PERMISSIONS_ME);
    const payload = response.data;
    updateAuthorization({
        permissions: payload.effective_permissions,
        permissionDetails: payload.permissions,
        access: payload.access,
    });
    return payload;
}
