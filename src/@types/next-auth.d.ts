import NextAuth from "next-auth";
//ao sobreescrever a tipagem de uma lib somos obrigado a importar a classe dessa lib (caso ñ importarmos ele vai achar q estamos criando uma tipagem nova do zero)

declare module "next-auth" {
	//vamos sobrescrever a interface do user e ñ do adapterUser (pois esta estende a classe User)
	interface User {
		id: string;
		name: string;
		email: string;
		username: string;
		avatar_url: string;
	}

	//sobrescrever a interface session
	interface Session {
		user: User;
	}
}
