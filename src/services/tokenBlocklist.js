// services/tokenBlacklist.js

const blacklist = new Set();

exports.add = (token) => {
    blacklist.add(token);
};

exports.has = (token) => {
    return blacklist.has(token);
};
