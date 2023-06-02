import axios from "axios";

const URL = 'https://pixabay.com/api/';
const API_KEY = '9122538-3a80db5de562f69d26380f61e';

export default class PhotosService{
    constructor() {
        this.page = 1;
        this.perPage = 40;
        this.searchQuery = '';
        this.image_type = 'photo';
        this.orientation = 'horizontal';
        this.safesearch = true;
        this.totalPages = 0;
    }

    async getPhotos() {
        //   * axios await
        const { data } = await axios.get(
            `${URL}?key=${API_KEY}&q=${this.searchQuery}&image_type=${this.image_type}&orientation=${this.orientation}&safesearch=${this.safesearch}&page=${this.page}&per_page=${this.perPage}`);
            this.incrementPage();
            this.setTotal(data.totalHits);
            return data.hits;


        //* axios then
        // return axios
        // .get(
        //     `${URL}?key=${API_KEY}&q=${this.searchQuery}&image_type=${this.image_type}&orientation=${this.orientation}&safesearch=${this.safesearch}&page=${this.page}&per_page=${this.perPage}`)
            
        //     .then(({data}) => {
        //         this.incrementPage();
        //         this.setTotal(data.totalHits);
        //     return data.hits;
        //     });

        // return fetch(
        //     `${URL}?key=${API_KEY}&q=${this.searchQuery}&image_type=${this.image_type}&orientation=${this.orientation}&safesearch=${this.safesearch}&page=${this.page}&per_page=${this.perPage}`)
        //     .then(res => res.json())
        //     .then(({ hits, totalHits }) => {
        //         this.incrementPage();
        //         this.setTotal(totalHits);
        //     return hits;
        //     });
    }

    resetPage() {
        this.page = 1;
    }

    incrementPage() {
        this.page += 1;
    }

    setTotal(total) {
        this.totalPages = total;
    }

    hasMorePhotos() {
        return this.page < Math.ceil(this.totalPages / this.perPage);
    }


}