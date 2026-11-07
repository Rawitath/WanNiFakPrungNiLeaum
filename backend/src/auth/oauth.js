import dotenv from 'dotenv';

dotenv.config();

const googleOauth = async (req, res, next) => {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

    const options = new URLSearchParams({
        redirect_uri: process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/api/oauth/google/callback',
        client_id: process.env.GOOGLE_CLIENT_ID || 'none',
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'profile',
            'email',
            'https://www.googleapis.com/auth/user.phonenumbers.read',
            'openid'
        ].join(' ')
    });

    res.redirect(`${rootUrl}?${options.toString()}`);
}

const googleOauthCallback = async (req, res, next) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).json({ error: 'Authorization code missing' });
    }
    try {
        // 2.1 ยิงแบ็กเอนด์ขอแลก Code เป็น Tokens จาก Google
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code: String(code),
                client_id: process.env.GOOGLE_CLIENT_ID || 'none',
                client_secret: process.env.GOOGLE_CLIENT_SECRET || 'none',
                redirect_uri: process.env.OAUTH_REDIRECT_URI || 'http://localhost:3000/api/oauth/google/callback',
                grant_type: 'authorization_code',
            }),
        });

        const tokens = await tokenResponse.json();

        if (!tokenResponse.ok) {
            return res.status(400).json({ error: 'Failed to fetch tokens', details: tokens });
        }

        // 2.2 ใช้ Google People API ดึงข้อมูล ชื่อ, อีเมล, เบอร์โทรศัพท์ ใน Request เดียว
        const userResponse = await fetch('https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,phoneNumbers', {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                Accept: 'application/json',
            },
        });
        
        const googleUser = await userResponse.json();

        if (!userResponse.ok) {
            return res.status(400).json({ error: 'Failed to fetch user data', details: googleUser });
        }

        // People API จะ return ข้อมูลมาเป็น Array เราจึงใช้ Optional Chaining (?.) ดึงค่าตัวแรกออกมา
        const name = googleUser.names?.[0]?.displayName || null;
        const email = googleUser.emailAddresses?.[0]?.value || null;
        const phone = googleUser.phoneNumbers?.[0]?.value || null;

        return res.status(200).json({
            message: 'Login successful',
            user: {
                name,
                email,
                phone,
                // googleId: googleUser.resourceName // ถ้าต้องการเก็บ ID ของ Google ไว้ผูกกับ Database
            },
            // tokens: tokens // ไม่ควรส่ง access_token กลับไปฝั่ง client
        });
    }
    catch (e) {
        console.error('OAuth Error:', e);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export { googleOauth, googleOauthCallback };