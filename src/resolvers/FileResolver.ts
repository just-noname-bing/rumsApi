import { parse } from "csv-parse";

// @ts-ignore
import GraphQLUpload from "graphql-upload/GraphQLUpload.js"; // :(

import { Arg, Mutation, Resolver } from "type-graphql";
import { User } from "../entity/User";
import { Upload } from "../types";

@Resolver(User)
export class FileResolver {
	@Mutation(() => Boolean)
	async registerUsers(
		@Arg("file", () => GraphQLUpload) { createReadStream }: Upload
	): Promise<boolean> {
		return await new Promise((resolve, reject) => {
			createReadStream()
				.on("data", (row: Buffer) => {
					console.log(row);
					console.log(parse(row));
					resolve(true);
				})
				.on("error", () => reject(false));
		});
	}
}
