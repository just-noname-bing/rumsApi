import { verify } from "argon2";
import { Field, ObjectType, registerEnumType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum UserRoles {
	Admin = "Admin",
	Moderator = "Moderator",
	Normal = "Normal",
}

registerEnumType(UserRoles, {
	name: "UserRoles", // this one is mandatory
});

@ObjectType()
@Entity()
export class User extends BaseEntity {
	@Field()
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Field()
	@Column({ unique: true })
	username: string;

	@Field()
	@Column()
	firstName: string;

	@Field()
	@Column()
	lastName: string;

	@Column({
		type: "enum",
		enum: UserRoles,
		default: UserRoles.Normal,
	})
	@Field(() => UserRoles)
	// @Authorized<keyof typeof UserRoles>(["Admin", "Moderator"])
	role: keyof typeof UserRoles;

	@Column()
	password: string;

	async verify(password: string) {
		return await verify(this.password, password);
	}
}
