// "vue" vem do importmap no vue.html (aponta para o CDN do unpkg)
import { createApp } from "vue";

// createApp recebe um objeto de opções que descreve o app
createApp({
    // data() retorna o estado reativo: quando ele muda, o HTML se atualiza sozinho
    data() {
        return {
            movies: [] // começa vazio -> o template mostra "Loading..."
        };
    },

    // mounted() roda uma vez, logo depois que o Vue assume o #app no DOM
    // (é o lugar certo para buscar dados iniciais)
    async mounted() {
        // Busca filmes na API do OMDb
        const response = await fetch("http://www.omdbapi.com/?s=harry potter&apikey=48727053");
        const data = await response.json();

        // Basta atribuir ao estado: o v-for no HTML re-renderiza os cards
        // (sem insertAdjacentHTML / innerHTML manual, como no JS puro)
        this.movies = data.Search;
    }
}).mount("#app"); // conecta o app à <div id="app"> do vue.html
