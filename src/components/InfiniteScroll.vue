<template>
  <div id="app">
    <div class="header one-row-large">
      <img id="logo" class="logo" src="../assets/horizontal.png" alt="Logo">
    </div>
    <input :class="{ 'search-query': true, 'scrolled-search-query': scrolled }" class="one-row-small" type="text" v-model="searchQuery" placeholder="Buscar produtos...">
    <div class="item one-row-large" v-for="item in listItems" :key="item.id">
      <img class="thumbnail" :src="item.image" alt="Item Image">
      <div class="description">
        <h3>{{ item.name }}</h3>
        <p>{{ item.description }}</p>
      </div>
      <a class="shop-button" :href="item.link" target="_blank">Visit Webshop</a>
    </div>
    <div class="one-row-large" style="text-align: center;">
      <div v-if="endOfList">
        <p>Todos os itens carregados...</p>
        <p>Volte mais tarde pra encontrar novidades!</p>
      </div>
      <div v-else>
        <p>Carregando mais produtos incríveis</p>
      </div>
    </div>
    <infinite-loading @infinite="loadItems">
    </infinite-loading>
  </div>
</template>
<script lang="ts">
import { ref, onMounted, onUpdated, watch } from "vue";
import InfiniteLoading from "v3-infinite-loading";
import "v3-infinite-loading/lib/style.css";
import conteudo from '../conteudo/conteudo.json';
import type { Product } from './ProductType';

export default {
  name: 'InfiniteScroll',
  components: {
    InfiniteLoading,
  },
  setup() {
    const items = ref<Product[]>([]);
    const filteredItems = ref<Product[]>([]);
    const listItems = ref<Product[]>([]);
    let page = 1;
    let loadingPage = false;
    const itemsPerPage = 10;
    let hasMoreItems = true;
    const searchQuery = ref('');
    let scrolled = ref(false);
    let endOfList = ref(false);

    const loadItems = async ($state?: typeof InfiniteLoading) => {
      try {
        if (loadingPage || !hasMoreItems) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return;
        }
        loadingPage = true;

        const data = conteudo;
        items.value = data.products;

        applyFilter();

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const newItems = filteredItems.value.slice(startIndex, endIndex);

        if (page === 1 && filteredItems.value.length > endIndex) {
          listItems.value = [...newItems];
          page++;
          endOfList.value = false;
        } else if (page > 1 && filteredItems.value.length > endIndex) {
          listItems.value = [...listItems.value, ...newItems];
          page++;
          endOfList.value = false;
        } else if (page === 1) {
          listItems.value = [...newItems];
          hasMoreItems = false;
          endOfList.value = true;
        } else {
          listItems.value = [...listItems.value, ...newItems];
          hasMoreItems = false;
          endOfList.value = true;
        }
      } catch (error) {
        hasMoreItems = false;
      } finally {
        await new Promise(resolve => setTimeout(resolve, 20));
        loadingPage = false;
        if ($state) {
          $state.loaded();
        }
      }
    };

    const applyFilter = () => {
      if (searchQuery) {
        const searchTerm = searchQuery.value.toLowerCase();
        filteredItems.value = items.value.filter(item =>
          item.name.toLowerCase().includes(searchTerm) ||
          item.description.toLowerCase().includes(searchTerm)
        );
      } else {
        filteredItems.value = [...items.value];
      }
    };

    const resetPageAndLoad = () => {
      items.value = [];
      filteredItems.value = [];
      listItems.value = [];
      page = 1;
      loadingPage = false;
      hasMoreItems = true;
      loadItems();
    };

    const handleScroll = () => {
      scrolled.value = window.scrollY > 100;
    };

    onMounted(() => {
      window.addEventListener('scroll', handleScroll);
    });

    onUpdated(() => {
      window.addEventListener('scroll', handleScroll);
    });

    watch(searchQuery, () => {
      resetPageAndLoad();
    });

    return {
      listItems,
      loadItems,
      resetPageAndLoad,
      handleScroll,
      scrolled,
      searchQuery,
      hasMoreItems,
      endOfList
    };
  }
};
</script>