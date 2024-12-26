import {
	Button,
	Checkbox,
	Heading,
	MultiStep,
	Text,
	TextInput,
} from "@ignite-ui/react";
import { Container, Header } from "../styles";
import {
	IntervalBox,
	IntervalItem,
	IntervalsContainer,
	IntervalDay,
	IntervalInputs,
	FormError,
} from "./styles";
import { ArrowRight } from "phosphor-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { getWeekDay } from "@/utils/get-week-days";
import { zodResolver } from "@hookform/resolvers/zod";
import { convertTimeStringToMinutes } from "@/utils/conver-time-string-to-minutes";
import { api } from "@/lib/axios";
import { useRouter } from "next/router";

const timeIntervalsFormSchema = z.object({
	intervals: z
		.array(
			z.object({
				weekDay: z.number().min(0).max(6),
				enabled: z.boolean(),
				startTime: z.string(),
				endTime: z.string(),
			})
		)
		.length(7)
		.transform((intervals) => intervals.filter((interval) => interval.enabled))
		.refine((intervals) => intervals.length > 0, {
			message: "É necessário selecionar pelo menos um dia da semana!",
		})
		.transform((intervals) => {
			return intervals.map((interval) => {
				return {
					weekDay: interval.weekDay,

					startTimeInMinutes: convertTimeStringToMinutes(interval.startTime),
					endTimeInMinutes: convertTimeStringToMinutes(interval.endTime),
				};
			});
		})
		.refine(
			(intervals) => {
				return intervals.every(
					(interval) =>
						interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes
				);
			},
			{
				message:
					"O horário de término deve ser pelo menos 1 hora posterior ao início",
			}
		),
});

//aproveitando o schema p/tipagem na entrada de dados (é o schema antes de todas as tranformações)
type TimeIntervalsFormDataInput = z.input<typeof timeIntervalsFormSchema>;
//aproveitando o schema p/tipagem na entrada de dados (schema apos as transformações, caso exista)
type TimeIntervalsFormDataOutput = z.infer<typeof timeIntervalsFormSchema>;
//z.output e z.input fazem a msm coisa q o z.infer, só q é mais semântico para leitura

export default function TimeIntervals() {
	const {
		register,
		handleSubmit,
		control,
		watch,
		formState: { isSubmitting, errors },
	} = useForm<TimeIntervalsFormDataInput, unknown, TimeIntervalsFormDataOutput>(
		{
			resolver: zodResolver(timeIntervalsFormSchema),
			defaultValues: {
				intervals: [
					{
						weekDay: 0,
						enabled: false,
						startTime: "08:00",
						endTime: "17:00",
					},
					{
						weekDay: 1,
						enabled: true,
						startTime: "08:00",
						endTime: "18:00",
					},
					{
						weekDay: 2,
						enabled: true,
						startTime: "08:00",
						endTime: "18:00",
					},
					{
						weekDay: 3,
						enabled: true,
						startTime: "08:00",
						endTime: "18:00",
					},
					{
						weekDay: 4,
						enabled: true,
						startTime: "08:00",
						endTime: "18:00",
					},
					{
						weekDay: 5,
						enabled: true,
						startTime: "08:00",
						endTime: "18:00",
					},
					{
						weekDay: 6,
						enabled: false,
						startTime: "08:00",
						endTime: "18:00",
					},
				],
			},
		}
	);

	const weeDays = getWeekDay();

	const router = useRouter();

	const { fields } = useFieldArray({
		control,
		name: "intervals",
	});

	const intervals = watch("intervals");

	async function handleSetTimeIntervals(data: TimeIntervalsFormDataOutput) {
		const { intervals } = data;

		await api.post("/users/time-intervals", { intervals });

		await router.push(`/register/update-profile`);
	}

	return (
		<Container>
			<Header>
				<Heading as="strong">Quase lá</Heading>
				<Text>
					Defina o intervalo de horários que você está disponível em cada dia da
					semana.
				</Text>

				<MultiStep size={4} currentStep={3} />
			</Header>

			<IntervalBox as="form" onSubmit={handleSubmit(handleSetTimeIntervals)}>
				<IntervalsContainer>
					{fields.map((field, index) => {
						return (
							<IntervalItem key={field.id}>
								<IntervalDay>
									<Controller
										name={`intervals.${index}.enabled`}
										control={control}
										render={({ field }) => {
											return (
												<Checkbox
													onCheckedChange={(checked) => {
														field.onChange(checked === true);
													}}
													checked={field.value}
												/>
											);
										}}
									/>

									<Text>{weeDays[field.weekDay]}</Text>
								</IntervalDay>
								<IntervalInputs>
									<TextInput
										size="sm"
										type="time"
										step={60}
										disabled={intervals[index].enabled === false}
										{...register(`intervals.${index}.startTime`)}
									/>
									<TextInput
										size="sm"
										type="time"
										step={60}
										disabled={intervals[index].enabled === false}
										{...register(`intervals.${index}.endTime`)}
									/>
								</IntervalInputs>
							</IntervalItem>
						);
					})}
				</IntervalsContainer>

				{errors.intervals && (
					<FormError size="sm">{errors.intervals.root?.message}</FormError>
				)}

				<Button type="submit" disabled={isSubmitting}>
					Próximo passo
					<ArrowRight />
				</Button>
			</IntervalBox>
		</Container>
	);
}