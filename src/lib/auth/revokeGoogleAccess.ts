import axios from "axios";

export const revokeGoogleAccess = async (token: string) => {
    try {
        // Works for both access_token and refresh_token
        await axios.post(`https://oauth2.googleapis.com/revoke?token=${token}`, {}, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return true;
    } catch (error) {
        console.error("Google revocation failed:", error);
        return false;
    }
};