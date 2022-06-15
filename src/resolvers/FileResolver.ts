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
						await User.save(users, { chunk: 10 });
					} catch (error) {
						console.log(error);
						if (error.code === "23505") {
							return reject(new Error("User already exists"));
						}
						return reject(new Error(error.message));
					}
					// verify users and then add them to db
					resolve(true);
				})
				.on("error", () => reject(false));
		});
	}
}
