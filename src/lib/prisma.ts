import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
	log: ["query"],
	//para o prisma fazer o log de todos os SQL executados no DB (ou seja, todas as queries executadas no DB) dentro do nosso terminal. Assim, ao fazer inserção a gente consegue ver o comando SQL "insert..." (enfim, para descrever o comando/query SQL q foi executada)
});

//veja q ñ precisamos passar qlq informaçaõ de conexão com o DB, URL, porta, usuario, senha,... pq o prisma vai entender automaticamente quais sao essas informações de conexão com o DB a partir do nosso arquivo .env
//então ao fazer a instancia acima, ele vai lser o arquivo .env e vai saber qual que é as informações de conexão com o DB q ele precisa seguir
