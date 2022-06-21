import { hash } from "argon2";
import { Arg, Authorized, Mutation, Resolver } from "type-graphql";
import { ValidationError } from "yup";
import { User, UserRoles } from "../entity/User";
import { FieldErrors, RegisterInput, UserFields, UserResponse } from "../types";
import {
	createUserValidationSchema,
	updateUserValidationSchema,
} from "../validation";

@Resolver()
export class UpdateUserResolver {
	@Authorized<keyof typeof UserRoles>(["Admin"])
	@Mutation(() => [User])
	async deleteUsers(
		@Arg("ids", () => [String]) ids: string[]
	): Promise<User[]> {
		// return deleted users

		// const deletedUsers = await User.delete(ids);
		// console.log(deletedUsers);
		// return deletedUsers.raw;

		const deletedUsers = await User.createQueryBuilder()
			.delete()
			.where("id in (:...ids)", { ids })
			.returning("*")
			.execute();
		console.log(deletedUsers);
		return deletedUsers.raw;
	}

	@Authorized<keyof typeof UserRoles>(["Admin"])
	@Mutation(() => UserResponse)
	async updateUser(
		@Arg("id") id: string,
		@Arg("newValues") user: UserFields
	): Promise<UserResponse> {
		const errors: FieldErrors[] = [];

		try {
			await updateUserValidationSchema.validate(user, {
				abortEarly: false,
			});

			const updatedUser = await User.createQueryBuilder()
				.update({
					...user,
				})
				.where("id=:id", { id })
				.returning("*")
				.execute();

			return new UserResponse().setData(updatedUser.raw[0]);
		} catch (error) {
			if (error.code === "23505") {
				return new UserResponse().setErrors([
					{
						field: "username",
						message: "That username already in use",
					},
				]);
			}

			(error as ValidationError).inner.forEach((e) => {
				errors.push({
					field: e.path!,
					message: e.message,
				});
			});

			return new UserResponse().setErrors(errors);
		}
	}

	@Authorized<keyof typeof UserRoles>(["Admin"])
	@Mutation(() => UserResponse)
	async createUser(
		@Arg("options") options: RegisterInput
	): Promise<UserResponse> {
		const { firstName, lastName, password, role, username } = options;
		try {
			await createUserValidationSchema.validate(options, {
				abortEarly: false,
			});
			const user = await User.create({
				firstName,
				lastName,
				username,
				role,
				password: await hash(password),
			}).save();

			return new UserResponse().setData(user);
		} catch (error) {
			const errors: any[] = [];

			if (error.code === "23505") {
				return new UserResponse().setErrors([
					{
						field: "username",
						message: "User already exists",
					},
				]);
			}

			(error as ValidationError).inner.forEach((e) => {
				errors.push({
					field: e.path!,
					message: e.message,
				});
			});

			return new UserResponse().setErrors(errors);
		}
	}
}
