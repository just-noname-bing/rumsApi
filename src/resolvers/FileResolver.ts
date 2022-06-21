import { parse } from "csv-parse/sync";
// @ts-ignore
import GraphQLUpload from "graphql-upload/GraphQLUpload.js"; // :(

import { Arg, Authorized, Mutation, Resolver } from "type-graphql";
import { User, UserRoles } from "../entity/User";
import { HandleErrors, Upload } from "../types";
import { castToUsersArray } from "../utils/verifyCsvFields";

@Resolver(User)
export class FileResolver {
	@Authorized<keyof typeof UserRoles>(["Admin", "Moderator"])
	@Mutation(() => HandleErrors)
	async registerUsers(
		@Arg("file", () => GraphQLUpload) { createReadStream }: Upload
	): Promise<HandleErrors> {
		return await new Promise((resolve, reject) => {
			createReadStream()
				.on("data", async (row: Buffer) => {
					try {
						const usersToCreate: User[] = parse(row, {
							columns: true,
						});

						const { errors, users } = await castToUsersArray(
							usersToCreate
						);

						if (errors.length) {
							return resolve(
								new HandleErrors().setErrors(errors)
							);
						}
						// await User.save(users, { chunk: 10 });

						const createdUsers = await User.createQueryBuilder()
							.insert()
							.values(users)
							.orIgnore()
							.returning("*")
							.execute();

						return resolve(
							new HandleErrors().setCreatedUsers(createdUsers.raw)
						);
					} catch (error) {
						// if (error.code === "23505") {
						// 	// this event fires not every time [fix*]
						// 	return reject(new Error("User already exists"));
						// }
						reject(error);
					}
				})
				.on("error", () => reject("Something went wrong"));
		});
	}
}
