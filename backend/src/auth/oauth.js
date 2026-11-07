import dotenv from 'dotenv';
import pool from '../config/db';
import generateJwtToken from './generatejwttoken';

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
        const providerUserId = String(googleUser.resourceName).slice(7) || null;
        const name = googleUser.names?.[0]?.displayName || null;
        const email = googleUser.emailAddresses?.[0]?.value || null;
        const phone = googleUser.phoneNumbers?.[0]?.value || null;
        const provider = 'google';



        const user = {
            providerUserId,
            name,
            email,
            phone,
            // googleId: googleUser.resourceName // ถ้าต้องการเก็บ ID ของ Google ไว้ผูกกับ Database
        };

        try {
            await pool.query('BEGIN'); // เริ่ม Transaction

            let userId = null;
            const role = 'customer'

            // 1. Search oauthusers ด้วย provider_user_id และ provider
            const oauthQuery = await pool.query(
                'SELECT user_id FROM oauthusers WHERE provider_user_id = $1 AND provider = $2',
                [providerUserId, provider]
            );

            if (oauthQuery.rows.length > 0) {
                // [พบบันทึก] ดึง user_id เดิม
                userId = oauthQuery.rows[0].user_id;
            } else {
                // [ไม่พบบันทึก] Search users ด้วย email
                const userQuery = await pool.query(
                    'SELECT userid FROM users WHERE email = $1',
                    [email]
                );

                if (userQuery.rows.length > 0) {
                    // [พบบันทึกใน users] เชื่อม OAuth Account เข้ากับ user_id นั้น
                    userId = userQuery.rows[0].userid;

                    await pool.query(
                        `INSERT INTO oauthusers (user_id, provider, provider_user_id) 
                 VALUES ($1, $2, $3)`,
                        [userId, provider, providerUserId]
                    );
                } else {
                    // [ไม่พบบันทึกใน users] สร้าง User ใหม่ใน users และสร้าง record ใน oauthusers

                    // กรณีไม่มีระบบสร้าง UUID ฝั่ง Node.js ให้ใช้ gen_random_uuid() ของ PostgreSQL
                    const genuserid = uuidv4();
                    const newUserQuery = await pool.query(
                        `INSERT INTO users (userid, username, email, phone, role) 
                 VALUES ($1, $2, $3, $4, $5) 
                 RETURNING userid`,
                        [genuserid, name || email.split('@')[0], email, phone, role]
                    );

                    userId = newUserQuery.rows[0].userid;

                    // ผูก record ใน oauthusers
                    await pool.query(
                        `INSERT INTO oauthusers (user_id, provider, provider_user_id) 
                 VALUES ($1, $2, $3)`,
                        [userId, provider, providerUserId]
                    );
                }
            }

            await pool.query('COMMIT'); // ยืนยัน Transaction

            const accessToken = generateJwtToken({ userid: userId, role: role });

            return res.status(200).json({
                message: 'Login successful',
                user: user,
                accessToken: accessToken
            });

        } catch (error) {
            await pool.query('ROLLBACK'); // ยกเลิก Transaction หากเกิด error
            console.error('OAuth Authentication Error:', error);
            throw error;
        }
    }
    catch (e) {
        console.error('OAuth Error:', e);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export { googleOauth, googleOauthCallback };