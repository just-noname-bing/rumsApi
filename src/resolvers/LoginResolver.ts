import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { User, UserRoles } from "../entity/User";
import { GraphqlContext, LoginInput, UserResponse } from "../types";

@Resolver(User)
export class LoginResolver {
	@Query(() => User)
	async me(@Ctx() { req }: GraphqlContext): Promise<User> {
		if (!req.session.userId) {
			throw new Error("Not Authenticated");
		}

		const user = await User.findOne({ where: { id: req.session.userId } });

		if (!user) {
			throw new Error("Not Authenticated");
		}

		// Is authenticated

		return user;
	}

	@Authorized<keyof typeof UserRoles>("Admin", "Moderator")
	@Query(() => [User])
	async users(): Promise<User[]> {
		return await User.find();
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("options") { password, username }: LoginInput,
		@Ctx() { req }: GraphqlContext
	): Promise<UserResponse> {
		if (req.session.userId) {
			throw new Error(
				"You already have a session, to login use logout first"
			);
		}

		// if user NOT in session
		const user = await User.findOne({ where: { username } });
		if (!user) {
			return new UserResponse().setErrors([
				{
					field: "username",
					message: "Username doesn't exist",
				},
			]);
		}

		if (!(await user.verify(password))) {
			return new UserResponse().setErrors([
				{
					field: "username",
					message: "Incorrect credentials",
				},
				{
					field: "password",
					message: "Incorrect credentials",
				},
			]);
		}

		// Success login
		// Save session
		req.session.userId = user.id;

		return new UserResponse().setData(user);
	}

	// @Mutation(() => UserResponse)
	// async register(
	// 	@Arg("options") { password, username }: LoginInput,
	// 	@Ctx() { req }: GraphqlContext
	// ): Promise<UserResponse> {
	// 	const errors: FieldErrors[] = [];

	// 	if (req.session.userId) {
	// 		throw new Error(
	// 			"You already have a session, to register use logout first"
	// 		);
	// 	}

	// 	// if NOT in session

	// 	// Validation
	// 	//
	// 	if (username.length < 3) {
	// 		errors.push({
	// 			field: "username",
	// 			message: "Username is too small",
	// 		});
	// 	}

	// 	if (password.length < 4) {
	// 		errors.push({
	// 			field: "password",
	// 			message: "Password is too small",
	// 		});
	// 	}

	// 	if (errors.length) {
	// 		return new UserResponse().setErrors(errors);
	// 	}

	// 	let user;
	// 	try {
	// 		user = await User.create({
	// 			username,
	// 			password: await hash(password),
	// 			firstName: "bob",
	// 			lastName: "bo",
	// 		}).save();
	// 	} catch (error) {
	// 		if (error.code == "23505") {
	// 			// already exists
	// 			return new UserResponse().setErrors([
	// 				{
	// 					field: "username",
	// 					message: "Already exists",
	// 				},
	// 			]);
	// 		}
	// 		throw new Error("Something went wrong");
	// 	}

	// 	// Success register
	// 	// Save session
	// 	req.session.userId = user.id;

	// 	return new UserResponse().setData(user);
	// }

	@Mutation(() => Boolean)
	async logout(@Ctx() { req }: GraphqlContext): Promise<boolean> {
		const err = await new Promise((resolve) =>
			req.session.destroy((err) => resolve(err))
		);

		return !err;
	}
}
