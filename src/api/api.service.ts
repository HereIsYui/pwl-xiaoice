import { Injectable } from "@nestjs/common";
import { User } from "../entities/user.entities";
import { Credit } from "../entities/credit.entities";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class ApiService {
  constructor(
    @InjectRepository(User) private readonly user: Repository<User>,
    @InjectRepository(Credit) private readonly credit: Repository<Credit>
  ) {}
  async GetUserIntimacy(uid: string) {
    return {
      code: 0,
      data: await this.user.findOne({ select: ["uId", "user", "intimacy"], where: { uId: uid } }),
      msg: "success",
    };
  }

  async GetUserCreditScore(uid: string) {
    return {
      code: 0,
      data: await this.credit.findOne({
        select: ["uId", "user", "base_score", "activity_score", "reward_score", "credit_score"],
        where: { uId: uid },
      }),
      msg: "success",
    };
  }
}
