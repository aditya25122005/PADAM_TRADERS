const jwt = require("jsonwebtoken");

const COOKIE_NAME = "accessToken";
const TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TOKEN_MAX_AGE,
};

function generateToken(userId) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing from environment variables.");
    }

    return jwt.sign(
        { sub: userId.toString() },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
}

function setTokenCookie(res, token) {
    res.cookie(COOKIE_NAME, token, cookieOptions);
}

function clearTokenCookie(res) {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    });
}

module.exports = {
    COOKIE_NAME,
    generateToken,
    setTokenCookie,
    clearTokenCookie,
};