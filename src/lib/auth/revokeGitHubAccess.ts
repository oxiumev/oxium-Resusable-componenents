import axios from "axios";

export const revokeGitHubAccess = async (accessToken: string) => {
    const auth = Buffer.from(`${process.env.GITHUB_CLIENT_ID}:${process.env.GITHUB_CLIENT_SECRET}`).toString('base64');

    try {
        await axios.delete(
            `https://api.github.com/applications/${process.env.GITHUB_CLIENT_ID}/grant`,
            {
                data: { access_token: accessToken },
                headers: {
                    Authorization: `Basic ${auth}`,
                    Accept: "application/vnd.github+json",
                },
            }
        );
        return true;
    } catch (error) {
        console.error("GitHub revocation failed:", error);
        return false;
    }
};