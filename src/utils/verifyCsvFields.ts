import { hash } from "argon2";
import { User } from "../entity/User";

export async function castToUsersArray(usersToCreate: User[]) {
	const users: User[] = await Promise.all(
		usersToCreate.map(async (user, idx) => {
			// idx++ not includes headers;
			idx += 2;
			const u = new User();

			if (!user.username) {
				throw new Error(
					`cannot find required field [username] row[${idx}]`
				);
			} else if (user.username.length < 3) {
				throw new Error(`row[${idx}] [username] is too small`);
			}

			if (!user.firstName) {
				throw new Error(
					`cannot find required field [firstName] row[${idx}]`
				);
			} else if (user.firstName.length < 3) {
				throw new Error(`[row[${idx}] firstName] is too small`);
			}

			if (!user.lastName) {
				throw new Error(
					`cannot find required field [lastName] row[${idx}]`
				);
			} else if (user.lastName.length < 3) {
				throw new Error(`row[${idx}] [lastName] is too small`);
			}

			if (!user.password) {
				throw new Error(
					`cannot find required field [password] row[${idx}]`
				);
			} else if (user.password.length < 3) {
				throw new Error(`row[${idx}] [password] is too small`);
			}

			u.username = user.username;
			u.firstName = user.firstName;
			u.lastName = user.lastName;
			u.password = await hash(user.password);
			return u;
		})
	);

	return users;
}
