import { SOCKET_ON_RTC, sendLog } from "./utils";
import { Socket } from "socket.io";
import ClientsController from "./clients";
import { UserType } from './type'

//监听RTC相关事件
export default function bindSocketRtc(socket: Socket, clients:ClientsController) {
    //接收 发送方 发送candidate连接的成功回调 并 转发给 接收方
    socket.on(SOCKET_ON_RTC.CANDIDATE, (data) => {
        let toUserName = data.toUserInfo.userName
        sendLog(`bindSocketRtc: 转发candidate - ${toUserName}`)
        let user = clients.get(toUserName);
        baseEmitHandle(data,user, SOCKET_ON_RTC.CANDIDATE, `转发candidate - ${toUserName}不存在`)
    })

    //接收 发送方 发送offer的消息 并 转发给 接收方
    socket.on(SOCKET_ON_RTC.OFFER, (data) => {
        let toUserName = data.toUserInfo.userName
        sendLog(`bindSocketRtc: 转发offer - ${toUserName}`)
        let user = clients.get(toUserName);
        baseEmitHandle(data,user, SOCKET_ON_RTC.OFFER, `转发offer - ${toUserName}不存在`)
    })

    //接收 接收方 发送answer的消息 并 转发给 发送方
    socket.on(SOCKET_ON_RTC.ANSWER, (data) => {
        let toUserName = data.toUserInfo.userName
        sendLog(`bindSocketRtc: 转发answer - ${toUserName}`)
        let user = clients.get(toUserName);
        baseEmitHandle(data,user, SOCKET_ON_RTC.ANSWER, `转发answer - ${toUserName}不存在`)
    })

    //接收 挂断方 挂断的消息 并 转发给 被挂断方
    socket.on(SOCKET_ON_RTC.USER_OFF, (data) => {
        let toUserName = data.toUserInfo.userName
        sendLog(`bindSocketRtc: ${data.fromUserInfo.userName} 挂断了电话`)
        let user = clients.get(toUserName);
        baseEmitHandle(data,user, SOCKET_ON_RTC.USER_OFF, `转发挂断 - ${toUserName}不存在`)
    })

    //接收 拒绝方 拒绝的消息 并 转发给 被拒绝方
    socket.on(SOCKET_ON_RTC.USER_REFUST, (data) => {
        let toUserName = data.toUserInfo.userName
        sendLog(`bindSocketRtc: ${data.fromUserInfo.userName} 拒绝接听电话`)
        let user = clients.get(toUserName);
        baseEmitHandle(data, user, SOCKET_ON_RTC.USER_REFUST, `转发拒绝 - ${toUserName}不存在`)
    })

    function baseEmitHandle(data: any, user: UserType | undefined, emitType:string, errorMsg:string) {
        if (user) {
            let params = {...data};
            socket.to(user.userId).emit(emitType, params)
        } else {
            sendLog(`bindSocketRtc: ${errorMsg}`)
        }
    }
}