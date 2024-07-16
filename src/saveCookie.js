import { ref, watch, onMounted } from 'vue';

export default function useLocalStorage() {
  const localData = ref({});

  const getData = async () => {
    try {
      const storedData = localStorage.getItem('gameData');
      if (!storedData) {
        // Если данные отсутствуют в localStorage, получаем их с сервера
        const response = await fetch('/api/getCookieData');
        if (!response.ok) throw new Error('Ошибка при получении данных с сервера');
        const data = await response.json();
        localData.value = data;
        localStorage.setItem('gameData', JSON.stringify(data));
        console.log('Данные получены с сервера и сохранены в localStorage:', localData.value);
      } else {
        // Если данные есть в localStorage, используем их
        localData.value = JSON.parse(storedData);
        console.log('Данные получены из localStorage:', localData.value);
      }
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };

  const saveData = async (name, value) => {
    try {
      const response = await fetch('/api/saveData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...value }),
      });
      if (!response.ok) throw new Error('Ошибка при сохранении данных на сервер');
      const data = await response.json();
      // Проверяем, изменились ли данные перед обновлением
      localStorage.setItem('gameData', JSON.stringify(data));
      console.log('Данные сохранены на сервере и в localStorage:', localData.value);
    } catch (err) {
      console.error('Ошибка:', err);
    }
  };

  const updateLocalAndServer = () => {
    const gameData = localData.value;
    if (gameData) {
      saveData('gameData', gameData);
    }
  };

  onMounted(getData);

  watch(localData, updateLocalAndServer, { deep: true });

  return {
    localData,
    saveData,
    updateLocalAndServer
  };
}
