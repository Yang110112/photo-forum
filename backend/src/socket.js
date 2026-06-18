let io = null;
let onlineUsers = new Map();

const setIO = (ioInstance) => { io = ioInstance; };
const getIO = () => io;
const getOnlineUsers = () => onlineUsers;

module.exports = { setIO, getIO, getOnlineUsers, onlineUsers };