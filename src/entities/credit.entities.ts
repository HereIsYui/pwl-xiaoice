import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm'
// 每周更新(注册时长150分，小冰亲密度50分)+活跃分(每月活跃情况200分)+奖励分(领取昨日活跃+发红包+发帖共计200分)+赌狗分(按赌狗红包次数±) 满分600分
@Entity()
export class Credit {
    // id
    @PrimaryGeneratedColumn()
    id: number
    // 鱼派用户名
    @Column({ type: "varchar", length: 255 })
    user: string
    // 鱼派uId
    @Column({ type: "varchar", length: 255 })
    uId: string
    // 基础分 注册时长大于1年的满分 小冰亲密度大于500的满分 默认0
    @Column({ type: "int", default: 0 })
    base_score: number
    // 活跃次数
    @Column({ type: "int", default: 0 })
    activity_times: number
    // 活跃分 默认0
    @Column({ type: "int", default: 0 })
    activity_score: number
    // 本周领取活跃次数 默认0
    @Column({ type: "int", default: 0 })
    liveness_times: number
    // 本周发红包次数 默认0
    @Column({ type: "int", default: 0 })
    redpack_times: number
    // 本周发红包金额 默认0
    @Column({ type: "int", default: 0 })
    redpack_money: number
    // 奖励分 默认0
    @Column({ type: "int", default: 0 })
    reward_score: number
    // 本周赌狗次数 默认 0
    @Column({ type: "int", default: 0 })
    dog_times: number
    // 本周赌狗金额 默认 0
    @Column({ type: "int", default: 0 })
    dog_money: number
    // 赌狗分 默认100 没发一次扣1
    @Column({ type: "int", default: 100 })
    credit_score: number
    // 用户信息更新时间
    @UpdateDateColumn({ type: "timestamp" })
    update_time: Date
    // 用户信息创建时间
    @CreateDateColumn({ type: "timestamp" })
    create_time: Date
}