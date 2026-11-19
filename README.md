# Movie List: Mustache vs. Vue

Uma lista de filmes buscada na [API do OMDb](https://www.omdbapi.com/) e exibida em cards do Bootstrap, feita de **duas formas** para comparar:

| Versão | HTML | JavaScript | Como renderiza |
| --- | --- | --- | --- |
| JS puro + Mustache | [`index.html`](index.html) | [`javascript/application.js`](javascript/application.js) | Você mesmo pega o template, preenche e insere no DOM |
| Vue 3 | [`vue.html`](vue.html) | [`javascript/vue.js`](javascript/vue.js) | Você muda os dados e o Vue atualiza o HTML sozinho |

Nas duas versões, o resultado na tela é o mesmo: um card por filme da busca "harry potter", com pôster, título, ano e link para o IMDb.

## Como rodar

O JavaScript usa `type="module"` e `importmap`, então **não dá para abrir o arquivo com duplo clique** (`file://`). É preciso um servidor local:

```bash
python3 -m http.server 8000
```

Depois abra:

- http://localhost:8000/index.html para a versão com Mustache
- http://localhost:8000/vue.html para a versão com Vue

(A extensão Live Server do VS Code também funciona.)

## O fluxo comum às duas versões

1. **Buscar os dados** com `fetch` na API do OMDb:
   ```js
   const response = await fetch("http://www.omdbapi.com/?s=harry potter&apikey=48727053");
   const data = await response.json();
   ```
2. A resposta tem a lista de filmes em `data.Search`. Cada filme é um objeto assim:
   ```json
   { "Title": "Harry Potter and the ...", "Year": "2001", "imdbID": "tt0241527", "Poster": "https://..." }
   ```
3. **Transformar cada filme em um card** de HTML. É aqui que as duas versões diferem.

## Versão 1: JS puro + Mustache

**`index.html`**
- O `importmap` diz ao navegador de onde vem o `"mustachejs"` (um CDN).
- Dentro de `#results` existe um `<template id="movieCardTemplate">`. O navegador **não exibe** o conteúdo de um `<template>`: ele só serve de molde.
- No molde, `{{Title}}`, `{{Year}}`, `{{Poster}}` e `{{imdbID}}` são lacunas com o mesmo nome das chaves do JSON da API.

**`javascript/application.js`**
```js
const results = document.querySelector("#results");                         // onde os cards vão entrar
const template = document.querySelector("#movieCardTemplate").innerHTML;    // o molde, como texto

data.Search.forEach((movie) => {
  const output = Mustache.render(template, movie);   // preenche as {{lacunas}} com os dados do filme
  results.insertAdjacentHTML("beforeend", output);   // insere o card pronto no fim de #results
});
```

Ou seja: **você** é responsável por percorrer a lista, gerar o HTML e colocá-lo na página. Se os dados mudassem depois, você teria que limpar e redesenhar tudo à mão.

## Versão 2: Vue 3

**`vue.html`**
- O `importmap` aponta `"vue"` para o build ESM do Vue no CDN.
- `<div id="app">` é a área que o Vue controla. Todo o resto da página é HTML normal.
- `v-cloak`, junto com o CSS `[v-cloak] { display: none; }`, esconde as `{{ }}` cruas até o Vue terminar de carregar.
- `v-if="movies.length === 0"` mostra "Loading..." enquanto a lista está vazia.
- `v-for="movie in movies"` repete o card para cada filme (é o equivalente ao `forEach` + `insertAdjacentHTML` da versão 1).
- Texto usa `{{ movie.Title }}`. **Atributos** usam `:` (atalho de `v-bind`), por exemplo `:src="movie.Poster"`, pois não se pode usar `{{ }}` dentro de atributos.

**`javascript/vue.js`**
```js
createApp({
  data() {
    return { movies: [] };          // estado reativo: começa vazio
  },
  async mounted() {                 // roda uma vez, quando o Vue assume o #app
    const response = await fetch("...");
    const data = await response.json();
    this.movies = data.Search;      // só isso: o v-for redesenha os cards sozinho
  }
}).mount("#app");
```

Aqui você **não mexe no DOM**. Você só atualiza `this.movies`, e o Vue percebe a mudança e re-renderiza o template.

## Comparando lado a lado

| Conceito | Mustache | Vue |
| --- | --- | --- |
| Onde fica o molde | `<template>` no HTML | O próprio HTML dentro de `#app` |
| Lacuna de texto | `{{Title}}` | `{{ movie.Title }}` |
| Lacuna em atributo | `src="{{Poster}}"` | `:src="movie.Poster"` |
| Repetir para cada item | `forEach` no JS | `v-for` no HTML |
| Inserir na página | `insertAdjacentHTML` manual | Automático |
| Estado de "carregando" | Não tem | `v-if="movies.length === 0"` |
| Quando os dados mudam | Redesenhar à mão | Atualiza sozinho (reatividade) |

## Ideias para praticar

- Adicionar um `<input>` de busca e trocar "harry potter" pelo texto digitado (no Vue, use `v-model`).
- Tratar o caso em que a busca não encontra nada (`data.Response === "False"`).
- Mostrar uma imagem padrão quando `Poster` vier como `"N/A"`.

## Observações

- A chave da API (`apikey=48727053`) é a de exemplo da aula. Para uso próprio, gere a sua em https://www.omdbapi.com/apikey.aspx.
- Baseado no boilerplate da [Le Wagon](https://github.com/lewagon/movie-list-boilerplate).
