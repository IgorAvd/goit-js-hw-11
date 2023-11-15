import axios from 'axios';

const API_KEY = '40628787-b19937df0640d8f4069c69a27';
const BASE_URL = 'https://pixabay.com/api/';
// let currentPage = 1;

async function fetchImg(inputEl, page) {
  const searchParams = new URLSearchParams({
    key: API_KEY,
    q: inputEl,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    page: page,
    per_page: 40,
  });
  const resArr = await axios.get(`${BASE_URL}?${searchParams}`);

  return resArr;
}

export { fetchImg };
