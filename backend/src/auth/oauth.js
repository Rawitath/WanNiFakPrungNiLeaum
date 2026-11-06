import dotenv from 'dotenv';

dotenv.config();

const googleOauth = async (req, res, next) => {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

    const options = new URLSearchParams({
        redirect_uri: process.env.OAUTH_REDIRECT_URI,
        client_id: process.env.GOOGLE_CLIENT_ID,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/user.phonenumbers.read',
            'openid'
        ].join(' ')
    });

    res.redirect(`${rootUrl}?${options.toString()}`);
}

const googleOauthCallback = async (req, res, next) => {
    return res.status(200).json({ message: "Hi!" });
}

export { googleOauth, googleOauthCallback };