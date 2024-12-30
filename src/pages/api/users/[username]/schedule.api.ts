import { getGoogleOAuthToken } from "@/lib/google";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";
import { google } from "googleapis";
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

export default async function handle(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		return res.status(405).end();
	}

	const username = String(req.query.username);

	const user = await prisma.user.findUnique({
		where: {
			username,
		},
	});

	if (!user) {
		return res.status(400).json({ message: "User does not exist." });
	}

	const createSchedulingBody = z.object({
		name: z.string(),
		email: z.string(),
		observations: z.string(),
		date: z.string().datetime(),
	});

	//precisamos de uma inf q ñ está no formulário, q é a data de agendamento.
	const { name, email, observations, date } = createSchedulingBody.parse(
		req.body
	);

	const schedulingDate = dayjs(date).startOf("hour");

	//verificar se a data já ñ passou
	if (schedulingDate.isBefore(new Date())) {
		return res.status(400).json({
			message: "Date is in the past.",
		});
	}

	const conflictingScheduling = await prisma.scheduling.findFirst({
		where: {
			user_id: user.id,
			date: schedulingDate.toDate(),
		},
	});

	if (conflictingScheduling) {
		return res.status(400).json({
			message: "There is another scheduling at the same time",
		});
	}

	const scheduling = await prisma.scheduling.create({
		data: {
			name,
			email,
			observations,
			date: schedulingDate.toDate(),
			user_id: user.id,
		},
	});

	const calendar = google.calendar({
		//precisamos passar os seguintes parâmetros.
		version: "v3", //essa é a unica versão possivel
		auth: await getGoogleOAuthToken(user.id),
	});

	//registrar um evento na api do google calendario
	await calendar.events.insert({
		//qndo fazemos integração com o calendario do google, o usuario tem 2 opções: qual calendario ele quer utilizar (criar um calendario personalizado dentro da agenda dele só para os eventos do igniteCall). mas como ñ criamos esse select (de selecioanr qual dos calendarios) vamos usar a opção primary q pega o calendario principal
		calendarId: "primary",
		conferenceDtaVersion: 1, //habilita para enviar a conferenceData (q definimos lá em baixo)
		requestBody: {
			//precisa ter todas as inf relacionadas ao evento em si.
			summary: `Ignite Call: ${name}`, //nome do usuario q pediu uma agenda com um outro usuario.
			description: observations,
			start: {
				//horario start
				dateTime: schedulingDate.format(), ///formata para o modelo ISO
			},
			end: {
				//horario end
				dateTime: schedulingDate.add(1, "hour").format(), //nossa regra de negocio é q o horário final vai ser 1h apos o horário de inicio, vamos adicionar 1h
			},
			attendees: [
				//quem vai estar convidado para o evento
				//no caso vamos colocar os outros usuarios
				{ email, displayName: name },
			],
			conferenceData: {
				//serve para conseguir criar o evento ja com uma chamada no googleMeet
				createRequest: {
					//para criar a chamada no google meet no momento q criarmos esse evento na agenda do usuário.
					requestId: scheduling.id, //precisa ser único
					conferenceSolutionKey: {
						type: "hangoutsMeet",
					},
				},
			},
		},
	});

	return res.status(201).end();
}
