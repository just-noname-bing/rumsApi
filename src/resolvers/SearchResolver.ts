import { Arg, Query, Resolver } from "type-graphql";
import { User } from "../entity/User";

@Resolver(User)
export class SearchResolver {
	@Query(() => [User])
	async search(@Arg("keyword") keyword: string): Promise<User[]> {
		// search by keyword
		const users = await User.find({
			where: {
				role: "Normal",
			},
		});

		const filtered = users.filter(({ password, id, ...rest }) =>
			Object.values(rest).some((field: string) =>
				field.toLowerCase().includes(keyword.toLowerCase())
			)
		);

		return filtered;
	}
}
