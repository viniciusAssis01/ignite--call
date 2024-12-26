import { Avatar, Heading, Text } from "@ignite-ui/react";
import { Container, UserHeader } from "./styles";
import { GetStaticPaths, GetStaticProps } from "next";
import { prisma } from "@/lib/prisma";
import { ScheduleForm } from "./ScheduleForm";

interface IScheduleProps {
	user: {
		name: string;
		bio: string;
		avatarUrl: string;
	};
}

export default function Schedules({ user }: IScheduleProps) {
	//console.log(user);

	return (
		<Container>
			<UserHeader>
				<Avatar src={user.avatarUrl} />
				<Heading>{user.name}</Heading>
				<Text>{user.bio}</Text>
			</UserHeader>

			<ScheduleForm />
		</Container>
	);
}

export const getStaticPaths: GetStaticPaths = async () => {
	return {
		paths: [], //vamos deixar o array vazio para ele ñ gerar nenhuma pg estática no momento da build do next, e sim gerar conforme os usuários forem acessando essa pg.
		fallback: "blocking",
	};
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const username = String(params!.username);

	const user = await prisma.user.findUnique({
		where: {
			username,
		},
	});

	if (!user) {
		return { notFound: true };
		//esse notFound é o status 404(erro 404), mostrando aqla pg 404 do next (q inclusive é customizável, basta criar um arq 404 na pasta pages)
	}

	return {
		props: {
			user: {
				name: user.name,
				bio: user.bio,
				avatarUrl: user.avatar_url,
			},
		},
		revalidate: 60 * 60 * 24, //1day
	};
};
