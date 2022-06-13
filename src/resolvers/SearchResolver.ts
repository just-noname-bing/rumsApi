import { Arg, Query, Resolver } from "type-graphql";
import { User } from "../entity/User";

@Resolver(User)
export class SearchResolver {
	@Query(() => [User])
	async search(@Arg("keyword") keyword: string): Promise<User[]> {
		// search by keyword
		console.log(keyword);
		return await User.find({
			where: {
				role: "Normal",
			},
		});
	}
}
