import { sendLog } from './utils'
import { UserType } from './type'

//客户端管理
export default class ClientsController {
    data: UserType[];
    constructor(initArray: UserType[] = []) {
        this.data = initArray
    }
    add(user:UserType) {
        if (!user || !user.userName) return;
        if (this.data.some(u => u.userName === user.userName)) return false;
        this.data.push(user);
        sendLog(`ClientsController: ${user.userName}---（连接）`)
        return true;
    }
    remove(userName: string) {
        this.data = this.data.filter(u => u.userName !== userName);
        sendLog(`ClientsController: ${userName}---（断开）`)
    }
    get(userName: string) {
        return this.data.find(u => u.userName === userName)
    }
    has(userName: string) {
        return this.get(userName) !== undefined
    }
}
