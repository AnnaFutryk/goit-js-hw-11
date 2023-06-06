import axios from 'axios';

export default class PhotosService {
  #BASE_URL = 'https://pixabay.com/api/';
  #API_KEY = '9122538-3a80db5de562f69d26380f61e';

  #BASE_SEARCH_PARAMS = {
    key: this.#API_KEY,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  };

  page = 1;
  q = null;
  per_page = 40;
  totalPages = 0;

  async getPhotos() {
    const searchParams = new URLSearchParams({
      ...this.#BASE_SEARCH_PARAMS,
      page: this.page,
      q: this.q,
      per_page: this.per_page,
    });
    return await axios.get(`${this.#BASE_URL}?${searchParams}`);
  }

  resetPage() {
    this.page = 1;
  }

  incrementPage() {
    this.page += 1;
  }
}
