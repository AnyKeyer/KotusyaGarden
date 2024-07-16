import fs from 'fs';

const requests = JSON.parse(fs.readFileSync('queries.json'));
console.log(requests);
const categoryCount = {};

// Считаем количество встречающихся категорий
requests.forEach(request => {
  request.categories.forEach(category => {
    categoryCount[category] = (categoryCount[category] || 0) + 1;
  });
});

// Сортируем категории по количеству встречающихся
const sortedCategories = Object.keys(categoryCount).sort((a, b) => categoryCount[b] - categoryCount[a]);

// Выводим наиболее часто встречающиеся категории
console.log('Наиболее часто встречающиеся категории:');
sortedCategories.forEach(category => {
  console.log(`${category}: ${categoryCount[category]} раз(а)`);
});