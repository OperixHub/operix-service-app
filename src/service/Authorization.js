import Axios from '@/service/Axios';
import { API_CONFIG } from '@/config/api.config';
import { updateAuthorization } from '@/service/AuthSession';

export async function loadAuthorizationSnapshot() {
    const response = await Axios.get(API_CONFIG.IDENTITY.PERMISSIONS_ME);
    const payload = response.data || response;
    updateAuthorization({
        permissions: payload.effective_permissions,
        access: payload.access,
    });
    return payload;
}
