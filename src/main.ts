import './assets/styles.css'

import { createApp } from 'vue'
import InfiniteLoading from "./InfiniteScroll.vue"

const app = createApp(InfiniteLoading)

app.mount('#app')

window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
});