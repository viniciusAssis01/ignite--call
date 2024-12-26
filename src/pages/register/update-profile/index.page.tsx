import {
	Avatar,
	Button,
	Heading,
	MultiStep,
	Text,
	TextArea,
} from "@ignite-ui/react";
import { Container, Header } from "../styles";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormAnnotation, ProfileBox } from "./styles";
import { ArrowRight } from "phosphor-react";
import { useSession } from "next-auth/react";
import { GetServerSideProps } from "next";
import { getServerSession } from "next-auth";
import { buildNextAuthOptions } from "@/pages/api/auth/[...nextauth].api";
import { api } from "@/lib/axios";
import { useRouter } from "next/router";

const updateProfileSchema = z.object({
	bio: z.string(),
});
type updateProfileData = z.infer<typeof updateProfileSchema>;

export default function UpdateProfile() {
	const {
		register,
		handleSubmit,
		formState: { isSubmitting },
	} = useForm<updateProfileData>({
		resolver: zodResolver(updateProfileSchema),
	});

	const session = useSession();
	//console.log(session.data?.user.avatar_url);

	const router = useRouter();

	async function handleUpdateProfile(data: updateProfileData) {
		await api.put("/users/profile", {
			bio: data.bio,
		});

		//vamos usar crase para adicionarmos parâmetros
		await router.push(`/schedule/${session.data?.user.username}`);
		//essa rota é q vai mostrar a pg de calendario
	}

	return (
		<Container>
			<Header>
				<Heading as="strong">Quase lá</Heading>
				<Text>Por último, uma breve descrição e uma foto de perfil.</Text>
				<MultiStep size={4} currentStep={4} />
			</Header>

			<ProfileBox as="form" onSubmit={handleSubmit(handleUpdateProfile)}>
				<label>
					<Text size="sm">Foto de perfil</Text>
					<Avatar
						src={session.data?.user.avatar_url}
						alt={session.data?.user.name}
					/>
				</label>
				<label>
					<Text size="sm">Sobre você</Text>
					<TextArea {...register("bio")} />
					<FormAnnotation size="sm">
						Fale um pouco sobre você. Isto será exibido em sua página pessoal.
					</FormAnnotation>
				</label>
				<Button type="submit" disabled={isSubmitting}>
					Finalizar
					<ArrowRight />
				</Button>
			</ProfileBox>
		</Container>
	);
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
	const session = await getServerSession(
		req,
		res,
		buildNextAuthOptions(req, res)
	);

	return {
		props: {
			session,
		},
	};
};
