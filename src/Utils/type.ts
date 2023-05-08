export interface ChatMsg {
  oId: string,
  uId: string,
  user: string,
  // type:消息类型 0聊天室对话 1聊天室红包 2私信
  type?: number
  msg?: string,
  // 红包的积分 type = 1时必填
  point?: number,
  // 用户信息
  detail?: any
}