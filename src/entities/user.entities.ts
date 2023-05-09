import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm'
@Entity()
export class User {
    // id
    @PrimaryGeneratedColumn()
    id: number
    // 鱼派用户名
    @Column({ type: "varchar", length: 255 })
    user: string
    // 鱼派uId
    @Column({ type: "varchar", length: 255 })
    uId: string
    // 机器人认为的用户性别
    @Column({ type: "varchar", length: 255, default: '1' })
    gender: string
    // 机器人对用户的昵称
    @Column({ type: "varchar", length: 255, default: '' })
    nick_name: string
    // 机器人对用户的好感度
    @Column({ type: "int", default: 0 })
    intimacy: number
    // 用户对机器人发的红包
    @Column({ type: "int", default: 0 })
    point: number
    // 用户权限
    @Column({ type: "varchar", default: '0' })
    auth: string
    // 用户信息更新时间
    @CreateDateColumn({ type: "timestamp" })
    update_time: Date
    // 用户信息创建时间
    @CreateDateColumn({ type: "timestamp" })
    create_time: Date
}