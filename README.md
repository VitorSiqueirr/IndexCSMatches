# CS Match Indexer by Vitor Siqueira

# Indexador de Partidas de CS

Com o crescimento do mercado de E-sports, você resolve construir um projeto capaz de consumir dados de uma API, responsável por armazenar partidas de CS

## Tarefas

1. Crie formulários para a criação de:

a. Times

b. Jogadores

c. Partidas

    Obs1: Para a criação de jogadores, deve existir primeiro um time

    Obs2: Para a criação de uma partida, devem existir times primeiro.

    Obs3: Não é necessário dar suporte a atualização de registros.

    Obs4: Atente-se para os casos onde o formulário necessita de dados do servidor (ex: para criar um jogador, deve-se conhecer a lista de times existentes).

Estes formulários devem realizar requisições POST para a API.

2. Na Home page, apresente uma lista de partidas, detalhando o nome dos times e dos jogadores referenciados nos dados da partida.

## Modelos

### Times

#### Campos

- name: Nome do time, campo obrigatório.
- country: país do time, campo obrigatório.
- region: Servidor do time, campo obrigatório.

#### Associações

- Um time tem muitos jogadores
- Um time tem muitas partidas como em casa
- Um time tem muitas partidas como fora de casa

### Player

#### Campos

- name: Nome do Jogador, campo obrigatório.
- nickname: Nickname do jogador, campo obrigatório.
- nationality: País onde o jogador nasceu, campo obrigatório.
- birth_date: Data de nascimento do jogador, para participar dos jogos o jogador precisa ter pelomenos 18 anos de idade, campo obrigatório.

#### Associações

- Um jogador possui um time
- Um jogador possui várias performances em partidas

### Match

#### Campos

- team_home_score: pontuação do time de casa
- team_away_score: pontuação do time de fora

#### Associações

- possui um time de casa
- possui um time de fora de casa
- possui várias performances de jogador

### PlayerPerformance

#### Campos

- kills: quantidades de abates, obrigatório e sempre positivo.
- assists: quantidades de assistências, obrigatório e sempre positivo.
- deaths: quantidades de mortes, obrigatório e sempre positivo.
- heashots: quantidades de tiros na cabeça, obrigatório e sempre positivo.

#### Associações

- possui um jogador
- possui uma partida

## Resources

### Team

#### Create

POST /teams/
request_body:

```json
{
  "name": "Furia",
  "country": "Brasil",
  "region": "South America"
}
```

response: HTTP/1.1 201 created

#### update

PUT(PATCH) /teams/:id

request_body:

```json
{
  "name": "Furia",
  "country": "Brasil",
  "region": "South America"
}
```

response: HTTP/1.1 200 OK

#### destroy

DELETE /teams/:id

request_body:empty body

response: HTTP/1.1 204 NO CONTENT

#### index

GET /teams/

response: HTTP/1.1 200 OK

```json
[
  {
    "id": 1,
    "name": "Furia",
    "country": "Brasil",
    "region": "South America"
    "players": [
        {
            "id": 1,
            "name": "Gabsriel",
            "nickname": "Fallen",
            "nationality": "Brazil",
            "birth_date": "1997-11-16",
            "age": 25
        },
        {
            "id": 2,
            "name": "Gabriel",
            "nickname": "Fallen",
            "nationality": null,
            "birth_date": "1997-11-16",
            "age": 25
        },
        {
            "id": 8,
            "name": "Gabriel",
            "nickname": "Fallen",
            "nationality": "Brazil",
            "birth_date": "1997-11-16",
            "age": 25
        }
    ],
    "matches_as_home": [
        {
            "win?": false,
            "score": 2,
            "opponent_score": 10,
            "opponent_name": "Teste",
            "opponent_id": 2
        }
    ],
    "matches_as_away": [
      {
        "win?": false,
        "score": 2,
        "opponent_score": 10,
        "opponent_name": "Teste",
        "opponent_id": 2
      }
    ]
}
]

```

#### show

GET /teams/:id

response: HTTP/1.1 200 OK

```json
{
    "id": 1,
    "name": "Furia",
    "country": "Brasil",
    "region": "South America"
    "players": [
        {
            "id": 1,
            "name": "Gabsriel",
            "nickname": "Fallen",
            "nationality": "Brazil",
            "birth_date": "1997-11-16",
            "age": 25
        },
        {
            "id": 2,
            "name": "Gabriel",
            "nickname": "Fallen",
            "nationality": null,
            "birth_date": "1997-11-16",
            "age": 25
        },
        {
            "id": 8,
            "name": "Gabriel",
            "nickname": "Fallen",
            "nationality": "Brazil",
            "birth_date": "1997-11-16",
            "age": 25
        }
    ],
    "matches_as_home": [
        {
            "win?": false,
            "score": 2,
            "opponent_score": 10,
            "opponent_name": "Teste",
            "opponent_id": 2
        }
    ],
    "matches_as_away": [
      {
        "win?": false,
        "score": 2,
        "opponent_score": 10,
        "opponent_name": "Teste",
        "opponent_id": 2
      }
    ]
}


```

### Player

#### Create

POST /players/
request_body:

```json
{
  "team_id": "1",
  "name": "Gabriel",
  "nickname": "Fallen",
  "nationality": "Brazil",
  "birth_date": "16/11/1997"
}
```

response: HTTP/1.1 201 created

#### update

PUT(PATCH) /players/:id

request_body:

```json
{
  "team_id": "1",
  "name": "Gabriel",
  "nickname": "Fallen",
  "nationality": "Brazil",
  "birth_date": "16/11/1997"
}
```

response: HTTP/1.1 200 OK

#### destroy

DELETE /players/:id

request_body:empty body

response: HTTP/1.1 204 NO CONTENT

#### index

GET /players/

response: HTTP/1.1 200 OK

```json
[
  {
    "id": 12,
    "name": "Gabriel",
    "nickname": "Fallen",
    "nationality": "Brazil",
    "birth_date": "1997-11-16",
    "age": 25,
    "team": {
      "id": 2,
      "name": "Teste",
      "country": "Country",
      "region": "Region"
    },
    "player_performances": [
      {
        "kills": 1,
        "deaths": 1,
        "assists": 3,
        "headshots": 4,
        "match": "Teste X Teste",
        "win?": true,
        "team_score": 10,
        "opponent_score": 2
      }
    ]
  }
]
```

#### show

GET /players/:id

response: HTTP/1.1 200 OK

```json
{
  "id": 12,
  "name": "Gabriel",
  "nickname": "Fallen",
  "nationality": "Brazil",
  "birth_date": "1997-11-16",
  "age": 25,
  "team": {
    "id": 2,
    "name": "Teste",
    "country": "Country",
    "region": "Region"
  },
  "player_performances": [
    {
      "kills": 1,
      "deaths": 1,
      "assists": 3,
      "headshots": 4,
      "match": "Teste X Teste",
      "win?": true,
      "team_score": 10,
      "opponent_score": 2
    }
  ]
}
```

### Match

#### create

POST /matches/

request_body:

```json
{
  "team_home_id": "3",
  "team_away_id": "2",
  "team_home_score": "2",
  "team_away_score": 10,
  "player_performances_attributes": [
    {
      "player_id": 12,
      "kills": 1,
      "deaths": 1,
      "assists": 3,
      "headshots": 4
    },
    {
      "player_id": 11,
      "kills": 1,
      "deaths": 1,
      "assists": 3,
      "headshots": 4
    }
  ]
}
```

## Requisitos

- Fazer utilizando react-query
- Teste o que for desenvolvido
- Faça commits organizados
