Rota	Método	Protegida?	Descrição	Parâmetros (Body)
/api/register	POST	Não	Cria um novo usuário e já retorna o token de acesso.	name, email, password, password_confirmation
/api/login	POST	Não	Valida as credenciais e gera um novo token Sanctum.	email, password, device_name (opcional)
/api/user	GET	Sim	Retorna os dados do usuário autenticado pelo token.	Enviar Bearer Token no Header
/api/logout	POST	Sim	Invalida e deleta o token atual do banco de dados.	Enviar Bearer Token no Header
