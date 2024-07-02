import {
	ActionIcon,
	Box,
	Button,
	Container,
	Flex,
	Modal,
	Paper,
	Stack,
	Text,
	TextInput,
	Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { unstable_defineAction, unstable_defineLoader } from "@remix-run/node";
import type { MetaArgs_SingleFetch } from "@remix-run/react";
import { Form, useFetcher, useLoaderData } from "@remix-run/react";
import {
	DeleteUserDocument,
	RegisterErrorVariant,
	RegisterUserDocument,
	UsersListDocument,
} from "@ryot/generated/graphql/backend/graphql";
import { changeCase, randomString } from "@ryot/ts-utils";
import { IconPlus, IconRefresh, IconTrash } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { namedAction } from "remix-utils/named-action";
import { match } from "ts-pattern";
import { withQuery } from "ufo";
import { z } from "zod";
import { confirmWrapper } from "~/components/confirmation";
import {
	createToastHeaders,
	getAuthorizationHeader,
	processSubmission,
	serverGqlService,
} from "~/lib/utilities.server";

export const loader = unstable_defineLoader(async ({ request }) => {
	const [{ usersList }] = await Promise.all([
		serverGqlService.request(
			UsersListDocument,
			undefined,
			getAuthorizationHeader(request),
		),
	]);
	return { usersList };
});

export const meta = (_args: MetaArgs_SingleFetch<typeof loader>) => {
	return [{ title: "User Settings | Ryot" }];
};

export const action = unstable_defineAction(async ({ request }) => {
	const formData = await request.clone().formData();
	return namedAction(request, {
		delete: async () => {
			const submission = processSubmission(formData, deleteSchema);
			const { deleteUser } = await serverGqlService.request(
				DeleteUserDocument,
				submission,
				getAuthorizationHeader(request),
			);
			return Response.json({ status: "success", submission } as const, {
				headers: await createToastHeaders({
					type: deleteUser ? "success" : "error",
					message: deleteUser
						? "User deleted successfully"
						: "User can not be deleted",
				}),
			});
		},
		registerNew: async () => {
			const submission = processSubmission(formData, registerFormSchema);
			const { registerUser } = await serverGqlService.request(
				RegisterUserDocument,
				{ input: { password: submission } },
				getAuthorizationHeader(request),
			);
			const success = registerUser.__typename === "StringIdObject";
			return Response.json({ status: "success", submission } as const, {
				headers: await createToastHeaders({
					type: success ? "success" : "error",
					message: success
						? "User registered successfully"
						: match(registerUser.error)
								.with(
									RegisterErrorVariant.Disabled,
									() => "Registration is disabled",
								)
								.with(
									RegisterErrorVariant.IdentifierAlreadyExists,
									() => "Username already exists",
								)
								.exhaustive(),
				}),
			});
		},
	});
});

const registerFormSchema = z.object({
	username: z.string(),
	password: z.string(),
});

const deleteSchema = z.object({ toDeleteUserId: z.string() });

export default function Page() {
	const loaderData = useLoaderData<typeof loader>();
	const [
		registerUserModalOpened,
		{ open: openRegisterUserModal, close: closeRegisterUserModal },
	] = useDisclosure(false);
	const [password, setPassword] = useState("");
	const fetcher = useFetcher<typeof action>();
	const deleteFormRef = useRef<HTMLFormElement>(null);

	return (
		<Container size="xs">
			<Stack>
				<Flex align="center" gap="md">
					<Title>Users settings</Title>
					<ActionIcon
						color="green"
						variant="outline"
						onClick={() => {
							openRegisterUserModal();
						}}
					>
						<IconPlus size={20} />
					</ActionIcon>
				</Flex>
				<Modal
					opened={registerUserModalOpened}
					onClose={closeRegisterUserModal}
					withCloseButton={false}
					centered
				>
					<Form
						replace
						onSubmit={closeRegisterUserModal}
						method="post"
						action={withQuery("", { intent: "registerNew" })}
					>
						<Stack>
							<Title order={3}>Create User</Title>
							<TextInput label="Name" required name="username" />
							<TextInput
								label="Password"
								required
								name="password"
								value={password}
								onChange={(e) => setPassword(e.currentTarget.value)}
								rightSection={
									<ActionIcon
										onClick={() => {
											setPassword(randomString(7));
										}}
									>
										<IconRefresh size={16} />
									</ActionIcon>
								}
							/>
							<Button variant="outline" type="submit">
								Create
							</Button>
						</Stack>
					</Form>
				</Modal>
				{loaderData.usersList.map((user) => (
					<Paper p="xs" withBorder key={user.id} data-user-id={user.id}>
						<Flex align="center" justify="space-between">
							<Box>
								<Text>{user.name}</Text>
								<Text size="xs">Role: {changeCase(user.lot)}</Text>
							</Box>
							<fetcher.Form
								method="post"
								ref={deleteFormRef}
								action={withQuery("", { intent: "delete" })}
							>
								<input hidden name="toDeleteUserId" defaultValue={user.id} />
								<ActionIcon
									color="red"
									variant="outline"
									onClick={async () => {
										const conf = await confirmWrapper({
											confirmation:
												"Are you sure you want to delete this user?",
										});
										if (conf) fetcher.submit(deleteFormRef.current);
									}}
								>
									<IconTrash size={16} />
								</ActionIcon>
							</fetcher.Form>
						</Flex>
					</Paper>
				))}
			</Stack>
		</Container>
	);
}
