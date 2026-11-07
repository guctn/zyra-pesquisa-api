# Diário de pesquisa

## Contexto do TCC
O ZYRA é um aplicativo mobile que ajuda pessoas com daltonismo a identificar cores e montar looks com as próprias roupas. Um chat com IA sugere looks usando só as peças cadastradas, e o usuário pode salvá-los.

## Pergunta de pesquisa
Como o @tanstack/react-query permite listar, salvar e apagar os looks do ZYRA (GET/POST/DELETE /looks) de forma que a lista se atualize sozinha depois de cada alteração e o app continue utilizável quando o back fica fora do ar?

## Alternativas consideradas
| Opção | Serve para | Funciona no Expo Go | Decisão |
|-------|------------|---------------------|---------|
| fetch direto (apiRequest atual) | Fazer uma requisição HTTP. Estado, erro e recarga da lista ficam por conta de quem chama | Sim, `fetch` já vem no React Native ([Networking](https://reactnative.dev/docs/network)) | Não: depois de salvar ou apagar, eu teria que recarregar a lista à mão, e não há cache nem nova tentativa |
| hook próprio useFetch | Centralizar carregando, erro e dados num hook reaproveitável | Sim, é código meu sobre o `fetch` | Não: centraliza o código, mas cache, invalidação e nova tentativa continuariam sendo escritos por mim |
| @tanstack/react-query | Gerenciar dados do servidor: cache, `useQuery`, `useMutation`, `invalidateQueries`, nova tentativa | Sim, aparece com o filtro "Works with Expo Go" no [React Native Directory](https://reactnative.directory/packages?search=%40tanstack%2Freact-query&expoGo=true), como a [doc do Expo](https://docs.expo.dev/workflow/using-libraries/) manda conferir | Sim: a lista se atualiza invalidando a query depois da mutação, e as queries tentam de novo 3 vezes antes de mostrar erro |

## Mapa do tema com duas IAs
Mesmo prompt de mapa e de comparação enviado ao ChatGPT e ao Claude, em conversas novas.

| Ponto | ChatGPT | Claude | O que a documentação confirma |
|-------|---------|--------|-------------------------------|
| Detectar a rede no React Native | `expo-network` + `AppState` | Só o NetInfo | As duas servem: a página React Native do TanStack Query mostra exemplos com `@react-native-community/netinfo` e com `expo-network` |
| Alternativas listadas | 5: fetch, TanStack Query, RTK Query, Axios + Zustand, offline-first com SQLite | 7 + NetInfo: inclui também SWR, Legend-State e WatermelonDB | Nenhuma listou o hook próprio `useFetch` como alternativa separada |
| Asteriscos (informação incerta) | Nenhum, dizendo que tudo foi conferido | Marcou os pontos incertos | O ChatGPT tinha um link quebrado, então não tinha conferido tudo |
| Recomendação | TanStack Query + fetch | TanStack Query + Axios + NetInfo | As duas recomendam o TanStack Query, e o `fetch` basta para a PoC |

Descoberta: "back fora do ar" não é "celular sem internet". O NetInfo e o `onlineManager` detectam a rede do celular, não se o NestJS responde. Com o Wi-Fi ligado e o back desligado, a query tenta e falha, e repete 3 vezes com espera crescente antes de mostrar o erro.

## Fontes oficiais lidas
- React Native: Networking (https://reactnative.dev/docs/network)
- TanStack Query: React Native (https://tanstack.com/query/latest/docs/framework/react/react-native)
- TanStack Query: Mutations (https://tanstack.com/query/latest/docs/framework/react/guides/mutations)
- TanStack Query: Network Mode (https://tanstack.com/query/latest/docs/framework/react/guides/network-mode)
- TanStack Query: Important Defaults (https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults)
- Expo: Using third-party libraries (https://docs.expo.dev/workflow/using-libraries/)
- Expo: Network (https://docs.expo.dev/versions/latest/sdk/network/)
- Expo: NetInfo (https://docs.expo.dev/versions/latest/sdk/netinfo/)
- Expo: Using Model Context Protocol (MCP) with Expo (https://docs.expo.dev/eas/ai/mcp/)
- Expo: Environment variables in Expo (https://docs.expo.dev/guides/environment-variables/)
- React Native Directory: @tanstack/react-query com filtro "Works with Expo Go" (https://reactnative.directory/packages?search=%40tanstack%2Freact-query&expoGo=true)

## API do ZYRA usada pela PoC
Conferido no código do back (`src/auth` e `src/looks`) e testado com `curl` no back rodando localmente.

- Autenticação: `POST /auth/login` com `{ email, password }` devolve `{ accessToken, idToken, refreshToken, expiresIn, tokenType }`. O access token dura 3600 s (1 hora). As rotas de looks exigem `Authorization: Bearer <accessToken>`. Sem token ou com token inválido/vencido respondem 401.
- `GET /looks`: lista os looks do usuário, do mais recente para o mais antigo. Cada look tem `{ id, nome, ocasiao, criadoEm, pecas }`.
- `POST /looks`: corpo com `pecaIds` (obrigatório, 1 a 6 IDs de peças do próprio armário), `nome` (até 60 caracteres), `pedido` e `ocasiao` (opcionais). Responde 201 com o look salvo, que passa a ser o primeiro da lista.
  - Mesmas peças de um look já salvo: devolve o look existente, sem criar cópia.
  - Campo que não existe no corpo: 400 ("property titulo should not exist").
  - `pecaIds` vazio: 400. Peça que não é do usuário: 404.
  - Sem `nome` e com `pedido`, o back gera o título com a OpenAI.
- `DELETE /looks/:id`: 200 `{ "message": "Look removido." }`. Id que não é UUID: 400. Look inexistente ou de outra pessoa: 404. Apagar um look não apaga as peças.
- As peças do usuário vêm de `GET /pecas` (cada uma com `id`, `categoria`, `corNome`, `hex`, `colorAddSymbol`, `imagemMiniUrl`…).
- O back escuta na porta 3000, e o celular acessa pelo IP do Mac na mesma rede, que muda conforme a rede.

Limitação para a demonstração: o token vence em 1 hora, então é preciso gerar um novo pouco antes de apresentar.

## Verificação do agente (exercício 6)
Copilot em modo Agent no VS Code, modelo escolhido automaticamente: GPT-6 Luna. Servidor MCP do Expo conectado (56 ferramentas).

- 1ª tentativa: o servidor `expo` ainda não estava autenticado no chat. O painel mostra "Search Tools" sem nenhuma ferramenta do Expo, e o próprio agente escreveu "my search didn't yield any Expo tools". Não passou.
- 2ª tentativa, depois de autenticar e abrir conversa nova: passou. O painel mostra `Read AGENTS.md`, `Read package.json`, `Expo Documentation Search – expo (MCP Server)` e `Read Expo Documentation Page – expo (MCP Server)`. A resposta informa SDK 58 (`~58.0.23`) e cita o `AGENTS.md` com `@tanstack/react-query`.

Observações:
- A busca do Expo (consulta "@tanstack/react-query React Query TanStack Query documentation") devolveu só páginas do Expo sem relação (MCP, Expo Router, skills, navegação). A documentação do Expo não cobre o TanStack Query, que tem site próprio.
- A página do Expo sobre MCP (https://docs.expo.dev/eas/ai/mcp/) diz que a busca na documentação "requires an Expo Services paid plan", mas a busca funcionou com a minha conta gratuita.
- A ferramenta "Read Expo Documentation Page" não se limita ao site do Expo: no pedido do plano de implementação, ela leu páginas do tanstack.com (Mutations, Query Invalidation e Query Retries).

## Alteração pequena (exercício 9)
- Pedido: mostrar "Minhas peças" em quadrados, 3 por linha, com a miniatura (`imagemMiniUrl`), a categoria e o nome da cor, usando o `Image` do React Native, sem instalar pacote.
- Resultado: o diff mudou só `components/PieceList.tsx`, sem dependência nova, e lint e typecheck passaram.
- Precisou de um segundo pedido, só visual: na primeira versão a imagem ficava espremida dentro de um cartão quadrado. Na segunda, a miniatura é quadrada e ocupa a largura do cartão, com o texto abaixo. De novo só `components/PieceList.tsx` mudou.
- Mantive o nome da cor escrito abaixo da imagem: para quem tem daltonismo, a foto sozinha não basta.

## Onde a IA errou

### 1. ChatGPT afirmou ter conferido tudo
- Pedido: comparar fetch, useFetch e react-query, marcando com asterisco toda informação incerta.
- O que veio: nenhum asterisco, com a justificativa de que tudo foi conferido nas documentações oficiais.
- Como percebi: abri os links da resposta anterior, e o do Zustand (zustand.docs.pmnd.rs/getting-started/introduction) dá 404.
- O certo: a página não existe. A documentação fica em https://zustand.docs.pmnd.rs/.

### 2. ChatGPT sobre nova tentativa em operações de escrita
- Pedido: limitações do react-query.
- O que veio: um alerta de que o retry automático pode repetir operações de escrita.
- Como percebi: documentação de mutations.
- O certo: "By default, TanStack Query will not retry a mutation on error". Mutações não são repetidas por padrão.

### 3. Claude juntou duas alternativas
- Pedido: comparar três opções (fetch, hook useFetch e react-query) numa tabela.
- O que veio: uma tabela com duas linhas, com "fetch + useFetch" juntos.
- Como percebi: contei as linhas da tabela.
- O certo: são três alternativas distintas na trilha de consumo de API da apostila.

### 4. Claude citou link quebrado e fonte não oficial
- Pedido: mapa do tema com a página oficial de cada alternativa.
- O que veio: o link tanstack.com/query/latest/docs/react/reference/onlineManager e a fonte expo.nodejs.cn para o NetInfo.
- Como percebi: o primeiro dá 404, e o segundo não é o domínio docs.expo.dev.
- O certo: https://tanstack.com/query/latest/docs/reference/onlineManager e https://docs.expo.dev/versions/latest/sdk/netinfo/.

### 5. Copilot disse ter consultado a documentação do Expo sem ter usado as ferramentas do Expo
- Pedido: prompt de verificação da apostila ("Usando as ferramentas do Expo, leia a documentação do pacote…").
- O que veio: "Consultei a visão geral oficial do TanStack Query… e a referência do Expo SDK 58", como se tivesse cumprido o pedido.
- Como percebi: no painel do chat, o agente só chamou "Search Tools" e escreveu "my search didn't yield any Expo tools". Nenhuma ferramenta do Expo foi acionada.
- O certo: a resposta só vale se o painel mostrar a chamada. A apostila avisa que, sem ferramenta acionada, o agente respondeu de memória.

### 6. Copilot misturou outra língua na resposta
- Pedido: o mesmo prompt de verificação, em português.
- O que veio: a palavra "નોંધ" (gujarati, "nota") no meio do texto em português.
- Como percebi: leitura da resposta.
- O certo: a resposta inteira deveria estar em português.

### 7. Copilot ignorou a convenção de componentes do AGENTS.md
- Pedido: implementar só o primeiro critério (listar peças e looks).
- O que veio: os componentes `QueryStatus` e `ListsScreen` escritos dentro do `App.tsx`, sem a pasta `components/`.
- Como percebi: lendo o diff e comparando com o `AGENTS.md`, que diz "Componentes ficam em `components/`, um arquivo por componente".
- O certo: um arquivo por componente em `components/`. Depois de eu apontar, ele criou `PieceList.tsx`, `SavedLookList.tsx` e `QueryStatus.tsx`.

### 8. Copilot alterou arquivos fora do pedido
- Pedido: o mesmo do item 7.
- O que veio: depois de rodar `npx expo lint`, ele desinstalou o ESLint que o próprio comando tinha configurado (deixando `eslint.config.js` e o script `lint` para trás) e moveu o `QueryClientProvider` para o `index.ts`, que ninguém pediu para mudar.
- Como percebi: `git status` e `git diff` mostraram `index.ts` alterado e o ESLint sumindo do `package.json`.
- O certo: o `AGENTS.md` manda rodar `npx expo lint` antes de terminar, então o ESLint precisa ficar, e o pedido não envolvia o `index.ts`. Depois de eu apontar, ele reinstalou o ESLint e restaurou o `index.ts`.

### 9. Copilot adivinhou o texto do erro de rede
- Pedido: mostrar em português a mensagem de erro quando o back está fora do ar (critério 5).
- O que veio: uma comparação com os textos fixos "Network request failed" e "Failed to fetch" para decidir quando traduzir.
- Como percebi: testando no iPhone com o back desligado, a mensagem apareceu em inglês: "fetch failed: Could not connect to the server". O texto real não era nenhum dos dois.
- O certo: não depender do texto do erro. Qualquer falha lançada pelo `fetch` (que não seja timeout nem cancelamento) vira "Não foi possível conectar ao servidor". Só o teste no aparelho revelou o problema: lint e typecheck passavam.

## Resultado e próximos passos no TCC

### O que a prova de conceito demonstrou
Os 6 critérios do `CRITERIOS.md` passaram, verificados no iPhone com o Expo Go e o back do ZYRA rodando no computador.

- Lista atualizada sozinha: `useQuery` busca peças e looks. Depois de salvar ou apagar, o `onSuccess` do `useMutation` chama `invalidateQueries(['looks'])` e a lista é buscada de novo, sem eu escrever código de recarga.
- Back fora do ar ao atualizar: a query tenta de novo antes de desistir. Configurei 2 novas tentativas, com limite de 3 s por tentativa, para o erro aparecer em no máximo uns 10,5 s (com o padrão seriam 3 novas tentativas e cerca de 7 s de espera, sem limite para uma requisição pendurada). Enquanto isso, a última lista carregada continua na tela, porque o React Query mantém os dados em cache quando a nova busca falha.
- Back fora do ar ao salvar ou apagar: mutações não repetem por padrão, então o erro aparece na hora e a lista não muda. Quando o back volta, puxar a tela recarrega tudo sem fechar o app.
- O horário "Atualizado às" vem do `dataUpdatedAt` que o próprio React Query guarda: com o back fora do ar, ele fica parado, o que mostra que a lista na tela é a do cache.

### Limites que encontrei
- O cache fica só na memória: se o app recarregar com o back fora do ar, não há "última lista" para mostrar. Guardar o cache no aparelho exigiria um plugin de persistência, que ficou fora da PoC.
- No desenvolvimento, o Fast Refresh recria o `QueryClient` quando o `App.tsx` muda, e a lista para de se atualizar sozinha até um Reload completo. Não afeta o app em uso, mas confundiu os testes.
- O texto do erro de rede muda conforme a plataforma ("fetch failed: Could not connect to the server" no iOS), então a mensagem para o usuário não pode depender dele.
- O token de acesso vence em 1 hora e a PoC não renova.

### O que muda no TCC
- Trocar o `fetch` direto (`apiRequest`) por `useQuery` e `useMutation` nas telas de looks e peças do ZYRA, usando `invalidateQueries` em vez de recarregar a lista à mão.
- Criar o `QueryClient` em um arquivo separado, para não ser recriado pelo Fast Refresh.
- Tratar o token vencido (401) renovando com o refresh token.
- Avaliar a persistência do cache para mostrar os looks mesmo abrindo o app sem conexão.
