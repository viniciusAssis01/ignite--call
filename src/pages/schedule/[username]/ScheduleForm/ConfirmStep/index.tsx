import { Button, Text, TextArea, TextInput } from "@ignite-ui/react";
import { ConfirmForm, FormActions, FormError, FormHeader } from "./styles";
import { CalendarBlank, Clock } from "phosphor-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { api } from "../../../../../lib/axios";
import { useRouter } from "next/router";

const confirmFormSchema = z.object({
	name: z
		.string()
		.min(3, { message: "O nome precisa de no mínimo 3 caracteres" }),
	email: z.string().email({ message: "Digite um e-mail valido" }),
	observations: z.string().nullable(),
});
type confirmFormData = z.infer<typeof confirmFormSchema>;

interface IConfirmStepProps {
	schedulingDate: Date;
	onCancelConfirmation: () => void;
}

export function ConfirmStep({
	schedulingDate,
	onCancelConfirmation,
}: IConfirmStepProps) {
	const {
		register,
		handleSubmit,
		formState: { isSubmitting, errors },
	} = useForm<confirmFormData>({
		resolver: zodResolver(confirmFormSchema),
	});

	const router = useRouter();
	const username = String(router.query.username);

	async function handleConfirmScheduling(data: confirmFormData) {
		const { email, name, observations } = data;

		await api.post(`/users/${username}/schedule`, {
			name,
			email,
			observations,
			date: schedulingDate,
		});

		onCancelConfirmation();
	}

	const describedDate = dayjs(schedulingDate).format("DD[ de] MMMM[ de ]YYYY");
	const describedTime = dayjs(schedulingDate).format("hh:mm[h]");

	return (
		<ConfirmForm as="form" onSubmit={handleSubmit(handleConfirmScheduling)}>
			<FormHeader>
				<Text>
					<CalendarBlank />
					{describedDate}
				</Text>
				<Text>
					<Clock />
					{describedTime}
				</Text>
			</FormHeader>

			<label>
				<Text size="$sm">Nome completo</Text>
				<TextInput placeholder="seu nome" {...register("name")} />
				{errors.name && <FormError size="sm">{errors.name.message}</FormError>}
			</label>

			<label>
				<Text size="$sm">Endereço de e-mail</Text>
				<TextInput
					type="email"
					placeholder="jonDoe@example.com"
					{...register("email")}
				/>
				{errors.email && (
					<FormError size="sm">{errors.email.message}</FormError>
				)}
			</label>

			<label>
				<Text size="$sm">Observações</Text>
				<TextArea {...register("observations")} />
			</label>

			<FormActions>
				<Button onClick={onCancelConfirmation} type="button" variant="Tertiary">
					Cancelar
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					Confirmar
				</Button>
			</FormActions>
		</ConfirmForm>
	);
}
