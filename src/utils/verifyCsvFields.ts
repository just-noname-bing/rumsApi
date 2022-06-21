import { hash } from "argon2";
import { ValidationError } from "yup";
import { User } from "../entity/User";
import { FieldErrors } from "../types";
import { createUserValidationSchema } from "../validation";

export async function castToUsersArray(usersToCreate: User[]) {
	const errors: FieldErrors[] = [];
	const users: User[] = await Promise.all(
		usersToCreate.map(async (user, idx) => {
			// idx++ not includes headers;
			idx += 2;
			const u = new User();

			try {
				await createUserValidationSchema.validate(user, {
					abortEarly: false,
				});
				u.username = user.username;
				u.firstName = user.firstName;
				u.lastName = user.lastName;
				u.password = await hash(user.password);
				u.role = user.role;

				return u;
			} catch (error) {
				(error as ValidationError).inner.forEach((e) => {
					errors.push({
						field: `[row: ${idx}] ` + e.path!,
						message: e.message,
					});
				});

				return user;
			}
		})
	);

	return { errors, users };
}
