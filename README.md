# site-analise-videos

# Instruções

### Processar vídeos
1. Crie uma pasta `processar` com os videos para processar dentro dela
2. Rode `npm run processarVideos`
3. Aguarde
4. Vídeos processados vão estar na pasta `videos` e no arquivo `videos.json`

### Rodar o servidor
1. Crie um arquivo chamado `.env` e siga o exemplo abaixo, configurando de acordo com o seu banco de dados MongoDB
2. Rode `npm install` para instalar as dependências
3. Rode `node .`

## Exemplo .env
```
BD_PORTA=27017
BD_ENDERECO=127.0.0.1
BD_DB=videos
```

# API

### Respostas
Em geral as respostas de uma requisição são um objeto JSON, contendo sempre uma propriedade chamada `sucesso` (auto-explicativo). Se `sucesso` for `false` significa que um erro ocorreu no servidor, neste caso o status será `400` e a propriedade `mensagem` dirá mais sobre esse erro. Exemplo:

```json
{
    "sucesso": false,
    "mensagem": "mensagem detalhando o erro aqui blah blah blah"
}
```

## GET /videos
Retorna um objeto JSON com uma lista que contém os nomes de todos os vídeos. Exemplo:
```GET /videos```

```json
{
    "sucesso": true,
    "videos": [
        "60fps.mp4",
        "video2.mp4",
        "blahblahblah.mp4"
    ]
}
```

## GET /videos/{video}<br>
Retorna informações sobre o vídeo. Exemplo:
```GET /videos/60fps.mp4```

Resposta:
```json
{
    "sucesso": true,
    "video": {
        "nome": "60fps.mp4",
        "fps": 59.94,
        "duracaoOriginal": 36.535,
        "duracao": 0.65065,
        "tamanho": 5193577,
        "frames": 39
    }
}
```

## GET /videos/{video}/arquivo
Retorna o arquivo do vídeo, só retorna um objeto JSON em caso de erro (status 400). Exemplo:
```GET /videos/60fps.mp4/arquivo```

Retorno: 
![Resposta](https://i.imgur.com/myvu4g3.png)

---

## GET /videos/{video}/marcacoes
Retorna as marcações associadas ao vídeo. Exemplo:
```GET /videos/60fps.mp4/marcacoes```

Resposta:
```json
{
    "sucesso": true,
    "marcacoes": [
        {
            "frame": 1,
            "contemInterprete": true,
            "pos1": [10, 10],
            "pos2": [15, 15]
        },
        {
            "frame": 200,
            "contemInterprete": false
        },
        {
            "frame": 300,
            "contemInterprete": true,
            "pos1": [10, 10],
            "pos2": [100, 100]
        }
    ]
}
```

## POST /videos/{video}/marcacoes
Serve para criar as marcações de um vídeo. Exemplo:

```POST /videos/60fps.mp4/marcacoes```

Requisição:
```json
{
    "marcacoes": [
        {
            "frame": 1,
            "contemInterprete": true,
            "pos1": [10, 10],
            "pos2": [15, 15]
        },
        {
            "frame": 200,
            "contemInterprete": false
        },
        {
            "frame": 300,
            "contemInterprete": true,
            "pos1": [10, 10],
            "pos2": [100, 100]
        }
    ]
}
```

Resposta:
```json
{
    "sucesso": true
}
```