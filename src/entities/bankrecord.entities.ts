import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Generated } from 'typeorm'
@Entity()
// 银行存款记录
export class BankRecords {
    @PrimaryGeneratedColumn()
    id: number
    @Column({ type: "varchar", length: 255 })
    order_id: string
    // 鱼派用户名
    @Column({ type: "varchar", length: 255 })
    user: string
    // 鱼派uId
    @Column({ type: "varchar", length: 255, default: '' })
    uId: string
    // dataId 转账时为通知消息的dataId 红包时为红包的oId
    @Column({ type: "varchar", length: 255 })
    data_id: string
    // 积分
    @Column({ type: "varchar", length: 255 })
    point: string
    // 存/取 0存 1取
    @Column({ type: "int" })
    access: number
    // 本次交易后余额
    @Column({ type: "varchar", length: 255 })
    balance: string
    // 存/取方式 0转账 1红包 3金手指
    @Column({ type: "int" })
    access_type: number
    // 本次交易是否成功 0失败 1成功
    @Column({ type: 'int' })
    is_success: number
    // 存/取时间
    @CreateDateColumn()
    create_time: Date
}