// 活动记录typeORM
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
@Entity()
export class ActivityRecordEntity {
  // 主键，自增
  @PrimaryGeneratedColumn()
  id: number;

  // 用户ID
  @Column()
  userId: string;

  // 活动名称
  @Column()
  name: string;

  // 活动内容
  @Column()
  content: string;

  // 活动名称
  @Column()
  activityName: string;

  // 创建时间
  @CreateDateColumn()
  createTime: Date;

  // 更新时间
  @UpdateDateColumn()
  updateTime: Date;
}