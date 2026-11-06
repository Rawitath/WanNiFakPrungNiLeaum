const googleOauth = async (req, res, next) => {
    return res.status(302).send();
}

const googleOauthCallback = async (req, res, next) => {
    return res.status(200).json({ message: "Hi!" });
}

export {googleOauth, googleOauthCallback};