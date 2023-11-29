export const SOCKET_EMIT = {
    SYS_USER_LIST: 'user_list'
}
export const SOCKET_ON_SYS = {
    // 连接socket
    CONNECTION: "connection",
    // 断开socket
    DISCONNECT: "disconnect",
    // 错误显示
    SYS_ERROR: "sys_error"
}
export const SOCKET_ON_RTC = {
    //建立连接
    CANDIDATE: "candidate",
    // 发起者发送offer
    OFFER: "offer",
    // 接收者发送answer
    ANSWER: "answer",
    // 挂断通话
    USER_OFF: "user_off",
    // 拒绝通话
    USER_REFUST: "user_refust",
}
export const DATA_CODE = {
    OK: 200,
    ERROR: 500
}
export const CALL_TYPE = {
    // 发送者
    SENDER: "sender",
    // 接收者
    RECIVER: "reciver"
}
export function sendLog(msg:string) {
    console.log(`${msg}`);
}