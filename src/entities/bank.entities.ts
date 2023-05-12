import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
@Entity()
// 银行存款记录
export class Bank {
    @PrimaryGeneratedColumn()
    id: number
    // 鱼派用户名
    @Column({ type: "varchar", length: 255 })
    user: string
    // 鱼派uId
    @Column({ type: "varchar", length: 255 })
    uId: string
    // 当前存的积分
    @Column({ type: "varchar", length: 255 })
    point: string
    // 更新时间
    @UpdateDateColumn()
    update_time: Date
    // 开户时间
    @CreateDateColumn()
    create_time: Date
}