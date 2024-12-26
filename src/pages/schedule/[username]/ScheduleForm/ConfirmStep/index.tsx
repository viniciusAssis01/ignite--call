import { Button, Text, TextArea, TextInput } from "@ignite-ui/react";
import { ConfirmForm, FormActions, FormError, FormHeader } from "./styles";
import { CalendarBlank, Clock } from "phosphor-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const confirmFormSchema = z.object({
	name: z
		.string()
		.min(3, { message: "O nome precisa de no mínimo 3 caracteres" }),
	email: z.string().email({ message: "Digite um e-mail valido" }),
	observations: z.string().nullable(), //colocando nullable, o zod entende q esse campo ñ é obrigatório.
});

export function ConfirmStep() {
	const {
		register,
		handleSubmit,
		formState: { isSubmitting, errors },
	} = useForm<confirmFormData>({
		resolver: zodResolver(confirmFormSchema),
	});

	type confirmFormData = z.infer<typeof confirmFormSchema>;

	function handleConfirmScheduling(data: confirmFormData) {
		console.log(data);
	}

	return (
		<ConfirmForm as="form" onSubmit={handleSubmit(handleConfirmScheduling)}>
			<FormHeader>
				<Text>
					<CalendarBlank />
					22 de Setembro de 2022
				</Text>
				<Text>
					<Clock />
					18:00h
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
				<Button type="button" variant="Tertiary">
					Cancelar
				</Button>
				<Button type="submit" disabled={isSubmitting}>
					Confirmar
				</Button>
			</FormActions>
		</ConfirmForm>
	);
}
