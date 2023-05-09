import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'
@Entity()
export class City {
    @PrimaryGeneratedColumn()
    id: number
    // 城市id
    @Column({ type: "varchar", length: 255 })
    adcode: string
    // 城市
    @Column({ type: "varchar", length: 255 })
    addr: string
    // long
    @Column({ type: "varchar", length: 255 })
    long: string
    // lat
    @Column({ type: "varchar", length: 255 })
    lat: string
}