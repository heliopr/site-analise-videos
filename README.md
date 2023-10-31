# site-analise-videos

## Instruções

### Processar vídeos
1. Criar pasta `processar` com os videos para processar dentro dela
2. Rode `npm run processarVideos`
3. Aguardar
4. Vídeos processados vão estar na pasta `videos` e no arquivo `videos.json`

### Rodar o servidor
1. Crie um arquivo chamado `.env` e siga o exemplo abaixo, configurando de acordo com o seu banco de dados MongoDB
2. Rode `node .`

## Exemplo .env
```
BD_PORTA=27017
BD_ENDERECO=127.0.0.1
BD_DB=videos
```