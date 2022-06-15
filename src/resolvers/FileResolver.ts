import { parse } from "csv-parse/sync";
// @ts-ignore
import GraphQLUpload from "graphql-upload/GraphQLUpload.js"; // :(

import { Arg, Mutation, Resolver } from "type-graphql";
import { User } from "../entity/User";
import { Upload } from "../types";
import { castToUsersArray } from "../utils/verifyCsvFields";

@Resolver(User)
export class FileResolver {
	@Mutation(() => Boolean)
	async registerUsers(
		@Arg("file", () => GraphQLUpload) { createReadStream }: Upload
	): Promise<boolean> {
		return await new Promise((resolve, reject) => {
			createReadStream()
				.on("data", async (row: Buffer) => {
					try {
						const usersToCreate: User[] = parse(row, {
							columns: true,
						});
						const users = await castToUsersArray(usersToCreate);
						// await User.save(users, { chunk: 10 });
						await User.createQueryBuilder()
							.insert()
							.values(users)
							.orIgnore()
							.execute();
						return resolve(true);
					} catch (error) {
						// if (error.code === "23505") {
						// 	// this event fires not every time [fix*]
						// 	return reject(new Error("User already exists"));
						// }
						return reject(new Error(error.message));
					}
				})
				.on("error", () => reject(false));
		});
	}
}
