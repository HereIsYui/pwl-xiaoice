import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Generated } from 'typeorm'
@Entity()
export class Client {
    // client
    @PrimaryGeneratedColumn()
    id: number
    // client_id
    @Column({ type: "varchar", length: 255 })
    client_id: string
    // client_secret
    @Column({ type: "varchar", length: 255 })
    client_secret: string
    // 
    @Column({ type: "varchar", length: 255, default: '' })
    roles: string
    // 
    @UpdateDateColumn({ type: "timestamp" })
    update_time: Date

    @CreateDateColumn({ type: "timestamp" })
    create_time: Date

    @Column({ type: "int", default: 0 })
    delete_flag: number
}